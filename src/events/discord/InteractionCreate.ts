import type { DiscordClient } from "@/clients/DiscordClient";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { ChannelType, Events, type Interaction } from "discord.js";
import { InteractionHandler } from "@/handlers/InteractionHandler";
import { type Socket } from "socket.io-client";
import HttpClient from "@/clients/HttpClient";
import { emojis } from "@/shared";
// import { Logger } from "@/shared/Logger";
// import { PermissionHandler } from "@/handlers/PermissionHandler";

export const GLOBAL_COMMANDS = ["connect", "clients", "add-client", "delete-client", "activate", "stats"]; // Commands that do not need a client connection
export const ALLOWED_COMMANDS_OUTSIDE_DM = ["activate", "stats"]


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

export const verifyInteractionIsAllowed = async (interaction: Interaction) => {
	if (interaction.channel?.type !== ChannelType.DM) {

		if (interaction.isChatInputCommand() && ALLOWED_COMMANDS_OUTSIDE_DM.includes(interaction.commandName)) {

			return true
		}

		if (interaction.isRepliable()) {
			await interaction.reply({
				content: `${emojis.Warning} This command can only be used in DMs.`,
				flags: ["Ephemeral"]
			});
			return false;
		}
	}

	return true;
}

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.InteractionCreate,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient, ws: Socket, interaction: Interaction) => {

		// const { client } = this;
		console.log(
			`Running InteractionCreate event: Interaction type: ${interaction.type}`,
			`Is command: ${interaction.isCommand()}`,
			`Is button: ${interaction.isButton()}`,
			`Is chat input command: ${interaction.isChatInputCommand()}`,
			`Is string select menu: ${interaction.isStringSelectMenu()}`,
			`Is modal: ${interaction.isModalSubmit()}`,
			`Is DM: ${interaction.channel?.type}`,
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

			if (!(await verifyInteractionIsAllowed(interaction))) return;

			if (!GLOBAL_COMMANDS.includes(interaction.commandName)) {
				await verifyClientConnection(ownerid, interaction);
				// console.log(activeclient, interaction.commandName);
			}

			await InteractionHandler.runChatCommand(client, interaction, ws);
		}

		if (interaction.isStringSelectMenu()) {
			await InteractionHandler.runStringSelectMenu(client, interaction, ws);
		}

	};
}
