import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Logger } from "@/shared/Logger";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import { DirEntry, type GetFilesFolder } from "@/types/Ws";
import {
	ActionRowBuilder,
	type AutocompleteInteraction,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";
import path from "path";
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

		ws.on("getFilesFolder", async (data: GetFilesFolder) => {
			try {
				const { files, controllerid, folder, relativepath } = data;

				// Logger.info("getFileFromClient", JSON.stringify(data));
				// const { buffer, metadata } = await ClientService.getFileFromClient(
				//   fileroute
				// );

				client.folderPath.set(controllerid, folder);

				console.log("folder", folder, relativepath);

				// client.relativeFolder = path.join(client.relativeFolder, relativepath);

				const owner = await client.users.fetch(controllerid);
				if (owner) {
					const foldersList = files.filter((file) => file.isDirectory).map((file) => file.name);

					const folders = foldersList.join("\n");
					const filesFilter = files
						.filter((file) => file.isFile)
						.map((file) => file.name)
						.join("\n");

					const embedFolders = {
						title: "Folders",
						description: folders,
						color: 0x00ff00
					};

					const embedFiles = {
						title: "Files",
						description: filesFilter,
						color: 0x00ff00
					};

					await owner.send({
						content: `File structure from: ${controllerid}`,
						embeds: [embedFolders, embedFiles]
					});
					Logger.info(`File structure sent to: ${controllerid}`);

					const select = new StringSelectMenuBuilder()
						.setCustomId("explorer-menu")
						.setPlaceholder("Move route!")
						.addOptions([
							new StringSelectMenuOptionBuilder().setLabel("back").setValue("back").setEmoji("⬅️"),
							...foldersList.map((folder) =>
								new StringSelectMenuOptionBuilder().setLabel(folder).setValue(folder)
							)
						]);

					const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
					// client.emit("messageCreate", );

					await owner.send({
						components: [row]
					});
				} else {
					Logger.warn(`Owner not found: ${controllerid}`);
				}
			} catch (error) {
				Logger.error("error");
			}
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
