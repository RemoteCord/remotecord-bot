import { type DiscordClient } from "@/clients/DiscordClient";
import { emojis } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type WsScreensToBot, type WsTasksFromClient } from "@/types/ws-events.types";
import { type ButtonInteraction, type ChatInputCommandInteraction } from "discord.js";
import { type Socket } from "socket.io-client";

export class ChatWsServiceHandlers {
	private readonly owner: string;
	constructor(
		private readonly client: DiscordClient,
		private readonly ws: Socket,
		private readonly interaction: ChatInputCommandInteraction
	) {
		this.owner = this.interaction.user.id;
		void this.GetTasksFromClient();
		// void this.GetScreensFromClient();
	}

	async GetTasksFromClient() {
		// this.ws.removeAllListeners("getTasksFromClient");
		this.ws.on("getTasksFromClient", async (data: WsTasksFromClient) => {
			const { controllerid } = data;
			Logger.info("Tasks loaded socket event", this.owner, controllerid);
			if (this.owner !== controllerid) return;

			await this.interaction.editReply({
				content: `${emojis.Success} Tasks loaded.`
			});
		});
	}

	async GetScreensFromClient(id: string) {
		try {
			this.ws.on("sendScreensToBot", async (data: WsScreensToBot) => {
				const { controllerid } = data;

				if (this.owner !== controllerid) return;
				Logger.info("Screens loaded socket event");
				// await this.interaction.editReply(`${emojis.Success} Screens loaded.`);

				const user = this.client.users.cache.get(controllerid);

				if (!user) return console.log("No user found.");

				console.log("User", user);
				const dmChannel = await user.createDM();
				if (!dmChannel) return console.log("No DM channel found.");
				console.log("DM Channel", dmChannel);

				await dmChannel.messages.fetch(id).then(async (message) => {
					if (!message) return console.log("No message found.");
					await message.edit({
						content: `${emojis.Success} Screens loaded.`
					});
				});

				// const message = await channel.fetch(true);
				// console.log("Message", message);
				// console.log("Channel", channel.isDMBased());
				// const message = await user.dmChannel?.messages.fetch(id);
				// console.log("Message", message);
				// // message.;
				// if (message) {
				// 	await message.edit({
				// 		content: `${emojis.Success} Screens loaded.`,
				// 		embeds: [
				// 			{
				// 				title: "Screens",
				// 				description: `Screens loaded from ${controllerid}`
				// 				// color: this.client.config.colors.burple
				// 			}
				// 		]
				// 	});
				// }
			});
		} catch (error) {
			Logger.error("Error in GetScreensFromClient", error);
			// await this.interaction.editReply({
			// 	content: `${emojis.Error} Error loading screens.`
			// });
		}
	}
}

export class ButtonWsServiceHandlers {
	private readonly owner: string;
	constructor(
		private readonly client: DiscordClient,
		private readonly ws: Socket,
		private readonly interaction: ButtonInteraction
	) {
		this.owner = this.interaction.user.id;
	}

	async SendScreenshotToBot(startDate: Date) {
		this.ws.on("sendScreenshotToBot", async (data: WsScreensToBot) => {
			const { controllerid } = data;
			if (this.owner !== controllerid) return;
			const endDate = new Date();
			const seconds = (endDate.getTime() - startDate.getTime()) / 1000;

			await this.interaction.editReply({
				content: `${emojis.Success} Screenshot received in ${seconds} seconds!`
			});
		});
	}
}
