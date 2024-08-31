import type { DiscordClient } from "@/clients/DiscordClient";
import type { DiscordEvent } from "@/structures/DiscordEvent";
import type { RainlinkEvent } from "@/structures/RainlinkEvent";
import { readdirSync } from "node:fs";

export class EventRegister {
	static async discordEventRegister(client: DiscordClient) {
		const counter = {
			total: 0,
			success: 0
		};
		const eventFolderPath = `${process.cwd()}/src/events`;
		const eventFolders = readdirSync(eventFolderPath);

		for (const folder of eventFolders) {
			const eventFiles = readdirSync(`${eventFolderPath}/${folder}`).filter((file) => file.endsWith(".ts"));

			for (const file of eventFiles) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				const event: DiscordEvent = new (await import(`file://${eventFolderPath}/${folder}/${file}`)).default();
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

		client.logger.info(`Loaded DiscordEvents: (${counter.success}/${counter.total})`);
	}

	static async rainlinkEventRegister(client: DiscordClient) {
		const counter = {
			total: 0,
			success: 0
		};
		const eventFolderPath = `${process.cwd()}/src/events/music`;
		const eventFolders = readdirSync(eventFolderPath);

		for (const folder of eventFolders) {
			const eventFiles = readdirSync(`${eventFolderPath}/${folder}`).filter((file) => file.endsWith(".ts"));

			for (const file of eventFiles) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				const event: RainlinkEvent = new (await import(`file://${eventFolderPath}/${folder}/${file}`)).default();
				if (!event?.name) {
					client.logger.error(`RainlinkEvent ${file} failed to load`);
					break;
				}

				counter.total++;

				if (!event.enabled) return;

				client.rainlink.on(event.name, event.run.bind(null, client));

				counter.success++;
			}
		}

		client.logger.info(`Loaded RainlinkEvents: (${counter.success}/${counter.total})`);
	}
}
