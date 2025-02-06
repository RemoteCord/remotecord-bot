import type { DiscordClient } from "@/clients/DiscordClient";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Events, type Interaction } from "discord.js";
import { InteractionHandler } from "@/handlers/InteractionHandler";
// import { Logger } from "@/shared/Logger";
// import { PermissionHandler } from "@/handlers/PermissionHandler";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.InteractionCreate,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient, interaction: Interaction) => {
		console.log(
			`Running InteractionCreate event: Interaction type: ${interaction.type}`,
			`Is command: ${interaction.isCommand()}`,
			`Is button: ${interaction.isButton()}`,
			`Is chat input command: ${interaction.isChatInputCommand()}`,
			`Is string select menu: ${interaction.isStringSelectMenu()}`
			// interaction
		);

		if (interaction.isButton()) {
			await InteractionHandler.runButton(client, interaction);
		}

		if (interaction.isChatInputCommand()) {
			await InteractionHandler.runChatCommand(client, interaction);
		}
	};
}
