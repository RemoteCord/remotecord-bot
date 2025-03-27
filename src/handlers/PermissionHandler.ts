import type { DiscordClient } from "@/clients/DiscordClient";
import {
	type CheckPermissionsProps,
	CustomPermissions,
	type PermissionHandlerOptions
} from "@/types/permissions.types";
import {
	PermissionFlagsBits,
	type GuildChannel,
	type GuildMember,
	type Interaction,
	type PermissionResolvable
} from "discord.js";

export class PermissionHandler {
	public client: DiscordClient;
	public interaction: Interaction;

	public voicePermissions = [
		PermissionFlagsBits.Connect,
		PermissionFlagsBits.Speak,
		PermissionFlagsBits.MoveMembers
	];

	constructor({ client, interaction }: PermissionHandlerOptions) {
		this.client = client;
		this.interaction = interaction;
	}

	async checkPermissions({
		botPermission,
		userPermission,
		customPermissions
	}: CheckPermissionsProps): Promise<string | false> {
		const userError = await this.checkUserPermissions(userPermission);
		if (userError) return userError;

		const botError = await this.checkBotPermissions(botPermission);
		if (botError) return botError;

		const customError = await this.checkCustomPermissions(customPermissions);
		if (customError) return customError;

		return false;
	}

	async checkUserPermissions(userPermissions: PermissionResolvable[]): Promise<string | null> {
		const channel = this.interaction.channel as GuildChannel;
		const member = this.interaction.member as GuildMember;

		if (!userPermissions.length) return null;

		for (const permission of userPermissions) {
			const permissionName = this.getPermissionName(BigInt(permission as bigint));

			if (!channel.permissionsFor(member)?.has(permission))
				return `You are missing the following permissions: \`${permissionName}\``;

			if (!channel.permissionsFor(member.roles.highest)?.has(permission))
				return `Your role is missing the following permissions: \`${permissionName}\``;

			if (!member.permissions.has(permission))
				return `You are missing the following permissions: \`${permissionName}\``;
		}

		return null;
	}

	async checkBotPermissions(botPermissions: PermissionResolvable[]): Promise<string | null> {
		const channel = this.interaction.channel as GuildChannel;
		// eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
		const bot = this.interaction.guild?.members.me!;
		const memberChannel = (this.interaction.member as GuildMember)?.voice.channel;

		if (!botPermissions.length) return null;

		for (const permission of botPermissions) {
			const permissionName = this.getPermissionName(BigInt(permission as bigint));

			if (this.voicePermissions.includes(BigInt(permission as bigint))) {
				if (!memberChannel) return "You are not in a voice channel.";

				if (!memberChannel.permissionsFor(bot)?.has(permission)) {
					return `I am missing the following permissions: \`${permissionName}\``;
				}

				if (memberChannel && !memberChannel.permissionsFor(bot.roles.highest)?.has(permission)) {
					return `I am missing the following permissions: \`${permissionName}\``;
				}
			}

			if (!channel.permissionsFor(bot)?.has(permission))
				return `I am missing the following permissions: \`${permissionName}\``;

			if (!channel.permissionsFor(bot.roles.highest)?.has(permission))
				return `My highest role is missing the following permissions: \`${permissionName}\``;

			if (!bot.permissions.has(permission))
				return `I am missing the following permissions: \`${permissionName}\``;
		}

		return null;
	}

	async checkCustomPermissions(customPermissions: CustomPermissions[]): Promise<string | null> {
		if (!customPermissions.length) return null;

		for (const permission of customPermissions) {
			if (permission === CustomPermissions.BotAdmin) {
				if (!this.client.config.bot.ADMIN.includes(this.interaction.user.id))
					return "You are not allowed to use this command.";
			}

			if (permission === CustomPermissions.Premium) {
				if (!this.client.config.bot.ADMIN.includes(this.interaction.user.id))
					return "This command is only for premium guilds.";
			}
		}

		return null;
	}

	getPermissionName(permission: bigint): string {
		const permissionNameMap = new Map<bigint, string>();
		for (const [key, value] of Object.entries(PermissionFlagsBits)) {
			permissionNameMap.set(value, key);
		}

		return permissionNameMap.get(permission) || "UnknownPermission";
	}
}
