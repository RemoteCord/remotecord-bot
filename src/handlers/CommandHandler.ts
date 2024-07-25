import type { DiscordClient } from "@/clients/DiscordClient";
import {
	type APIInteractionDataResolvedChannel,
	type APIInteractionDataResolvedGuildMember,
	type APIRole,
	type Attachment,
	type BooleanCache,
	type CacheType,
	type Channel,
	type ColorResolvable,
	CommandInteraction,
	type GuildBasedChannel,
	type GuildMember,
	type InteractionReplyOptions,
	InteractionResponse,
	type Message,
	type MessageCreateOptions,
	type MessagePayload,
	type MessageReplyOptions,
	type Role
} from "discord.js";

interface CommandHandlerProps {
	client: DiscordClient;
	interaction?: CommandInteraction | InteractionResponse;
	message?: Message;
	color: ColorResolvable;
	language: string;
	prefix: string;
}

export class CommandHandler {
	public client: DiscordClient;
	public interaction?: CommandInteraction | InteractionResponse;
	public message?: Message;
	public color: ColorResolvable;
	public language: string;
	public prefix: string;

	constructor({ client, interaction, message, color, language, prefix }: CommandHandlerProps) {
		this.client = client;
		this.interaction = interaction;
		this.message = message;
		this.color = color;
		this.language = language;
		this.prefix = prefix;
	}

	public async deferReply() {
		if (this.interaction && this.interaction instanceof CommandInteraction) {
			const data = await this.interaction.deferReply({ ephemeral: false });
			this.interaction = data;
			return data;
		}

		const data = await this.message?.reply(`**${this.client.user?.username}** is thinking...`);
		this.message = data;
		return data;
	}

	public async editReply(
		content: string | MessagePayload | MessageCreateOptions
	): Promise<Message | InteractionResponse<BooleanCache<CacheType>> | undefined> {
		if (this?.interaction) {
			if (this.interaction instanceof InteractionResponse) return this.interaction.edit(content);
			return this.interaction.editReply(content);
		}

		this.client.logger.error("Edit reply is not supported in message commands.");
	}

	public async reply(options: InteractionReplyOptions | MessageReplyOptions): Promise<Message | InteractionResponse<BooleanCache<CacheType>>> {
		if (this?.interaction) {
			if (this.interaction instanceof InteractionResponse) return this.interaction.edit(options);
			return this.interaction.reply(options as InteractionReplyOptions);
		}

		return this.message!.reply(options as MessageReplyOptions);
	}

	public ghostReply(content: InteractionReplyOptions): Promise<InteractionResponse<BooleanCache<CacheType>> | Message> | undefined {
		if (this?.interaction) {
			if (this.interaction instanceof InteractionResponse) return this.interaction.edit(content);
			return this.interaction.reply({ ...content, ephemeral: true });
		}

		this.client.logger.error("Ghost reply is not supported in message commands.");
	}

	public async send(content: string | MessagePayload | MessageCreateOptions): Promise<Message> {
		if (this.interaction instanceof InteractionResponse) return this.interaction.edit(content);
		if (this?.interaction?.channel) return this.interaction.channel.send(content);

		return this.message!.channel.send(content);
	}

	public getArgs(): unknown[] {
		if (this?.interaction && this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.value);
		}

		return this.message!.content.slice(this.prefix.length).trim().split(/ +/g);
	}

	public getAttachments(): Attachment[] {
		if (this?.interaction && this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.attachment!) || [];
		}

		return Array.from(this.message!.attachments.values());
	}

	public getMemberMentions(): Array<GuildMember | APIInteractionDataResolvedGuildMember> {
		if (this?.interaction && this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.member!) || [];
		}

		return Array.from(this.message!.mentions.members?.values() || []);
	}

	public getChannelMentions(): Array<GuildBasedChannel | APIInteractionDataResolvedChannel | Channel> {
		if (this?.interaction && this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.channel!) || [];
		}

		return Array.from(this.message!.mentions.channels.values());
	}

	public getRoleMentions(): Array<Role | APIRole> {
		if (this?.interaction && this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.role!) || [];
		}

		return Array.from(this.message!.mentions.roles.values());
	}
}
