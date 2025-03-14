import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "activate",
			description: "Activate your account in our systems to get started.",
			category: "clients",
			aliases: ["register", "signup"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("activate")
				.setDescription("Activate your account in our systems to get started.")
		});
	}

	// Show embed of all clients and attach dropdown to select client
	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		// await handler.reply({
		// 	content: `Adding client...`,
		// 	ephemeral: true
		// });
	}
}
