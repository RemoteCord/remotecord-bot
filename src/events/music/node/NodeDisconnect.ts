import type { DiscordClient } from "@/clients/DiscordClient";
import { RainlinkEvent } from "@/structures/RainlinkEvent";
import { RainlinkEvents, type RainlinkNode } from "rainlink";

export default class extends RainlinkEvent {
	constructor() {
		super({
			name: RainlinkEvents.NodeDisconnect,
			enabled: true
		});
	}

	async run(client: DiscordClient, node: RainlinkNode) {
		client.logger.warn(`Nodo [${node.options.name}] desconectado.`);
	}
}
