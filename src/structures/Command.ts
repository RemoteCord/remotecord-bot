import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import type { CustomPermissions } from "@/types/Permissions";
import type { CommandProps } from "@/types/Structures";
import type {
	AutocompleteInteraction,
	PermissionResolvable,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder
} from "discord.js";

export class Command {
	name: string;
	description: string;
	category: string;
	aliases: string[];
	interaction: boolean;
	userPermissions: PermissionResolvable[];
	botPermissions: PermissionResolvable[];
	customPermissions: CustomPermissions[];
	premium: boolean;
	enabled: boolean;
	slash: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | undefined;

	constructor({
		name,
		description,
		category,
		aliases,
		interaction,
		botPermissions,
		userPermissions,
		customPermissions,
		premium,
		enabled,
		slash
	}: CommandProps) {
		this.name = name;
		this.description = description;
		this.category = category;
		this.aliases = aliases || [];
		this.interaction = interaction || false;
		this.userPermissions = userPermissions || [];
		this.botPermissions = botPermissions || [];
		this.customPermissions = customPermissions || [];
		this.premium = premium || false;
		this.enabled = enabled || true;
		this.slash = slash || undefined;
	}

	async autocomplete(interaction: AutocompleteInteraction) {}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<any> {
		throw new Error("Method not implemented.");
	}
}
