import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "cmd",
			description: "Execute a command on the client.",
			category: "commands",
			aliases: ["command, cli"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("cmd")
				.setDescription("Execute a command on the client.")
				.addStringOption((option) =>
					option.setName("command").setDescription("Command to execute").setRequired(true)
				)
		});
	}

	// Show embed of all clients and attach dropdown to select client
	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		// await handler.reply({
		// 	content: `Running command...`,
		// 	ephemeral: true
		// });
	}
}
