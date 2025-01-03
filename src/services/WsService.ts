import type { DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	type DMChannel
} from "discord.js";

import WebSocket from "ws"; // Import WebSocket

export default class WsService {
	constructor(client: DiscordClient) {
		// const clusterId = (
		// 	await client.cluster.broadcastEval(
		// 		(client, { serverId }) =>
		// 			client.guilds.cache.has(serverId as string) ? client.cluster.id : null,
		// 		{ context: { serverId: data.id } }
		// 	)
		// )[0];

		this.startWsServer(client);
	}

	startWsServer(client: DiscordClient) {
		const ws = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT}?username=BOT`);

		ws.on("open", () => {
			Logger.info("Connected to WebSocket server");
		});

		ws.on("message", async (content) => {
			Logger.info(`Received message from WebSocket server: ${content}`);

			const data = JSON.parse(content.toString()); // { serverId: 'ID_DEL_SERVIDOR', content: 'MENSAJE' }

			const {
				id: serverid,
				message
			}: {
				id: string;
				message: string;
			} = data;

			// Buscar el cluster correspondiente

			const decline = new ButtonBuilder()
				.setCustomId("decline")
				.setLabel("Decline ")
				.setStyle(ButtonStyle.Danger);
			const accept = new ButtonBuilder()
				.setCustomId("accept")
				.setLabel("Accept")
				.setStyle(ButtonStyle.Success);

			const embed = new EmbedBuilder()
				.setAuthor({ name: "aaaa" })
				.setDescription("aaaaa")
				.setColor(0x23272a);
			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, decline);

			// Enviar mensaje al cluster correspondiente
			await client.cluster.broadcastEval(
				async (cluster, context) => {
					if (cluster.guilds.cache.has(context.serverid)) {
						// client.channels.cache.get(context.serverid)?.send(context.content);
						const guild = cluster.guilds.cache.get(context.serverid);
						// console.log("Sending message to server", guild?.channels.cache);

						const channel = guild?.channels.cache.get(
							"1322962839803134200"
						) as unknown as DMChannel;

						await channel.send({ components: [context.row], embeds: [context.embed] });

						console.log("Channel", channel);
					}
				},
				{
					context: {
						serverid,
						message,
						row,
						embed
					}
				}
			);

			// client.cluster.send({
			// 	type: "APPEAL",
			// 	serverid: data.id
			// });
		});

		ws.on("close", () => {
			Logger.warn("Disconnected from WebSocket server");
		});
	}
}
