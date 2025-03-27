import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/permissions.types";
import { type AutocompleteInteraction, SlashCommandBuilder } from "discord.js";
import { type Socket } from "socket.io-client";

export default class extends Command {
	constructor() {
		super({
			name: "explorer",
			description: "Open the file explorer",
			category: "commands",
			aliases: ["Explorer"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("explorer")
				.setDescription("open the file explorer!")

				.addStringOption((option) =>
					option
						.setName("folder")
						.setDescription("The folder of the file")
						.setRequired(true)
						.setAutocomplete(true)
				)
		});
	}

	async autocomplete(interaction: AutocompleteInteraction) {
		console.log("Running autocomplete", interaction.options.getFocused());
		const focusedValue = interaction.options.getFocused();
		const choices = ["Desktop", "Documents", "Downloads"];
		const filtered = choices.filter((choice) => choice.startsWith(focusedValue));
		await interaction.respond(filtered.map((choice) => ({ name: choice, value: choice })));
	}

	async run(
		client: DiscordClient,
		handler: CommandHandler,
		ws: Socket,
		...args: any[]
	): Promise<void> {
		// console.log("Running chat command", JSON.stringify(ws));
		// ws.removeAllListeners("getFilesFolder");
	}
}
