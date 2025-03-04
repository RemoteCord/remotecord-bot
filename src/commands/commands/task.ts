import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "tasks",
			description: "get tasks from client!",
			category: "commands",
			aliases: ["Tasks"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("tasks").setDescription("get tasks from client!")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		await handler.reply({
			content: `Tasks get!`,

			ephemeral: true
		});
	}
}
