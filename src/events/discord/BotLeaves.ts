import { DiscordEvent } from "@/structures/DiscordEvent";
import { type Client, Events, type Guild } from "discord.js";
import { Logger } from "@/shared/Logger";
import HttpClient from "@/clients/HttpClient";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.GuildDelete, // Nombre del evento
			enabled: true, // Si está habilitado
			rest: false // Indica si es un evento REST o WebSocket
		});
	}

	run = async (client: Client, guild: Guild) => {
		if (!guild) return;

		console.log("Bot leaves event", guild);

		try {
			Logger.info(`El bot ha sido removido de: ${guild.name} `);

			void HttpClient.axios
				.post({
					url: "/guild/delete",
					data: {
						server_id: guild.id
					}
				})
				.then((data) => console.log(data));
		} catch (error: unknown) {
			Logger.error(`Error en el evento GuildDelete: ${(error as Error).message}`);
		}
	};
}
