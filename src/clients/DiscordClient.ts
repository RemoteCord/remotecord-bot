import { CommandRegister } from "@/registers/CommandRegister";
import { EventRegister } from "@/registers/EventRegister";
import { WsService } from "@/services";
import { errorHandling } from "@/services/anticrash";
import { Logger } from "@/shared/Logger";
import type { Command } from "@/structures/Command";
import type { Config } from "@/types/config.types";
// import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { AllowedMentionsTypes, Client, Collection, GatewayIntentBits, Partials } from "discord.js";

export class DiscordClient extends Client {
	isOwner(id: string) {
		throw new Error("Method not implemented.");
	}

	public config: Config;
	public folderPath: Map<string, string>;

	public relativeFolder: Map<string, string>;
	public logger: typeof Logger;
	// public cluster: ClusterClient<DiscordClient>;

	public commands = new Collection<string, Command>();

	// Unused from orignal code. idk what these are for lol
	// public selectMenus = new Collection<string, Command>();
	// public buttons = new Collection<string, Command>();
	// public contextMenus = new Collection<string, Command>();
	// public modals = new Collection<string, Command>();

	constructor(config: Config) {
		super({
			// shards: getInfo().SHARD_LIST,
			// shardCount: getInfo().TOTAL_SHARDS,
			allowedMentions: {
				parse: [
					AllowedMentionsTypes.Everyone,
					AllowedMentionsTypes.Role,
					AllowedMentionsTypes.User
				],
				repliedUser: false
			},
			partials: [Partials.Channel, Partials.Message],
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.GuildIntegrations,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildModeration,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.DirectMessages,
				GatewayIntentBits.DirectMessagePolls
			]
		});

		this.logger = Logger;
		this.config = config;
		this.folderPath = new Map<string, string>();

		this.relativeFolder = new Map<string, string>();
		// console.log("DiscordClient constructor");
		// this.cluster = new ClusterClient(this);

		// console.log("DiscordClient constructor");
	}

	async start(): Promise<void> {
		const ws = await WsService.startWsServer(this);
		await CommandRegister.registerCommands(this);
		await EventRegister.discordEventRegister(this, ws);
		await CommandRegister.registerSlashApi(this);
		await errorHandling(this, {
			webhookUrl: "https://discord.com/api/webhooks/1364124042289877003/7vG5gGjCCyxwZos9HbS_44qLr7CQ4X0FWTLtzGTBt6hYdtnl9JtTk1QXFZfi_Zy68Yud"

		})

		await this.login(this.config.bot.TOKEN).catch((error: unknown) => this.logger.error(error));
	}
}
