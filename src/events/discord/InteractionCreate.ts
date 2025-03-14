import type { DiscordClient } from "@/clients/DiscordClient";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Events, type Interaction } from "discord.js";
import { InteractionHandler } from "@/handlers/InteractionHandler";
import { type Socket } from "socket.io-client";
import HttpClient from "@/clients/HttpClient";
import { Logger } from "@/shared/Logger";
import { emojis } from "@/shared";
// import { Logger } from "@/shared/Logger";
// import { PermissionHandler } from "@/handlers/PermissionHandler";

const GLOBAL_COMMANDS = ["connect", "clients", "add", "activate"]; // Commands that do not need a client connection

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.InteractionCreate,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient, ws: Socket, interaction: Interaction) => {
		try {
			// const { client } = this;
			console.log(
				`Running InteractionCreate event: Interaction type: ${interaction.type}`,
				`Is command: ${interaction.isCommand()}`,
				`Is button: ${interaction.isButton()}`,
				`Is chat input command: ${interaction.isChatInputCommand()}`,
				`Is string select menu: ${interaction.isStringSelectMenu()}`,
				`Is modal: ${interaction.isModalSubmit()}`
				// ws
			);

			if (interaction.isAutocomplete()) {
				await InteractionHandler.runAutocomplete(client, interaction);
			}

			if (interaction.isButton()) {
				await InteractionHandler.runButton(client, interaction);
			}

			if (interaction.isModalSubmit()) {
				await InteractionHandler.runModal(client, interaction, ws);
			}

			if (interaction.isChatInputCommand()) {
				const ownerid = interaction.user.id;
				// const command = client.commands.get(interaction.commandName);

				const { activeclient } = await HttpClient.axios.get<{
					activeclient: string[];
				}>({
					url: `/controllers/${ownerid}`
				});
				console.log(activeclient, interaction.commandName);

				if (!activeclient && !GLOBAL_COMMANDS.includes(interaction.commandName)) {
					await interaction.reply({
						content: `${emojis.Warning} You must be connected to a client before executing that command.`
					});
				} else {
					await InteractionHandler.runChatCommand(client, interaction, ws);
				}
			}

			if (interaction.isStringSelectMenu()) {
				await InteractionHandler.runStringSelectMenu(client, interaction);
			}
		} catch (err) {
			if (err instanceof Error) {
				Logger.error(err.message);

				if (interaction.isRepliable()) {
					await interaction.reply({
						content: `${emojis.Error} An error occurred while executing this command. Are you connected to a client?`,
						ephemeral: true
					});
				}
			} else {
				Logger.error(String(err));

				if (interaction.isRepliable()) {
					await interaction.reply({
						content: `${emojis.Error} An error occurred while executing this command. Are you connected to a client?`,
						ephemeral: true
					});
				}
			}
		}
	};
}
