import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { ButtonWsServiceHandlers } from "@/services/ws/WsServiceHandlers";
import { emojis } from "@/shared";
import { Logger } from "@/shared/Logger";
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
	const wsServiceHandler = new ButtonWsServiceHandlers(client, ws, interaction);

	const { customId, data } = interaction.component as ButtonComponent;
	const controllerid = interaction.user.id;

	if (interaction.customId.includes("screen-")) {
		const screen = interaction.customId.split("-")[1];

		Logger.info("Running screen button", screen, controllerid);

		const startDate = new Date();
		void HttpClient.axios.get({
			url: `/controllers/${controllerid}/send-screenshot?screenid=${screen}`,
			data: {
				screen
			}
		});

		await interaction.reply({
			content: `${emojis.Loading} Sending screenshot request...`
		});

		await wsServiceHandler.SendScreenshotToBot(startDate);
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
};
