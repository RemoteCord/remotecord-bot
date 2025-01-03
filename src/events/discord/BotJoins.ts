import { DiscordEvent } from "@/structures/DiscordEvent";
import { type Client, Events, type Guild } from "discord.js";
import { Logger } from "@/shared/Logger";
import { Create } from "@/db/servers/create";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.GuildCreate, // Nombre del evento
			enabled: true, // Si está habilitado
			rest: false // Indica si es un evento REST o WebSocket
		});
	}

	run = async (client: Client, guild: Guild) => {
		if (!guild) return;

		console.log("Bot Joins event", guild);

		try {
			const owner = await guild.fetchOwner();
			Logger.info(
				`El bot ha sido añadido a: ${guild.name} por ${owner?.user.tag} ${owner?.user.id}`
			);
			void owner.send("¡Gracias por añadirme a tu servidor! Usa `/ayuda` para ver mis comandos.");

			void Create.createServer({
				server_id: guild.id,
				server_name: guild.name,
				server_url: "kfkekefkwe",
				owner_id: owner.user.id
			});

			// Opcional: Envía un mensaje al canal del sistema si está disponible
			if (guild.systemChannel) {
				await guild.systemChannel.send(
					"¡Gracias por añadirme a tu servidor! Usa `/ayuda` para ver mis comandos."
				);
			}
		} catch (error: unknown) {
			Logger.error(`Error en el evento GuildCreate: ${(error as Error).message}`);
		}
	};
}
