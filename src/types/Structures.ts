import type { DiscordClient } from "@/clients/DiscordClient";
import type {
	Message,
	PermissionResolvable,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder
} from "discord.js";
import type { RainlinkEventsInterface } from "rainlink";
import type { CustomPermissions } from "./Permissions";

export interface DiscordEventProps {
	name: string;
	enabled: boolean;
	rest: boolean;
}

export interface RainlinkEventProps {
	name: keyof RainlinkEventsInterface;
	enabled: boolean;
}

export interface CommandClass {
	run({ client, msg, ...args }: RunArgs): void;
}

export interface CommandProps {
	name: string;
	description: string;
	category: string;
	enabled: boolean;
	aliases?: string[];
	interaction?: boolean;
	userPermissions: PermissionResolvable[];
	botPermissions: PermissionResolvable[];
	customPermissions: CustomPermissions[];
	premium?: boolean;
	slash?: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder;
}

export interface RunArgs {
	client: DiscordClient;
	msg: Message;
	args: any[];
}
