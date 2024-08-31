import type { DiscordClient } from "@/clients/DiscordClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "play",
			description: "Play a song",
			category: "music",
			aliases: ["p"],
			interaction: true,
			userPermissions: [],
			botPermissions: [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak],
			customPermissions: [],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder()
				.setName("play")
				.setDescription("Play a song")
				.addStringOption((option) =>
					option.setName("query").setDescription("Query to search").setRequired(true)
				)
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]) {
		console.log("Running play command");
		const query =
			(handler.interaction?.options.get("query")?.value as string) || handler.getArgs().join(" ");

		if (!query) return handler.reply({ content: "Please provide a query" });

		if (!handler.member?.voice.channelId)
			return handler.reply({ content: "You need to be in a voice channel" });

		const player = await client.rainlink.create({
			guildId: handler.interaction!.guildId!,
			textId: handler.interaction!.channelId,
			voiceId: handler.member?.voice.channelId,
			shardId: 0,
			volume: 40
		});

		const result = await client.rainlink.search(query, {
			requester: handler.user,
			engine: "youtubeMusic"
		});
		if (!result.tracks.length) return handler.reply({ content: "No results found!" });

		if (result.type === "PLAYLIST") for (const track of result.tracks) player.queue.add(track);
		else player.queue.add(result.tracks[0]);

		if (!player.playing || !player.paused) await player.play();

		const embed = new EmbedBuilder()
			.setAuthor({ name: "| Añadida a la cola", iconURL: handler.user.displayAvatarURL() })
			.setDescription(
				result.type === "PLAYLIST"
					? `Añadidas ${result.tracks.length} de **[${result.playlistName}](${query})**`
					: `Canción: **[${result.tracks[0].title} - ${result.tracks[0].author}](${result.tracks[0].uri})**`
			)
			.setColor(0x23272a);

		await handler.reply({
			embeds: [embed]
		});
	}
}
