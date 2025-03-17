import type { DiscordClient } from "@/clients/DiscordClient";
import {
	ActionRowBuilder,
	ModalBuilder,
	type ModalSubmitInteraction,
	TextInputBuilder,
	TextInputStyle,
	type AutocompleteInteraction,
	type ButtonComponent,
	type ButtonInteraction,
	type ChatInputCommandInteraction,
	type StringSelectMenuInteraction
} from "discord.js";
import { CommandHandler } from "./CommandHandler";
import { PermissionHandler } from "./PermissionHandler";
import { type Socket } from "socket.io-client";
import HttpClient from "@/clients/HttpClient";
import { Logger } from "@/shared/Logger";
import * as path from "path";
import { emojis } from "@/shared";
import { type GetFilesFolder } from "@/types/Ws";
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
				url: `/controllers/${controllerid}/upload-file`,
				data: {
					fileroute: file?.url
				}
			});
		}

		if (interaction.commandName === "cmd") {
			const controllerid = interaction.user.id;
			const command = interaction.options.getString("command") ?? "";
			Logger.info("Running cmd command", interaction.commandName, command, controllerid);

			void HttpClient.axios.post({
				url: `/controllers/${controllerid}/cmd`,
				data: {
					command
				}
			});
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
				.then((res) =>
					// interaction.reply({
					// 	content: ""
					// })
					Logger.info("Tasks response", res)
				);

			await interaction.reply({
				content: `${emojis.Loading} Getting tasks...`,
				ephemeral: true
			});

			ws.once("getTasksFromClient", async () => {
				Logger.info("Tasks loaded socket event");
				await interaction.editReply({
					content: `${emojis.Success} Tasks loaded.`
				});
			});
		}

		if (interaction.commandName === "screenshot") {
			const controllerid = interaction.user.id;
			Logger.info("Running screenshot command", controllerid);
			await HttpClient.axios
				.get({
					url: `/controllers/${controllerid}/get-screens`
				})
				.then((res) => Logger.info("Screenshot response", res));
		}

		if (interaction.commandName === "explorer") {
			const controllerid = interaction.user.id;
			const folder = interaction.options.getString("folder");

			if (!folder) return;

			Logger.info("Running explorer", interaction.commandName, folder, controllerid);
			const res = await HttpClient.axios
				.post<{
					error: string;
					message: string;
				}>({
					url: `/controllers/${controllerid}/explorer`,
					data: {
						folder: folder ?? "Desktop",
						relativepath: "/"
					}
				})
				.then((res) => {
					console.log("Explorer response", res);
					return res;
				});

			if (res.error) {
				await interaction.reply({
					content: res.error,
					ephemeral: true
				});
			} else {
				await command.run(client, handler, ws, interaction);
			}
		} else {
			try {
				await command.run(client, handler);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: `${emojis.Error} An error occurred while executing this command!\n\`\`\`js\n${error}\n\`\`\``,
					ephemeral: true
				});
			}
		}

		if (interaction.commandName === "add") {
			const controllerid = interaction.user.id;
			Logger.info("Running add", controllerid);

			const clientid = interaction.options.getString("add");

			await interaction.reply({
				content: `${emojis.Loading} Adding client ${clientid}...`
			});

			const res = await HttpClient.axios.post<{ status: boolean; isAlreadyAdded: boolean }>({
				url: `/controllers/${controllerid}/add-friend`,
				data: {
					clientid,
					username: interaction.user.username,
					avatar: interaction.user.avatarURL()
				}
			});

			if (res.status) {
				await interaction.editReply({
					content: `${emojis.Success} ${clientid} was sent a friend request. Once they accept, you can now connect to them using </connect:1346449430064267335>`
				});
			} else {
				if (res.isAlreadyAdded) {
					await interaction.editReply({
						content: `${emojis.Warning} You already added this client! Check your client list using </clients:1346410332507340812>`
					});
					return;
				}

				await interaction.editReply({
					content: `${emojis.Error} An error occurred while adding ${clientid}.`
				});
			}
		}

		// ws.once("addFriend", async (data: {clientid:string, controllerid:string, accept:boolean}) => {

		if (interaction.commandName === "activate") {
			Logger.info("Running activate", interaction.user.id);
			const controllerid = interaction.user.id;

			await interaction.reply({
				content: `${emojis.Loading} Activating your account...`
			});

			const res = await HttpClient.axios.post<{ status: boolean; isAlreadyActivated: boolean }>({
				url: `/controllers/${controllerid}/activate`,
				data: {
					controllerid
				}
			});

			// Logger.info("Activate response", JSON.stringify(res));
			if (res.status) {
				await interaction.editReply({
					content: `${emojis.Success} Your account has been activated successfully!`
				});
			} else {
				if (res.isAlreadyActivated) {
					await interaction.editReply({
						content: `${emojis.Warning} Your account is already activated. You do not need to activate your account again.`
					});
					return;
				}

				await interaction.editReply({
					content: `${emojis.Error} An error occurred while activating your account.`
				});
			}
		}

		if (interaction.commandName === "disconnect") {
			const controllerid = interaction.user.id;

			await interaction.reply({
				content: `${emojis.Loading} Disconnecting...`
			});

			const res = await HttpClient.axios.post<{ status: boolean }>({
				url: `/controllers/${controllerid}/disconnect-client`,
				data: {
					controllerid
				}
			});

			if (res.status) {
				await interaction.editReply({
					content: `${emojis.Success} Disconnected successfully.`
				});
			} else {
				await interaction.editReply({
					content: `${emojis.Error} An error occurred while disconnecting.`
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

			const currentFolder = client.folderPath.get(controllerid);

			if (currentFolder !== interaction.values[0]) {
				client.relativeFolder.set(controllerid, "/");
			}

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

			await HttpClient.axios.post({
				url: `/controllers/${controllerid}/explorer`,
				data: {
					folder: client.folderPath.get(controllerid) ?? "/",
					relativepath: client.relativeFolder.get(controllerid) ?? "/"
				}
			});

			await interaction.reply({
				content: `You selected: ${movment}`,
				ephemeral: true
			});
		}

		// OLD AND UNUSED!
		// if (interaction.customId === "explorer-files-download") {
		// 	const currentPath = client.relativeFolder.get(controllerid) ?? "/";
		// 	const folder = client.folderPath.get(controllerid) ?? "/";
		// 	const file = interaction.values[0];

		// 	const fullpath = path.join(folder, path.join(currentPath, file));

		// 	Logger.info("Running download file explorer", file, controllerid, currentPath, fullpath);
		// 	void HttpClient.axios.post({
		// 		url: `/controllers/${controllerid}/file`,
		// 		data: {
		// 			fileroute: fullpath,
		// 			controllerid
		// 		}
		// 	});
		// 	await interaction.reply({
		// 		content: `Downloading...`,
		// 		ephemeral: true
		// 	});
		// }

		if (interaction.customId === "client-select-menu") {
			const clientSelection = interaction.values[0]; // Client ID
			const controllerid = interaction.user.id;

			// console.log(interaction.user.avatarURL(), interaction.user.username);

			Logger.info("Running client select menu", interaction.values[0], controllerid);

			await interaction.reply({
				content: `${emojis.Loading} Connecting to client ${clientSelection}`
			});

			void HttpClient.axios
				.post<{ status: boolean; message?: string }>({
					url: `/controllers/${controllerid}/connect-client`,
					data: {
						clientid: clientSelection,
						username: interaction.user.username,
						avatar: interaction.user.avatarURL()
					}
				})
				.then((res) => {
					console.log("Select client response", res);
					if (res.status) {
						void interaction.editReply({
							content: `${emojis.Success} Sent connection request to: ${clientSelection}\n-# (Make sure to accept the connection request on the client side.)`
						});
					} else {
						void interaction.editReply({
							content: `${emojis.Error} ${res.message}`
						});
					}
				});
		}
	}

	static async runButton(client: DiscordClient, interaction: ButtonInteraction): Promise<void> {
		const { customId, data } = interaction.component as ButtonComponent;
		const controllerid = interaction.user.id;

		if (interaction.customId.includes("screen-")) {
			const screen = interaction.customId.split("-")[1];

			Logger.info("Running screen button", screen, controllerid);

			void HttpClient.axios.get({
				url: `/controllers/${controllerid}/send-screenshot?screenid=${screen}`,
				data: {
					screen
				}
			});
		}

		if (interaction.customId === "explorer-files-download") {
			const modal = new ModalBuilder().setCustomId("download-modal").setTitle("Download File");

			const fileNameInput = new TextInputBuilder()
				.setCustomId("file-name")
				.setLabel("File Name")
				.setStyle(TextInputStyle.Short);

			const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(fileNameInput);
			modal.addComponents(firstActionRow);

			await interaction.showModal(modal);
		}

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

	static async runModal(
		client: DiscordClient,
		interaction: ModalSubmitInteraction,
		ws: Socket
	): Promise<void> {
		if (interaction.customId === "download-modal") {
			const controllerid = interaction.user.id;

			const currentPath = client.relativeFolder.get(controllerid) ?? "/";
			const folder = client.folderPath.get(controllerid) ?? "/";

			const fileName = interaction.fields.getTextInputValue("file-name");
			const fullPath = path.join(folder, path.join(currentPath, fileName));

			Logger.info("Running download modal", fileName, controllerid);

			void HttpClient.axios.post({
				url: `/controllers/${controllerid}/file`,
				data: {
					fileroute: fullPath,
					controllerid
				}
			});

			await interaction.reply({
				content: `${emojis.Loading} Downloading ${fileName}...`,
				ephemeral: true
			});

			ws.once("downloadFile", async (data: GetFilesFolder) => {
				await interaction.editReply({
					content: `${emojis.Success} Downloaded ${fileName}`
				});
			});
		}
	}
}
