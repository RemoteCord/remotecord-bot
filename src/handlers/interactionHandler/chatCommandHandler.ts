import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { embeds, emojis, fallbackAvatar } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type AxiosError } from "axios";
import {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	type ChatInputCommandInteraction
} from "discord.js";
import path from "path";
import { type Socket } from "socket.io-client";
import { CommandHandler } from "../CommandHandler";
import { PermissionHandler } from "../PermissionHandler";
import { EndpointsInteractions } from "@/services/interactions/endpoints-interactions";
import { EmbedsInteractions } from "@/services/interactions/embeds-interactions";
import { ConfigService } from "@/shared/ConfigService";
import { type WsTasksFromClient, type GetFilesFolder } from "@/types/ws-events.types";




export const runChatCommandHandler = async (
	client: DiscordClient,
	interaction: ChatInputCommandInteraction,
	ws: Socket
) => {

	const controllerid = interaction.user.id;

	const configService = new ConfigService()

	const endpointsInteractions = new EndpointsInteractions(controllerid)
	const embedsInteractions = new EmbedsInteractions(controllerid, endpointsInteractions)


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

	if (interaction.commandName === "stats") {

		if (!configService.config?.bot.ADMIN.includes(interaction.user.id)) {

			return
		}

		await interaction.reply({
			content: `${emojis.Loading} Getting stats...`,
			flags: ["Ephemeral"]
		});

		const stats = await endpointsInteractions.getStats();
		console.log("Stats response", stats);



		if (stats) {

			const embed = {
				title: "Stats",
				description: `
				**Connections:** ${stats.connections}\n
				**Clients:** 
				**Controllers:** ${stats.users.controllers}
				**Clients:**${stats.users.clients}
				**Total:**:${stats.users.clients + stats.users.controllers}\n
				**Commands:** ${stats.commands}
				**Web Analytics:**
				**Visitors:** ${stats.web_analytics.visitors}
				**Views:** ${stats.web_analytics.views}
			    **Sessions:** ${stats.web_analytics.sessions}\n
				**Memory:**
				**Used:** ${stats.memory.used} MB
				**Total:** ${stats.memory.total} MB
				**Free:** ${stats.memory.free} MB
				`,
				color: embeds.Colors.default,
			};

			await interaction.editReply({
				content: "",
				embeds: [
					embed
				]
			});
		} else {
			await interaction.editReply({
				content: `${emojis.Error} An error occurred while getting stats.`
			});
		}
	}

	if (interaction.commandName === "camera") {
		await interaction.reply({
			content: `${emojis.Loading} Getting camera...`
		});

		const messageData = await interaction.fetchReply();
		// console.log("Message id", message);
		const res = await endpointsInteractions.getCameras({
			messageid: messageData.id
		})
		console.log("Camera response", res);
		if (res.status) {
			await interaction.editReply({
				content: `${emojis.Loading} Receiving cameras`
			});
		} else {
			await interaction.reply({
				content: `${emojis.Error} An error occurred while getting camera.`
			});
		}
	}

	if (interaction.commandName === "upload-large") {
		await interaction.reply({
			content: `${emojis.Loading} Getting upload url...`
		});
		const res = await endpointsInteractions.getUploadLargeFileUrl();
		if (!res) {
			await interaction.editReply({
				content: `${emojis.Error} An error occurred while getting upload url.`
			});
			return;
		}

		console.log("Upload large file response", res);
		const upload_split = res.split("/");
		const code = upload_split[upload_split.length - 1];

		const uploadUrl = `${process.env.BASE_WEB_URL}/upload?code=${code}`;


		await interaction.editReply({
			content: `${uploadUrl}`
		});
	}

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

		await interaction.reply({
			content: `${emojis.Loading} Sending command...`
		});

		ws.once("getCmdCommand", async (data: { controllerid: string; editReply: boolean }) => {
			console.log("Message received", data);
			if (data.controllerid !== controllerid) return;

			await interaction.editReply({
				content: `${emojis.Success} Command sent successfully!`
			});

			// await command.run(client, handler, ws, interaction);
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

		ws.once("getTasksFromClient", async (data: WsTasksFromClient) => {
			if (data.controllerid !== controllerid) return;


			await interaction.editReply({
				content: `${emojis.Success} Tasks received!`,
			});
		})
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

		await interaction.reply({
			content: `${emojis.Loading} Sending explorer request...`
		});


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


			.catch(async (err: unknown) => {
				const adapterError = (err as AxiosError).response?.data;
				// console.log("Explorer error", adapterError);
				if (adapterError.statusCode === 401 || adapterError.statusCode === 401) {
					await interaction.editReply({
						content: `${emojis.Error} You are not authorized to run this command`,
					});
					return;
				}

				await interaction.editReply({
					content: `${emojis.Error} Something went wrong!`,
				});
			});


		await interaction.editReply({
			content: `${emojis.Success} Explorer request sended...`
		});

		ws.once("getFilesFolder", async (data: GetFilesFolder) => {
			console.log("Message received", data);
			if (data.controllerid !== controllerid) return;

			await interaction.editReply({
				content: `${emojis.Success} Explorer request recived!`
			});

		})


	} else {
		try {
			await command.run(client, handler, ws, interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({
				content: `${emojis.Error} An error occurred while executing this command!\n\`\`\`js\n${error}\n\`\`\``,
			});
		}
	}

	if (interaction.commandName === "add-client") {
		const controllerid = interaction.user.id;
		Logger.info("Running add", controllerid);

		const clientid = interaction.options.getString("id")!;


		await interaction.reply({
			content: `${emojis.Loading} Adding client ${clientid}...`
		});

		const res = await endpointsInteractions.addFriend({
			clientid,
			name: interaction.user.username,
			picture: interaction.user.avatarURL() ?? fallbackAvatar
		})

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

	if (interaction.commandName === "delete-client") {
		const controllerid = interaction.user.id;

		await interaction.reply({
			content: `${emojis.Loading} Getting clients...`
		});

		Logger.info("Running delete", controllerid);


		const { embedClients, clients } = await embedsInteractions.generateFriendsEmbed({
			title: "Clients",
			description: "List of your friended clients:",
			options: {
				showConnectedEmoji: false
			}
		})

		const components = [];

		const filteredClients = clients.filter((client) => !client.isconnected);

		if (filteredClients.length === 0) {
			await interaction.editReply({
				content: `${emojis.Warning} You don't have friends.`,

			});
			return;
		}

		const selectionClient = new StringSelectMenuBuilder()
			.setCustomId("client-delete-menu")
			.setPlaceholder("Select a client")
			.addOptions(
				filteredClients.map((client) =>
					new StringSelectMenuOptionBuilder()
						.setLabel(`${client.alias} (${client.clientid})`)
						.setValue(`${client.clientid}.${client.alias}`)
				)
			);

		components.push(new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
			selectionClient
		));


		await interaction.editReply({
			content: "",
			embeds: [embedClients],
			components
		});

	}

	// ws.once("addFriend", async (data: {clientid:string, controllerid:string, accept:boolean}) => {

	if (interaction.commandName === "activate") {
		Logger.info("Running activate", interaction.user.id);

		await interaction.reply({
			content: `[Click to activate your account](<https://remotecord.app/discord>)`
		});

		// console.log("Activating account", interaction.user);


		// const res = await endpointsInteractions.activateController({
		// 	picture: interaction.user.avatarURL() ?? fallbackAvatar,
		// 	name: interaction.user.username
		// })



		// // Logger.info("Activate response", JSON.stringify(res));
		// if (res.status) {


		// 	// console.log("Channel", channel);
		// 	await interaction.editReply({
		// 		content: `${emojis.Success} Your account has been activated successfully!`
		// 	});
		// } else {
		// 	if (res.isAlreadyActivated) {
		// 		await interaction.editReply({
		// 			content: `${emojis.Warning} Your account is already activated. You do not need to activate your account again.`
		// 		});
		// 		return;
		// 	}

		// 	await interaction.editReply({
		// 		content: `${emojis.Error} An error occurred while activating your account.`
		// 	});
		// }
	}

	if (interaction.commandName === "connect") {
		await interaction.reply({
			content: `${emojis.Loading} Getting clients...`
		});

		const messageid = (await interaction.fetchReply()).id;


		// console.log(clients);

		// const owner = await client.users.fetch(ownerid);

		// Create embed & show
		const { embedClients, clients } = await embedsInteractions.generateFriendsEmbed({
			title: "Clients",
			description: "List of your friended clients:",
		})

		// await handler.reply({

		// });

		const components = [];

		const filteredClients = clients.filter((client) => !client.isconnected && client.isactive);

		if (filteredClients.length === 0) {
			await interaction.editReply({
				content: `${emojis.Warning} All clients are already in use or are not active.`,
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

		await interaction.reply({
			content: `${emojis.Loading} Disconnecting...`
		});

		const res = await endpointsInteractions.disconnectClient()

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

};
