import type { DiscordClient } from "@/clients/DiscordClient";
import type { Message, SlashCommandBuilder } from "discord.js";

export interface EventProps {
	name: string;
	enabled: boolean;
	rest: boolean;
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
	permissions?: string[];
	premium?: boolean;
	slash?: SlashCommandBuilder;
}

export interface RunArgs {
	client: DiscordClient;
	msg: Message;
	args: any[];
}
