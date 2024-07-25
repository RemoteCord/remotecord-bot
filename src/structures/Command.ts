import { type DiscordClient } from "@/clients/DiscordClient";
import { type CommandHandler } from "@/handlers/CommandHandler";
import type { CommandProps } from "@/types/Structures";
import type { SlashCommandBuilder } from "discord.js";

export class Command {
	name: string;
	description: string;
	category: string;
	aliases: string[];
	interaction: boolean;
	permissions: string[];
	premium: boolean;
	enabled: boolean;
	slash: SlashCommandBuilder | null;

	constructor({ name, description, category, aliases, interaction, permissions, premium, enabled, slash }: CommandProps) {
		this.name = name;
		this.description = description;
		this.category = category;
		this.aliases = aliases || [];
		this.interaction = interaction || false;
		this.permissions = permissions || [];
		this.premium = premium || false;
		this.enabled = enabled || true;
		this.slash = slash || null;
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]) {
		throw new Error("Method not implemented.");
	}
}
