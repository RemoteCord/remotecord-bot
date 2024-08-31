import type { DiscordClient } from "@/clients/DiscordClient";
import type { Interaction, PermissionResolvable } from "discord.js";

export enum CustomPermissions {
	BotAdmin = "BotAdmin",
	Premium = "premium"
}

export interface PermissionHandlerOptions {
	client: DiscordClient;
	interaction: Interaction;
}

export interface CheckPermissionsProps {
	userPermission: PermissionResolvable[];
	botPermission: PermissionResolvable[];
	customPermissions: CustomPermissions[];
}
