import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/permissions.types";
import { type AutocompleteInteraction, SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "get",
			description: "Download a file from the client",
			category: "commands",
			aliases: ["Get"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("get")
				.setDescription("Download a file from the client")
				.addStringOption((option) =>
					option.setName("route").setDescription("The file path").setRequired(true)
				)
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

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		await handler.reply({
			content: `File get!`,

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
