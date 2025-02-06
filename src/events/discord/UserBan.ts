import { DiscordEvent } from "@/structures/DiscordEvent";
import { type Client, Events, type Guild, type User } from "discord.js";
import { Logger } from "@/shared/Logger";
import HttpClient from "@/clients/HttpClient";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.GuildBanAdd, // Nombre del evento
			enabled: true, // Si está habilitado
			rest: false // Indica si es un evento REST o WebSocket
		});
	}

	run = async (client: Client, user: User) => {
		// if (!guild) return;

		try {
			// Logger.info(`El bot ha sido removido de: ${guild.name} `);
			// void HttpClient.axios
			// 	.post({
			// 		url: "/guild/delete",
			// 		data: {
			// 			server_id: guild.id
			// 		}
			// 	})
			// 	.then((data) => console.log(data));
			// console.log("Ban user event", user);
			// console.log("Ban client event", client);

			const userid = client.user?.id;
			const guildid = (user as any).guild.id;

			console.log("Ban user id", userid, guildid);
		} catch (error: unknown) {
			Logger.error(`Error en el evento GuildDelete: ${(error as Error).message}`);
		}
	};
}
