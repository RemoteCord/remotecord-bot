import { type DiscordClient } from "@/clients/DiscordClient";
import { embeds } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type WsDownloadFile } from "@/types/ws-events.types";
import { type FileMulterWs } from "@/types/ws.types";
import { AttachmentBuilder } from "discord.js";

export class WsFilesEvents {
	constructor(private readonly client: DiscordClient) {}

	getImageFromClient = async (data: FileMulterWs) => {
		const { controllerid, file } = data;

		const fileSize = (file.metadata.size / 1024 / 1024).toFixed(2);

		Logger.info(
			"Received image from client",
			JSON.stringify(file.metadata),
			"to controller",
			controllerid
		);

		const owner = await this.client.users.fetch(controllerid);
		if (owner) {
			try {
				const attachment = new AttachmentBuilder(Buffer.from(file.buffer), {
					name: file.metadata.filename
				});

				const embed = {
					title: "File Received",
					description: `**file name:** ${file.metadata.filename} \n **type:** ${file.metadata.format} \n**file size:** ${fileSize} MB`,

					color: embeds.Colors.default
				};

				await owner.send({
					content: `Image from: ${controllerid}`,
					embeds: [embed],
					files: [attachment]
				});
				Logger.info(`Image sent to owner with ID: ${controllerid}`);
			} catch (error) {
				Logger.error("Error sending image", error);
				await owner.send({
					content: `Error sending image from: ${controllerid}`
				});
			}
		} else {
			Logger.warn(`Owner not found for ID: ${controllerid}`);
		}
	};

	reciveFile = async (data: WsDownloadFile) => {
		const { controllerid, file, fileMetadata } = data;
		console.log("File data", data);
		const owner = await this.client.users.fetch(controllerid);

		try {
			if (owner) {
				if (fileMetadata.size < 10485760) {
					console.log(file, file.split("/").pop());
					await owner.send({
						files: [
							{
								attachment: file,
								name: fileMetadata.filename
							}
						]
					});
				} else {
					Logger.info("File too large, only sending link");
					const embed = {
						title: "File Download Link",
						// description: `[Click here to download the file](${file})`,
						description: `${file}`,
						color: embeds.Colors.default,
						timestamp: new Date().toISOString()
					};
					await owner.send({ embeds: [embed] });

					// Logger.info(`File sent to owner with ID: ${controllerid}`);
				}
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		} catch (error) {
			Logger.error("Error sending file", error);
		}
	};
}
