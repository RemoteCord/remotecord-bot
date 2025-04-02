import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { emojis } from "@/shared";
import { Command } from "@/structures/Command";
import { type ChatInputCommandInteraction, Interaction, SlashCommandBuilder } from "discord.js";
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
				.addAttachmentOption((option) =>
					option.setName("file").setDescription("The file to upload").setRequired(true)
				)
		});
	}

	async run(
		client: DiscordClient,
		handler: CommandHandler,
		ws: Socket,
		interaction: ChatInputCommandInteraction,
		...args: any[]
	): Promise<void> {}
}
