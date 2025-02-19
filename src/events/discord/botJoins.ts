import type { DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
// import { WsService, ClusterService } from "@/services";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Events } from "discord.js";
import { type Socket } from "socket.io-client";
// import clusterWorker from "node:cluster";

const { SERVER_ID, SERVER_INVITE } = process.env;

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.GuildCreate,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient, ws: Socket) => {
		// console.log("Bot is ready", client.cluster.id);
		const guild = client.guilds.cache.last();

		if (guild?.id) {
			const owner = await client.users.fetch(guild?.ownerId);

			const { id } = guild;
			Logger.info(`Bot Joins to server ${id}`, client);
			if (id !== SERVER_ID) {
				await owner.send(`Join to ${SERVER_INVITE} to use the bot`);
				void guild.leave();
			}
		} else {
			void guild?.leave();
		}

		// if (clusterWorker.isPrimary) {
		// 	new ClusterService(client);
		// 	new WsService(client);
		// }

		//
	};
}
