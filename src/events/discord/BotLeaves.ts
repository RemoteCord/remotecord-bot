import { DiscordEvent } from "@/structures/DiscordEvent";
import { type Client, Events, type Guild } from "discord.js";
import { Logger } from "@/shared/Logger";
import { Delete } from "@/db/servers/delete";

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

			void Delete.deleteServer({
				server_id: guild.id
			});
		} catch (error: unknown) {
			Logger.error(`Error en el evento GuildCreate: ${(error as Error).message}`);
		}
	};
}
