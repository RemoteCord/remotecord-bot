import type { DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "current-client",
			description: "Display the client you are currently connected to.",
			category: "clients",
			aliases: ["whoami, currentclient, who"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("current-client")
				.setDescription("Display the client you are currently connected to.")
		});
	}

	// Show embed of all clients and attach dropdown to select client
	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		// get clients
		const ownerid = handler.user.id;
		const { data } = await HttpClient.axios.get<{
			data: {
				client: {
					id: string;
				};
			};
		}>({
			url: `/controllers/${ownerid}/current-client`
		});

		console.log(data);

		// const owner = await client.users.fetch(ownerid);

		// Create embed & show
		const embedClients = {
			title: "Current client",
			description: "The client you are currently connected to is:",
			fields: [
				{
					name: "",
					value: data.client.id
				}
			]
		};

		await handler.reply({
			embeds: [embedClients]
		});
	}
}
