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
	type Guild,
	type GuildBasedChannel,
	type GuildMember,
	type InteractionReplyOptions,
	InteractionResponse,
	type Message,
	type MessageCreateOptions,
	type MessageEditOptions,
	type MessagePayload,
	type MessageReplyOptions,
	type Role,
	type TextBasedChannel,
	type User
} from "discord.js";

interface CommandHandlerProps {
	client: DiscordClient;
	interaction?: CommandInteraction;
	message?: Message;
	color: ColorResolvable;
	prefix: string;
}

export class CommandHandler {
	public client: DiscordClient;
	public interaction?: CommandInteraction;
	public message?: Message;
	public user: User;
	public member?: GuildMember | null;
	public channel?: TextBasedChannel | null;
	public guild?: Guild | null;
	public color: ColorResolvable;
	public prefix: string;

	constructor({ client, interaction, message, color, prefix }: CommandHandlerProps) {
		this.client = client;
		this.interaction = interaction;
		this.message = message;
		this.color = color;
		this.prefix = prefix;

		this.user = interaction ? interaction.user : message!.author;
		this.member = interaction ? (interaction.member as GuildMember) : message!.member;
		this.channel = interaction ? interaction.channel : message!.channel;
		this.guild = interaction ? interaction.guild : message!.guild;
	}

	public async deferReply(): Promise<CommandInteraction | Message | undefined> {
		if (this.interaction instanceof CommandInteraction) {
			await this.interaction.deferReply({ ephemeral: false });
			return this.interaction;
		}

		this.message = await this.message?.reply(`**${this.client.user?.username}** is thinking...`);
		return this.message;
	}

	public async editReply(
		content: string | MessagePayload | MessageEditOptions
	): Promise<Message | InteractionResponse<BooleanCache<CacheType>> | undefined> {
		if (this.interaction instanceof InteractionResponse) {
			return this.interaction.edit(content);
		}

		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.editReply(content);
		}

		if (this.message) {
			return this.message.edit(content);
		}

		this.client.logger.error("Edit reply is not supported.");
	}

	public async reply(
		options: InteractionReplyOptions | MessageReplyOptions
	): Promise<Message | InteractionResponse<BooleanCache<CacheType>>> {
		if (this.interaction instanceof InteractionResponse) {
			return this.interaction.edit(options);
		}

		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.reply(options as InteractionReplyOptions);
		}

		return this.message!.reply(options as MessageReplyOptions);
	}

	public ghostReply(
		content: InteractionReplyOptions
	): Promise<InteractionResponse<BooleanCache<CacheType>> | Message> | undefined {
		if (this.interaction instanceof InteractionResponse) {
			return this.interaction.edit(content);
		}

		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.reply({ ...content, ephemeral: true });
		}

		this.client.logger.error("Ghost reply is not supported for message commands.");
	}

	public async send(content: string | MessagePayload | MessageCreateOptions): Promise<Message> {
		if (this.interaction instanceof InteractionResponse) return this.interaction.edit(content);
		if (this?.interaction?.channel) return this.interaction.channel.send(content);

		return this.message!.channel.send(content);
	}

	public getArgs(): unknown[] {
		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.value);
		}

		return this.message!.content.slice(this.prefix.length).trim().split(/ +/g);
	}

	public getAttachments(): Attachment[] {
		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.attachment!) || [];
		}

		return Array.from(this.message!.attachments.values());
	}

	public getMemberMentions(): Array<GuildMember | APIInteractionDataResolvedGuildMember> {
		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.member!) || [];
		}

		return Array.from(this.message!.mentions.members?.values() || []);
	}

	public getChannelMentions(): Array<
		GuildBasedChannel | APIInteractionDataResolvedChannel | Channel
	> {
		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.channel!) || [];
		}

		return Array.from(this.message!.mentions.channels.values());
	}

	public getRoleMentions(): Array<Role | APIRole> {
		if (this.interaction instanceof CommandInteraction) {
			return this.interaction.options.data.map((option) => option.role!) || [];
		}

		return Array.from(this.message!.mentions.roles.values());
	}
}
