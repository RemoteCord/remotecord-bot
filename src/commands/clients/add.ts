import type { DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "add",
			description: "Add a client as a friend.",
			category: "clients",
			aliases: ["add, add-client"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("add")
				.setDescription("Add a client as a friend.")
				.addStringOption((option) =>
					option.setName("add").setDescription("ID of the client to add").setRequired(true)
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