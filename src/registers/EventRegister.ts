import type { DiscordClient } from "@/clients/DiscordClient";
import type { Event } from "@/structures/Event";
import { readdirSync } from "node:fs";
import { join } from "node:path";

export class EventRegister {
	static async eventRegister(client: DiscordClient) {
		const counter = {
			total: 0,
			success: 0
		};
		const eventFolderPath = join(__dirname, "..", "events");
		const eventFolders = readdirSync(eventFolderPath);

		for (const folder of eventFolders) {
			const eventFiles = readdirSync(join(__dirname, "..", "events", folder)).filter((file) => file.endsWith(".ts"));

			for (const file of eventFiles) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				const event: Event = new (await import(`file://${eventFolderPath}/${folder}/${file}`)).default();
				if (!event?.name) {
					client.logger.error(`Event ${file} failed to load`);
					break;
				}

				counter.total++;

				if (!event.enabled) return;

				if (event.rest) client.rest.on(event.name, event.run.bind(null, client));
				else client.on(event.name, event.run.bind(null, client));

				counter.success++;
			}
		}

		client.logger.info(`Loaded events: (${counter.success}/${counter.total})`);
	}
}
