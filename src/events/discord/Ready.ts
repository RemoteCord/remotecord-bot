import type { DiscordClient } from "@/clients/DiscordClient";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Locales, LanguageFile } from "@/types/Language";
import { Events } from "discord.js";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.ClientReady,
			enabled: true,
			rest: false
		});
	}

	async run(client: DiscordClient) {
		client.logger.info(
			client.i18n.get(Locales.en, LanguageFile.global, "ready_event_bot", {
				bot_tag: client.user?.tag || "Unknown"
			})
		);
	}
}
