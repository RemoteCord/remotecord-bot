import type { DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import {
	ActionRowBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "connect",
			description: "Connect to a client you have friended",
			category: "clients",
			aliases: ["Connect, con"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("connect")
				.setDescription("Connect to a client you have friended.")
		});
	}

	// Show embed of all clients and attach dropdown to select client
	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		// get clients
		const ownerid = handler.user.id;
		const { clients } = await HttpClient.axios.get<{
			clients: Array<{
				clientid: string;
				isactive: boolean;
			}>;
		}>({
			url: `/controllers/${ownerid}/friends`
		});

		console.log(clients);

		// const owner = await client.users.fetch(ownerid);

		// Create embed & show
		const embedClients = {
			title: "Clients",
			description: "List of friended clients:",
			fields: [
				{
					name: "Clients",
					value: clients
						.filter((client) => client.isactive)
						.map((client) => client.clientid)
						.join("\n")
				}
			]
		};

		// await handler.reply({

		// });

		const components = [];

		const selectionClient = new StringSelectMenuBuilder()
			.setCustomId("client-select-menu")
			.setPlaceholder("Select a client")
			.addOptions(
				clients.map((client) =>
					new StringSelectMenuOptionBuilder().setLabel(client.clientid).setValue(client.clientid)
				)
			);

		const rowSelectionClient = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectionClient
		);

		components.push(rowSelectionClient);

		await handler.reply({
			content: `All clients`,
			embeds: [embedClients],
			components
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
