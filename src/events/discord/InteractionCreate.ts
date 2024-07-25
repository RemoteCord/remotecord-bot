import type { DiscordClient } from "@/clients/DiscordClient";
import { Event } from "@/structures/Event";
import { type ChatInputCommandInteraction, Events, type Interaction } from "discord.js";
import { CommandHandler } from "@/handlers/CommandHandler";

export default class extends Event {
	constructor() {
		super({
			name: Events.InteractionCreate,
			enabled: true,
			rest: false
		});
	}

	async run(client: DiscordClient, interaction: Interaction) {
		if (interaction.isCommand()) {
			interaction = interaction as ChatInputCommandInteraction;

			const command = client.commands.get(interaction.commandName);

			if (!command) return;

			const handler = new CommandHandler({
				client,
				interaction,
				color: client.config.colors.burple,
				language: client.config.bot.LANGUAGE,
				prefix: client.config.bot.PREFIX
			});

			try {
				await command.run(client, handler);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: "There was an error while executing this command!", ephemeral: true });
			}
		}
	}
}
