import type { DiscordClient } from "@/clients/DiscordClient";
// import { WsService, ClusterService } from "@/services";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Events } from "discord.js";
// import clusterWorker from "node:cluster";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.ClientReady,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient) => {
		// console.log("Bot is ready", client.cluster.id);
		console.log("Bot is ready");

		// if (clusterWorker.isPrimary) {
		// 	new ClusterService(client);
		// 	new WsService(client);
		// }

		//
	};
}
