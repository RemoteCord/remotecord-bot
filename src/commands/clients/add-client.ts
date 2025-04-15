import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "add-client",
			description: "Add a client as a friend.",
			category: "clients",
			aliases: ["add-client"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("add-client")
				.setDescription("Add a client as a friend.")
				.addStringOption((option) =>
					option.setName("id").setDescription("ID of the client to add").setRequired(true)
				)
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
