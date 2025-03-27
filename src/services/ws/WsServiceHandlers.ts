import { type DiscordClient } from "@/clients/DiscordClient";
import { emojis } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type ButtonInteraction, type ChatInputCommandInteraction } from "discord.js";
import { type Socket } from "socket.io-client";

export class ChatWsServiceHandlers {
	constructor(
		private readonly client: DiscordClient,
		private readonly ws: Socket,
		private readonly interaction: ChatInputCommandInteraction
	) {
		void this.GetTasksFromClient();
		void this.GetScreensFromClient();
	}

	async GetTasksFromClient() {
		this.ws.once("getTasksFromClient", async () => {
			Logger.info("Tasks loaded socket event");
			await this.interaction.editReply({
				content: `${emojis.Success} Tasks loaded.`
			});
		});
	}

	async GetScreensFromClient() {
		this.ws.once("sendScreensToBot", async () => {
			Logger.info("Screens loaded socket event");
			await this.interaction.deleteReply();
		});
	}
}

export class ButtonWsServiceHandlers {
	constructor(
		private readonly client: DiscordClient,
		private readonly ws: Socket,
		private readonly interaction: ButtonInteraction
	) {}

	async SendScreenshotToBot(startDate: Date) {
		this.ws.once("sendScreenshotToBot", async () => {
			const endDate = new Date();
			const seconds = (endDate.getTime() - startDate.getTime()) / 1000;

			await this.interaction.editReply({
				content: `${emojis.Success} Screenshot recived in ${seconds} seconds!`
			});
		});
	}
}
