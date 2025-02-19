import type { DiscordClient } from "@/clients/DiscordClient";
import { CommandHandler } from "@/handlers/CommandHandler";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { ChannelType, Events, type Message } from "discord.js";
import { type Socket } from "socket.io-client";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.MessageCreate,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient, ws: Socket, message: Message) => {
		if (message.author.bot) return;
		if (message.channel.type === ChannelType.DM) return;

		const prefix = client.config.bot.PREFIX;
		const mentionRegex = RegExp(`^<@!?${client.user?.id}>$`);

		if (!message.content.startsWith(prefix) && !message.content.match(mentionRegex)) return;

		const [cmd] = message.content.slice(prefix.length).trim().split(/ +/g);
		const command = client.commands.get(cmd);

		if (!command) return;

		try {
			const handler = new CommandHandler({
				client,
				message,
				color: client.config.colors.burple,
				prefix: client.config.bot.PREFIX
			});

			await command.run(client, handler, ws);
		} catch (error) {
			console.error(error);
			await message.reply({ content: "There was an error while executing this command!" });
		}
	};
}
