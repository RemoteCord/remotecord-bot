import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { ButtonWsServiceHandlers } from "@/services/ws/WsServiceHandlers";
import { emojis } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type AxiosError } from "axios";
import {
	ActionRowBuilder,
	type ButtonComponent,
	type ButtonInteraction,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle
} from "discord.js";
import { type Socket } from "socket.io-client";

export const buttonHandler = async (
	client: DiscordClient,
	interaction: ButtonInteraction,
	ws: Socket
) => {
	try {
		const wsServiceHandler = new ButtonWsServiceHandlers(client, ws, interaction);

		const controllerid = interaction.user.id;
		const { customId, data } = interaction.component as ButtonComponent;

		const owner = await client.users.fetch(controllerid);
		const dmChannel = await owner.createDM();

		if (interaction.customId.startsWith("screen-")) {
			const [, screen, messageid] = interaction.customId.split("-");

			Logger.info("Running screen button", screen, controllerid, messageid);

			const startDate = new Date();
			// await interaction.update({ withResponse: false });

			await interaction.update({});

			await dmChannel.messages.fetch(messageid).then(async (message) => {
				if (!message) return console.log("No message found.");
				// await message.delete();
				await message.edit({
					components: [],
					content: `${emojis.Loading} Sending screenshot request...`
				});
			});

			await HttpClient.axios
				.get({
					url: `/controllers/${controllerid}/send-screenshot?screenid=${screen}`,
					data: {
						screen
					}
				})
				.catch(async (err: unknown) => {
					const adapterError = (err as AxiosError).response?.data;
					Logger.error("Error sending screenshot", JSON.stringify(adapterError));
					await interaction.update({
						content: `${emojis.Error} Error sending screenshot`
					});

					if (adapterError.status === 409) {
						await interaction.update({
							content: `${emojis.Error} You are not authorized to run this command`
						});
					}
				});

			await wsServiceHandler.SendScreenshotToBot(startDate);
		}

		if (interaction.customId.startsWith("webcam-")) {
			const [, webcamId, messageid] = interaction.customId.split("-");

			await HttpClient.axios
				.get({
					url: `/controllers/${controllerid}/camera-screenshot?webcamId=${webcamId}`
				})
				.catch(async (err: unknown) => {
					const adapterError = (err as AxiosError).response?.data;
					Logger.error("Error sending screenshot webcam", JSON.stringify(adapterError));
					await interaction.update({
						content: `${emojis.Error} Error sending webcam screenshot`
					});

					if (adapterError.status === 409) {
						await interaction.update({
							content: `${emojis.Error} You are not authorized to run this command`
						});
					}
				});
		}

		if (interaction.customId === "explorer-files-download") {
			const modal = new ModalBuilder().setCustomId("download-modal").setTitle("Download File");

			const fileNameInput = new TextInputBuilder()
				.setCustomId("file-name")
				.setLabel("File Name")
				.setStyle(TextInputStyle.Short);

			const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fileNameInput);
			modal.addComponents(firstActionRow);

			await interaction.showModal(modal);
		}

		console.log("Running button", customId, data);
	} catch (err: unknown) {
		const adapterError = (err as AxiosError).response?.data;
		Logger.error("Error running button handler", err);
		await interaction.reply({
			content: `${emojis.Error} Error running button handler`,
			ephemeral: true
		});
	}
};
