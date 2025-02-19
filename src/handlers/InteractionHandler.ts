import type { DiscordClient } from "@/clients/DiscordClient";
import type { ButtonComponent, ButtonInteraction, ChatInputCommandInteraction } from "discord.js";
import { CommandHandler } from "./CommandHandler";
import { PermissionHandler } from "./PermissionHandler";
import { type Socket } from "socket.io-client";
import HttpClient from "@/clients/HttpClient";

export class InteractionHandler {
	static async runChatCommand(
		client: DiscordClient,
		interaction: ChatInputCommandInteraction,
		ws: Socket
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

		console.log("Running chat command", interaction.commandName);

		if (interaction.commandName === "upload") {
			const file = interaction.options.getAttachment("file");
			const controllerid = interaction.user.id;

			void HttpClient.axios.post({
				url: "/bot/files/send",
				data: {
					fileurl: file?.url,
					controllerid
				}
			});
		}

		const handler = new CommandHandler({
			client,
			interaction,
			color: client.config.colors.burple,
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
	}
}
