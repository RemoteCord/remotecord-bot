import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/permissions.types";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "stats",
			description: "give current stats",
			category: "devs",
			aliases: ["stats"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("stats").setDescription("Get stats!")

		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {

	}
}
