import type { DiscordClient } from "@/clients/DiscordClient";
import type { ChatInputCommandInteraction } from "discord.js";
import { CommandHandler } from "./CommandHandler";
import { PermissionHandler } from "./PermissionHandler";

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
}
