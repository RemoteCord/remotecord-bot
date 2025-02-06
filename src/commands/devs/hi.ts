import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "hi",
			description: "hihi!",
			category: "devs",
			aliases: ["hello"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("hi").setDescription("hihi!")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		const createdTimestamp = (handler.message?.createdTimestamp ||
			handler.interaction?.createdTimestamp)!;

		await handler.reply({
			content: `🏓Latency is ${Date.now() - createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`
		});
	}
}