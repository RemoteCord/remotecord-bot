import type { DiscordClient } from "@/clients/DiscordClient";
import {
	type ModalSubmitInteraction,
	type AutocompleteInteraction,
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type StringSelectMenuInteraction
} from "discord.js";
import { type Socket } from "socket.io-client";

import { runChatCommandHandler } from "./interactionHandler/chatCommandHandler";
import { selectHandler } from "./interactionHandler/selectHandler";
import { buttonHandler } from "./interactionHandler/buttonHandler";
import { modalHandler } from "./interactionHandler/modalHandler";
export class InteractionHandler {
	static async runChatCommand(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
		ws: Socket
	): Promise<void> {
		await runChatCommandHandler(client, interaction, ws);
	}

	static async runStringSelectMenu(
		client: DiscordClient,
		interaction: StringSelectMenuInteraction,
		ws: Socket
	): Promise<void> {
		await selectHandler(client, interaction, ws);
	}

	static async runButton(
		client: DiscordClient,
		interaction: ButtonInteraction,
		ws: Socket
	): Promise<void> {
		await buttonHandler(client, interaction, ws);
	}

	static async runAutocomplete(
		client: DiscordClient,
		interaction: AutocompleteInteraction
	): Promise<void> {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;
		// console.log("Running autocomplete", interaction, command);

		await command.autocomplete(interaction);
	}

	static async runModal(
		client: DiscordClient,
		interaction: ModalSubmitInteraction,
		ws: Socket
	): Promise<void> {
		await modalHandler(client, interaction, ws);
	}
}
