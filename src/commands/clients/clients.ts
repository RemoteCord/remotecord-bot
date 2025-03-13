import type { DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "clients",
			description: "Display all friended clients.",
			category: "clients",
			aliases: ["Clients"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("clients")
				.setDescription("Display all friended clients.")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
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

		const embedClients = {
			title: "Clients",
			description: "All clients",
			fields: [
				{
					name: "Clients",
					value: clients.map((client) => `${client.clientid} - ${client.isactive}`).join("\n")
				}
			]
		};

		await handler.reply({
			content: `All clients`,
			embeds: [embedClients]
		});

		// await handler.reply({
		// 	content: ``,

		// 	ephemeral: true
		// });
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
