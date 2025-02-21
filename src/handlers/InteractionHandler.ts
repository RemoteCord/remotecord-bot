import type { DiscordClient } from "@/clients/DiscordClient";
import type {
	AutocompleteInteraction,
	ButtonComponent,
	ButtonInteraction,
	ChatInputCommandInteraction,
	StringSelectMenuInteraction
} from "discord.js";
import { CommandHandler } from "./CommandHandler";
import { PermissionHandler } from "./PermissionHandler";
import { type Socket } from "socket.io-client";
import HttpClient from "@/clients/HttpClient";
import { Logger } from "@/shared/Logger";
import * as path from "path";
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

		const handler = new CommandHandler({
			client,
			interaction,
			color: client.config.colors.burple,
			prefix: client.config.bot.PREFIX
		});

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

		if (interaction.commandName === "get") {
			Logger.info("Running get command", interaction.commandName);
			const controllerid = interaction.user.id;
			const route = interaction.options.getString("route");
			void HttpClient.axios.post({
				url: "/bot/files/get",
				data: {
					fileroute: route,
					controllerid
				}
			});
		}

		if (interaction.commandName === "explorer") {
			const controllerid = interaction.user.id;
			const folder = interaction.options.getString("folder");

			if (!folder) return;

			Logger.info("Running explorer", interaction.commandName, folder, controllerid);
			void HttpClient.axios.get({
				url: "/bot/files/folder",
				params: {
					folder,
					controllerid
				}
			});

			await command.run(client, handler, ws);
			return;
		}

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

	static async runStringSelectMenu(
		client: DiscordClient,
		interaction: StringSelectMenuInteraction
	): Promise<void> {
		const controllerid = interaction.user.id;
		const movment = interaction.values[0];

		// const relativeRoute = client.folderPath.split("")

		if (movment === "back") {
			const currentPath = client.relativeFolder.get(controllerid) ?? "/";
			client.relativeFolder.set(controllerid, path.dirname(currentPath));
		} else {
			const currentPath = client.relativeFolder.get(controllerid) ?? "/";
			client.relativeFolder.set(controllerid, path.join(currentPath, movment));
		}

		Logger.info(
			"Running string select menu",
			movment,
			// controllerid,
			client.folderPath,
			client.relativeFolder
		);

		await HttpClient.axios.get({
			url: "/bot/files/folder",
			params: {
				folder: client.folderPath.get(controllerid) ?? "/",
				controllerid,
				relativepath: client.relativeFolder.get(controllerid) ?? "/"
			}
		});

		await interaction.reply({
			content: `You selected: ${movment}`,
			ephemeral: true
		});
	}

	static async runButton(client: DiscordClient, interaction: ButtonInteraction): Promise<void> {
		const { customId, data } = interaction.component as ButtonComponent;
		console.log("Running button", customId, data);
	}

	static async runAutocomplete(
		client: DiscordClient,
		interaction: AutocompleteInteraction
	): Promise<void> {
		const command = client.commands.get(interaction.commandName);

		if (!command) return;
		// console.log("Running autocomplete", interaction, command);

		await command.autocomplete(interaction);
	}
}
