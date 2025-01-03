import type { DiscordClient } from "@/clients/DiscordClient";
import { WsService, ClusterService } from "@/services";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Locales, LanguageFile } from "@/types/Language";
import { Events } from "discord.js";
import clusterWorker from "node:cluster";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.ClientReady,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient) => {
		console.log("Bot is ready", client.cluster.id);

		if (clusterWorker.isPrimary) {
			const cluster = new ClusterService(client);
			const ws = new WsService(client);
		}

		client.logger.info(
			client.i18n.get(Locales.en, LanguageFile.global, "ready_event_bot", {
				bot_tag: client.user?.tag || "Unknown"
			})
		);
	};
}
