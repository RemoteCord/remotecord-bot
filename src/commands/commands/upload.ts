import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { type ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { type Socket } from "socket.io-client";

export default class extends Command {
	constructor() {
		super({
			name: "upload",
			description: "Upload file to a client.",
			category: "commands",
			aliases: ["Upload"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("upload")
				.setDescription("Upload file to a client.")

		});
	}

	async run(
		client: DiscordClient,
		handler: CommandHandler,
		ws: Socket,
		interaction: ChatInputCommandInteraction,
		...args: any[]
	): Promise<void> { }
}
