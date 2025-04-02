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
const verifyClientConnection = async (ownerid: string, interaction: Interaction) => {
	const { activeclient } = await HttpClient.axios
		.get<{
			activeclient: string | undefined;
		}>({
			url: `/controllers/${ownerid}`
		})
		.catch(() => ({ activeclient: undefined }));

	console.log(activeclient);
	if (!activeclient) {
		if (interaction.isRepliable()) {
			await interaction.reply({
				content: `${emojis.Warning} You must be connected to a client before executing that command.`
			});
		}
	}

	// return activeclient;
};

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

			const ownerid = interaction.user.id;

			if (interaction.isAutocomplete()) {
				await InteractionHandler.runAutocomplete(client, interaction);
			}

			if (interaction.isButton()) {
				await verifyClientConnection(ownerid, interaction);

				await InteractionHandler.runButton(client, interaction, ws);
			}

			if (interaction.isModalSubmit()) {
				await InteractionHandler.runModal(client, interaction, ws);
			}

			if (interaction.isChatInputCommand()) {
				// const command = client.commands.get(interaction.commandName);

				if (!GLOBAL_COMMANDS.includes(interaction.commandName)) {
					await verifyClientConnection(ownerid, interaction);
					// console.log(activeclient, interaction.commandName);
				}

				await InteractionHandler.runChatCommand(client, interaction, ws);
			}

			if (interaction.isStringSelectMenu()) {
				await InteractionHandler.runStringSelectMenu(client, interaction, ws);
			}
		} catch (err) {
			// if (err instanceof Error) {
			// 	Logger.error(err.message);
			// 	if (interaction.isRepliable()) {
			// 		await interaction.reply({
			// 			content: `${emojis.Error} An error occurred while executing this command. Are you connected to a client?`,
			// 			ephemeral: true
			// 		});
			// 	}
			// } else {
			// 	Logger.error(String(err));
			// 	if (interaction.isRepliable()) {
			// 		await interaction.reply({
			// 			content: `${emojis.Error} An error occurred while executing this command. Are you connected to a client?`,
			// 			ephemeral: true
			// 		});
			// 	}
			// }
		}
	};
}
