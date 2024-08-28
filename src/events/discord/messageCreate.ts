import type { DiscordClient } from "@/clients/DiscordClient";
import { CommandHandler } from "@/handlers/CommandHandler";
import { Event } from "@/structures/Event";
import { ChannelType, Events, type Message } from "discord.js";

export default class extends Event {
	constructor() {
		super({
			name: Events.MessageCreate,
			enabled: true,
			rest: false
		});
	}

	async run(client: DiscordClient, message: Message) {
		if (message.author.bot) return;
		if (message.channel.type === ChannelType.DM) return;

		const prefix = client.config.bot.PREFIX;
		const mentionRegex = RegExp(`^<@!?${client.user?.id}>$`);

		if (!message.content.startsWith(prefix) && !message.content.match(mentionRegex)) return;

		const [cmd, ...args] = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = client.commands.get(cmd);

		if (!command) return;

		try {
			const handler = new CommandHandler({
				client,
				message,
				color: client.config.colors.burple,
				language: client.config.bot.LANGUAGE,
				prefix: client.config.bot.PREFIX
			});

			await command.run(client, handler);
		} catch (error) {
			console.error(error);
			await message.reply({ content: "There was an error while executing this command!" });
		}
	}
}
