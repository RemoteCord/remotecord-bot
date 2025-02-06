import { Language } from "@/i18n/Language";
import { CommandRegister } from "@/registers/CommandRegister";
import { EventRegister } from "@/registers/EventRegister";
import { Logger } from "@/shared/Logger";
import type { Command } from "@/structures/Command";
import type { Config } from "@/types/Config";
import { ClusterClient, getInfo } from "discord-hybrid-sharding";
import { AllowedMentionsTypes, Client, Collection, GatewayIntentBits, Partials } from "discord.js";

export class DiscordClient extends Client {
	isOwner(id: string) {
		throw new Error("Method not implemented.");
	}

	public config: Config;
	public logger: typeof Logger;
	public i18n = Language;
	public cluster: ClusterClient<DiscordClient>;

	// public rainlink: Rainlink;

	public commands = new Collection<string, Command>();
	public selectMenus = new Collection<string, Command>();
	public buttons = new Collection<string, Command>();
	public contextMenus = new Collection<string, Command>();
	public modals = new Collection<string, Command>();

	constructor(config: Config) {
		super({
			shards: getInfo().SHARD_LIST,
			shardCount: getInfo().TOTAL_SHARDS,
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
				GatewayIntentBits.GuildModeration
			]
		});

		this.logger = Logger;
		this.config = config;
		// this.rainlink = new Rainlink({
		//   library: new Library.DiscordJS(this),
		//   nodes: this.config.lavalink.nodes
		// });
		this.cluster = new ClusterClient(this);
	}

	async start(): Promise<void> {
		await CommandRegister.registerCommands(this);
		await EventRegister.discordEventRegister(this);
		await CommandRegister.registerSlashApi(this);
		await this.login(this.config.bot.TOKEN).catch((error: unknown) => this.logger.error(error));
	}
}
