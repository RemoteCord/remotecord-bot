import type { DiscordClient } from "@/clients/DiscordClient";
import type {
	Message,
	PermissionResolvable,
	SlashCommandBuilder,
	SlashCommandOptionsOnlyBuilder
} from "discord.js";
import type { CustomPermissions } from "./permissions.types";
import { type Socket } from "socket.io-client";

export interface DiscordEventProps {
	name: string;
	enabled: boolean;
	rest: boolean;
}

export interface CommandClass {
	run({ client, msg, ws, ...args }: RunArgs): void;
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
	ws: Socket;
	args: any[];
}

export interface EventProps {
	name: string;

	enabled?: boolean;

	rest: boolean;
}
