/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { DiscordClient } from "@/clients/DiscordClient";
import type { DiscordEvent } from "@/structures/DiscordEvent";
import { readdirSync } from "node:fs";
import { type Socket } from "socket.io-client";

export class EventRegister {
	static async discordEventRegister(client: DiscordClient, ws: Socket) {
		console.log(ws);
		const counter = {
			total: 0,
			success: 0
		};
		const eventFolderPath = `${process.cwd()}/src/events`;
		const eventFolders = readdirSync(eventFolderPath);

		for (const folder of eventFolders) {
			const eventFiles = readdirSync(`${eventFolderPath}/${folder}`).filter((file) =>
				file.endsWith(".ts")
			);

			for (const file of eventFiles) {
				const event: DiscordEvent = new (
					await import(`file://${eventFolderPath}/${folder}/${file}`)
				).default();
				if (!event?.name) {
					client.logger.error(`Event ${file} failed to load`);
					break;
				}

				client.logger.info(`Loaded event: ${event.name}`);

				counter.total++;

				if (!event.enabled) return;
				if (event.rest) client.rest.on(event.name, event.run.bind(null, client, ws));
				else client.on(event.name, event.run.bind(null, client, ws));

				counter.success++;
			}
		}

		client.logger.info(`Loaded DiscordEvents: (${counter.success}/${counter.total})`);
	}
}
