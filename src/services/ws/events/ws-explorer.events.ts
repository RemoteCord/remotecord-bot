import { type DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import { type GetFilesFolder } from "@/types/ws-events.types";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder
} from "discord.js";
import path from "path";

export class WsExplorerEvents {
	constructor(private readonly client: DiscordClient) {}

	getExplorer = async (data: GetFilesFolder) => {
		try {
			const { files, controllerid, folder, relativepath } = data;

			// Logger.info("getFileFromClient", JSON.stringify(data));
			// const { buffer, metadata } = await ClientService.getFileFromClient(
			//   fileroute
			// );

			this.client.folderPath.set(controllerid, folder);

			console.log("folder", folder, relativepath, files);

			// client.relativeFolder = path.join(client.relativeFolder, relativepath);

			const owner = await this.client.users.fetch(controllerid);
			if (owner) {
				const foldersList = files.filter((file) => file.isDirectory).map((file) => file.name);
				const filesList = files
					.filter((file) => file.isFile)
					.filter((file) => file.size / (1024 * 1024) <= 1000)
					.sort((a, b) => {
						const fileA = files.find((f) => f.name === a.name);
						const fileB = files.find((f) => f.name === b.name);
						return (fileB?.size || 0) - (fileA?.size || 0); // Changed order here
					})
					.slice(0, 50)
					.map((file) => `\`\`\`${file.name}\`\`\` *${(file.size / (1024 * 1024)).toFixed(3)} MB*`);
				const folders = foldersList.join("\n");

				const embedFolders = {
					title: "Folders",
					description: folders,
					color: 0x00ff00
				};

				const embedFiles = {
					title: "Files",
					description: filesList.join("\n") + (filesList.length > 50 ? "\n..." : ""),
					color: 0x00ff00
				};

				const currentPath = this.client.relativeFolder.get(controllerid) ?? "/";
				const folder = this.client.folderPath.get(controllerid) ?? "/";
				const fullPath = path.join(folder, currentPath);

				await owner.send({
					content: `📌 You are in: \`${fullPath}\``,
					embeds: [embedFolders, embedFiles]
				});
				Logger.info(`File structure sent to: ${controllerid}`);

				const components = [];

				const selectFolders = new StringSelectMenuBuilder()
					.setCustomId("explorer-menu")
					.setPlaceholder("Move route!")
					.addOptions([
						new StringSelectMenuOptionBuilder().setLabel("back").setValue("back").setEmoji("⬅️"),
						...foldersList.map((folder) =>
							new StringSelectMenuOptionBuilder().setLabel(folder).setValue(folder)
						)
					]);
				const rowFolder = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
					selectFolders
				);

				components.push(rowFolder);

				if (filesList.length > 0) {
					const downloadButton = new ButtonBuilder()
						.setCustomId("explorer-files-download")
						.setLabel("Download a file")
						.setStyle(ButtonStyle.Primary);

					const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(downloadButton);

					components.push(actionRow);
				}

				// client.emit("messageCreate", );

				await owner.send({
					components
				});
			} else {
				Logger.warn(`Owner not found: ${controllerid}`);
			}
		} catch (error) {
			Logger.error("error", error);
		}
	};
}
