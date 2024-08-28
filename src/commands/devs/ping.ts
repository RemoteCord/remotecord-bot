import { type DiscordClient } from "@/clients/DiscordClient";
import { type CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Ping pong!",
			category: "devs",
			aliases: ["pong"],
			interaction: true,
			permissions: ["SEND_MESSAGES"],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("ping").setDescription("Ping pong!")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args) {
		const createdTimestamp = (handler.message?.createdTimestamp || handler.interaction?.createdTimestamp)!;

		await handler.reply({ content: `🏓Latency is ${Date.now() - createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms` });
	}
}
