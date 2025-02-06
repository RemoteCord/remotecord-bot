import type { DiscordClient } from "@/clients/DiscordClient";
import type {
	ButtonComponent,
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction
} from "discord.js";
import { CommandHandler } from "./CommandHandler";
import { PermissionHandler } from "./PermissionHandler";
import HttpClient from "@/clients/HttpClient";

export class InteractionHandler {
	static async runChatCommand(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction
	): Promise<void> {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;

		const permissionHandler = new PermissionHandler({ client, interaction });
		const permissionError = await permissionHandler.checkPermissions({
			botPermission: command.botPermissions,
			userPermission: command.userPermissions,
			customPermissions: command.customPermissions
		});

		if (permissionError) {
			await interaction.reply({
				content: permissionError,
				ephemeral: true
			});
			return;
		}

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
			await interaction.reply({
				content: "There was an error while executing this command!",
				ephemeral: true
			});
		}
	}

	static async runButton(client: DiscordClient, interaction: ButtonInteraction): Promise<void> {
		const { customId, data } = interaction.component as ButtonComponent;
		console.log("Running button", customId, data);

		if (customId === "confirm")
			await interaction.reply({
				content: "Confirmed!",
				ephemeral: true
			});
	}

	static async runSetAppealChannel(
		client: DiscordClient,
		interaction: StringSelectMenuInteraction
	): Promise<void> {
		const value = interaction.values[0];
		const { customId } = interaction;

		console.log("Running button", value, customId);

		if (customId === "channel")
			await HttpClient.axios
				.post({
					url: "/config/appealschannel",
					data: {
						server_id: interaction.guildId,
						channel_id: value
					}
				})
				.then((data) => console.log(data));

		await interaction.reply({
			content: "Confirmed!",
			ephemeral: true
		});
	}
}
