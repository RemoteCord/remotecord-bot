import type { DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import { type FileMulter } from "@/types/Multer";
import { Manager } from "socket.io-client";
import { AttachmentBuilder } from "discord.js";

export default class WsService {
	static async startWsServer(client: DiscordClient) {
		const manager = new Manager("wss://preview.luqueee.dev", {
			autoConnect: true,
			query: {
				secret: "ABC"
			}
		});

		const ws = manager.socket(`/bot`);

		manager.open((err) => {
			if (err) {
				Logger.error(`Error connecting to WebSocket server: ${err}`);
			} else {
				Logger.info("Connected to WebSocket server");
			}
		});

		ws.on("test", async (data: { controllerid: string; message: string }) => {
			const { controllerid, message } = data;

			const guilds = client.guilds.cache.map((guild) => guild.id);
			const clients = [];
			for (const guildId of guilds) {
				const guild = await client.guilds.fetch(guildId);
				const members = await guild.members.fetch();
				clients.push(...members.map((member) => member.user));
			}

			Logger.info("Fetched all clients", clients);

			const owner = await client.users.fetch(controllerid);
			Logger.info("Test event received", JSON.stringify(data), owner);

			if (owner) {
				await owner.send(message);
				Logger.info(`Message sent to owner with ID: ${controllerid}`);
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		});
		ws.on("downloadFile", async (data: { controllerid: string; file: FileMulter }) => {
			const { controllerid, file } = data;

			const fileSize = (file.size / 1024 / 1024).toFixed(2);

			const owner = await client.users.fetch(controllerid);
			Logger.info(
				"Test event received",
				owner,
				JSON.stringify({
					...file,
					buffer: []
				})
			);

			if (owner) {
				const attachment = new AttachmentBuilder(file.buffer, { name: file.originalname });
				const embed = {
					title: "File Received",
					description: `**client id:** ${controllerid} \n **file name:** ${file.originalname} \n **type:** ${file.mimetype} \n**file size:** ${fileSize} MB`,

					color: 0x00ff00
				};

				await owner.send({
					// content: `File from: ${controllerid}`,
					embeds: [embed],
					files: [attachment]
				});
				Logger.info(`File sent to owner with ID: ${controllerid}`);
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		});

		ws.on("message", async (content) => {
			Logger.info(`Received message from WebSocket server: ${content}`);

			// const data = JSON.parse(content.toString()); // { serverId: 'ID_DEL_SERVIDOR', content: 'MENSAJE' }

			// const {
			// 	id: serverid,
			// 	message
			// }: {
			// 	id: string;
			// 	message: string;
			// } = data;

			// const decline = new ButtonBuilder()
			// 	.setCustomId("decline")
			// 	.setLabel("Decline")
			// 	.setStyle(ButtonStyle.Danger);
			// const accept = new ButtonBuilder()
			// 	.setCustomId("accept")
			// 	.setLabel("Accept")
			// 	.setStyle(ButtonStyle.Success);

			// const embed = new EmbedBuilder()
			// 	.setAuthor({ name: "aaaa" })
			// 	.setDescription("aaaaa")
			// 	.setColor(0x23272a);
			// const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, decline);

			// // Directly send the message to the appropriate channel
			// const guild = client.guilds.cache.get(serverid);
			// if (guild) {
			// 	const channel = guild.channels.cache.get("1322962839803134200") as unknown as DMChannel;
			// 	if (channel) {
			// 		await channel.send({ components: [row], embeds: [embed] });
			// 		Logger.info(`Message sent to channel: ${channel.id}`);
			// 	} else {
			// 		Logger.warn(`Channel not found for ID: 1322962839803134200`);
			// 	}
			// } else {
			// 	Logger.warn(`Guild not found for ID: ${serverid}`);
			// }
		});

		ws.on("close", () => {
			Logger.warn("Disconnected from WebSocket server");
		});

		return ws;
	}
}
