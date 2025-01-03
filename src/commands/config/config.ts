import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import {
	ActionRowBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "config",
			description: "Config bot!",
			category: "config",
			aliases: ["Config"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("config").setDescription("User id for appeal!")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		const channels = handler.guild?.channels.cache.filter((channel) => channel.type === 0);

		// console.log(channels);

		const select = new StringSelectMenuBuilder()
			.setCustomId("channel")
			.setPlaceholder("Set server for appeals!")
			.addOptions(
				channels
					? channels.map((channel) =>
							new StringSelectMenuOptionBuilder().setLabel(channel.name).setValue(channel.id)
						)
					: []
			);

		const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
		// const embed = new EmbedBuilder()
		// 	.setAuthor({ name: "| Añadida a la cola", iconURL: handler.user.displayAvatarURL() })
		// 	.setDescription(
		// 		result.type === "PLAYLIST"
		// 			? `Añadidas ${result.tracks.length} de **[${result.playlistName}](${query})**`
		// 			: `Canción: **[${result.tracks[0].title} - ${result.tracks[0].author}](${result.tracks[0].uri})**`
		// 	)
		// 	.setColor(0x23272a);
		await handler.reply({
			content: `Are you sure you want to ban ${handler.user.tag}?`,
			components: [row],
			ephemeral: true
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
