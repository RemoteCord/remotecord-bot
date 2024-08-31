import type { DiscordClient } from "@/clients/DiscordClient";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Events, type Interaction } from "discord.js";
import { InteractionHandler } from "@/handlers/InteractionHandler";
import { PermissionHandler } from "@/handlers/PermissionHandler";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.InteractionCreate,
			enabled: true,
			rest: false
		});
	}

	async run(client: DiscordClient, interaction: Interaction) {
		if (!interaction.isCommand()) return;

		if (interaction.isChatInputCommand())
			await InteractionHandler.runChatCommand(client, interaction);
	}
}
