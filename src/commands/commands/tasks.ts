import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Logger } from "@/shared/Logger";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "tasks",
			description: "Get currently running tasks from task manager.",
			category: "commands",
			aliases: ["Tasks"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("tasks")
				.setDescription("Get currently running tasks from task manager.")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		// Logger.info("Running tasks command", handler.user.id);
		// const controllerId = handler.user.id;

		await handler.reply({
			content: `Getting tasks...`,

			ephemeral: true
		});
	}
}
