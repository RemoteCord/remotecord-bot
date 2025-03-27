import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { emojis, fallbackAvatar } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type AxiosError } from "axios";
import { type ChatInputCommandInteraction } from "discord.js";
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
	const wsServiceHandlers = new ChatWsServiceHandlers(client, ws, interaction);

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
	}

	if (interaction.commandName === "screenshot") {
		const controllerid = interaction.user.id;
		Logger.info("Running screenshot command", controllerid);
		await interaction.reply({
			content: `${emojis.Loading} Gettings screens...`
		});

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

		const currentFolder = client.folderPath.get(controllerid);

		if (currentFolder !== folder) {
			client.relativeFolder.set(controllerid, "/");
		}

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
				// console.log("Explorer response", res);
				await command.run(client, handler, ws, interaction);
			})
			.catch(async (err: unknown) => {
				const adapterError = (err as AxiosError).response?.data;
				// console.log("Explorer error", adapterError);
				if (adapterError.statusCode === 401) {
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
				content: `${emojis.Success} Sent disconnect request.`
			});
		} else {
			await interaction.editReply({
				content: `${emojis.Error} An error occurred while disconnecting.`
			});
		}
	}
};
