import type { DiscordClient } from "@/clients/DiscordClient";
import { RainlinkEvent } from "@/structures/RainlinkEvent";
import { EmbedBuilder, type User, type TextChannel } from "discord.js";
import { RainlinkEvents, type RainlinkPlayer } from "rainlink";

export default class extends RainlinkEvent {
	constructor() {
		super({
			name: RainlinkEvents.TrackStart,
			enabled: true
		});
	}

	async run(client: DiscordClient, player: RainlinkPlayer): Promise<any> {
		const channel = client.channels.cache.get(player.textId) as TextChannel;
		if (!channel) return;

		if (!player.queue.current) {
			await player.destroy();
			return channel.send("Queue ended");
		}

		const duration = (player.queue.current.duration / 60 / 1000).toFixed(2).toString().replace(".", ":");
		const requester = player.queue.current.requester as User;

		const embed = new EmbedBuilder()
			.setAuthor({ name: "| Sonando Ahora", iconURL: requester.displayAvatarURL() })
			.setTitle(`${player.queue.current.title} - ${player.queue.current.author}`)
			.setFields(
				{ name: "Duración", value: `\`${duration}\``, inline: true },
				{ name: "En cola", value: `\`${player.queue.length.toString()} canciones\``, inline: true }
			)
			.setURL(player.queue.current.uri)
			.setThumbnail(player.queue.current.artworkUrl)
			.setColor(0x23272a);

		return channel.send({ embeds: [embed] });
	}
}
