import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { emojis } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type GetFilesFolder } from "@/types/ws-events.types";
import { type ModalSubmitInteraction } from "discord.js";
import path from "path";
import { type Socket } from "socket.io-client";

export const modalHandler = async (
	client: DiscordClient,
	interaction: ModalSubmitInteraction,
	ws: Socket
) => {
	if (interaction.customId === "download-modal") {
		const controllerid = interaction.user.id;

		const currentPath = client.relativeFolder.get(controllerid) ?? "/";
		const folder = client.folderPath.get(controllerid) ?? "/";

		const fileName = interaction.fields.getTextInputValue("file-name");
		const fullPath = path.join(folder, path.join(currentPath, fileName));

		Logger.info("Running download modal", fileName, controllerid);

		void HttpClient.axios.post({
			url: `/controllers/${controllerid}/file`,
			data: {
				fileroute: fullPath,
				controllerid
			}
		});

		await interaction.reply({
			content: `${emojis.Loading} Downloading ${fileName}...`,
			ephemeral: true
		});

		ws.once("downloadFile", async (data: GetFilesFolder) => {
			await interaction.editReply({
				content: `${emojis.Success} Downloaded ${fileName}`
			});
		});
	}
};
