import { type DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import { emojis, fallbackAvatar } from "@/shared";
import { Logger } from "@/shared/Logger";
import { type StringSelectMenuInteraction } from "discord.js";
import path from "path";
import { type Socket } from "socket.io-client";

export const selectHandler = async (
	client: DiscordClient,
	interaction: StringSelectMenuInteraction,
	ws: Socket
) => {
	const controllerid = interaction.user.id;
	const user = await client.users.fetch(interaction.user.id);
	const dmChannel = await user.createDM();
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

	if (interaction.customId === "client-select-menu") {
		// const clientSelection = interaction.values[0]; // Client ID
		const controllerid = interaction.user.id;

		// console.log(interaction.user.avatarURL(), interaction.user.username);
		const [clientSelection, messageid] = interaction.values[0].split(".");

		Logger.info("Running client select menu", interaction.values[0], controllerid);

		// await interaction.update({
		// 	withResponse: false
		// });

		await interaction.update({
			components: [],
			embeds: [],
			content: `${emojis.Loading} Connecting to client ${clientSelection}`
		});

		// setTimeout(() => {}, 1000);

		// const messageData = await interaction.fetchReply();

		void HttpClient.axios
			.post<{ status: boolean; message?: string }>({
				url: `/controllers/${controllerid}/connect-client`,
				data: {
					clientid: clientSelection,
					username: interaction.user.username,
					avatar: interaction.user.avatarURL() ?? fallbackAvatar,
					messageid
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
};
