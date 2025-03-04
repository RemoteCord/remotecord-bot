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
			name: "current-client",
			description: "Display the client you are currently connected to.",
			category: "clients",
			aliases: ["whoami, currentclient, who"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("current-client")
				.setDescription("Display the client you are currently connected to.")
		});
	}

	// Show embed of all clients and attach dropdown to select client
	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		// get clients
		const ownerid = handler.user.id;
		const { data } = await HttpClient.axios.get<{
			data: {
				client: {
					id: string;
				};
			};
		}>({
			url: `/controllers/${ownerid}/current-client`
		});

		console.log(data);

		// const owner = await client.users.fetch(ownerid);

		// Create embed & show
		const embedClients = {
			title: "Current client",
			description: "The client you are currently connected to is:",
			fields: [
				{
					name: "Clients",
					value: data.client.id
				}
			]
		};

		await handler.reply({
			content: `You are currently connected to:`,
			embeds: [embedClients]
		});
	}
}

// console.log("running ban command");

// await handler.send({
// 	content: `Are you sure you want to ban ${handler.user.tag}?`
// });

// const confirm = new ButtonBuilder()
// 	.setCustomId("confirm")
// 	.setLabel("Confirm Ban")
// 	.setStyle(ButtonStyle.Danger);
// const cancel = new ButtonBuilder()
// 	.setCustomId("cancel")
// 	.setLabel("Cancel")
// 	.setStyle(ButtonStyle.Secondary);

// const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cancel, confirm);

// // const embed = new EmbedBuilder()
// // 	.setAuthor({ name: "| Añadida a la cola", iconURL: handler.user.displayAvatarURL() })
// // 	.setDescription(
// // 		result.type === "PLAYLIST"
// // 			? `Añadidas ${result.tracks.length} de **[${result.playlistName}](${query})**`
// // 			: `Canción: **[${result.tracks[0].title} - ${result.tracks[0].author}](${result.tracks[0].uri})**`
// // 	)
// // 	.setColor(0x23272a);

// await handler.reply({
// 	content: `Are you sure you want to ban ${handler.user.tag}?`,
// 	components: [row],
// 	ephemeral: true
// });
