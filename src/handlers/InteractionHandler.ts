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
				url: `/controllers/${controllerid}/files`,
				data: {
					fileurl: file?.url
				}
			});
		}

		if (interaction.commandName === "connect") {
			// await command.run(client, handler);
		}

		if (interaction.commandName === "get") {
			const controllerid = interaction.user.id;
			const route = interaction.options.getString("route") ?? "";
			const folder = interaction.options.getString("folder") ?? "";
			Logger.info("Running get command", interaction.commandName, route, folder, controllerid);
			void HttpClient.axios.post({
				url: `/controllers/${controllerid}/file`,
				data: {
					fileroute: path.join(folder, route),
					controllerid
				}
			});
		}

		if (interaction.commandName === "tasks") {
			const controllerid = interaction.user.id;
			Logger.info("Running tasks command", controllerid);
			void HttpClient.axios
				.get({
					url: `/controllers/${controllerid}/tasks`
				})
				.then((res) => Logger.info("Tasks response", res));
		}

		if (interaction.commandName === "explorer") {
			const controllerid = interaction.user.id;
			const folder = interaction.options.getString("folder");

			if (!folder) return;

			Logger.info("Running explorer", interaction.commandName, folder, controllerid);
			const res = await HttpClient.axios
				.get<{
					error: string;
					message: string;
				}>({
					url: "/bot/files/folder",
					params: {
						folder,
						controllerid
					}
				})
				.then((res) => {
					console.log("Explorer response", res);
					return res;
				});

			if (!res.error) {
				await command.run(client, handler, ws);
				await interaction.reply({
					content: "explorer",
					ephemeral: true
				});
				return;
			}

			await interaction.reply({
				content: res.error,
				ephemeral: true
			});
		} else {
			try {
				await command.run(client, handler);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: "An error occurred while executing this command!!!",
					ephemeral: true
				});
			}
		}
	}

	static async runStringSelectMenu(
		client: DiscordClient,
		interaction: StringSelectMenuInteraction
	): Promise<void> {
		const controllerid = interaction.user.id;
		if (interaction.customId === "explorer-menu") {
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
				controllerid,
				client.folderPath,
				client.relativeFolder,
				interaction.customId
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

		if (interaction.customId === "explorer-files-download") {
			const currentPath = client.relativeFolder.get(controllerid) ?? "/";
			const folder = client.folderPath.get(controllerid) ?? "/";
			const file = interaction.values[0];

			const fullpath = path.join(folder, path.join(currentPath, file));

			Logger.info("Running download file explorer", file, controllerid, currentPath, fullpath);
			void HttpClient.axios.post({
				url: "/bot/files/get",
				data: {
					route: fullpath,
					controllerid
				}
			});
			await interaction.reply({
				content: `Downloading...`,
				ephemeral: true
			});
		}

		if (interaction.customId === "client-select-menu") {
			Logger.info("Running client select menu", interaction.values[0]);
			const clientSelection = interaction.values[0]; // Client ID
			const controllerid = interaction.user.id;

			void HttpClient.axios
				.post<{ status: string }>({
					url: "/bot/select-client",
					data: {
						clientid: clientSelection,
						controllerid
					}
				})
				.then((res) => {
					// console.log("Select client response", res);
					void interaction.reply({
						content: "Successfully selected client"
					});
				});
		}
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
