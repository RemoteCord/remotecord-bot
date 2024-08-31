import type { DiscordClient } from "@/clients/DiscordClient";
import type { RainlinkEventProps } from "@/types/Structures";
import type { RainlinkEventsInterface } from "rainlink";

export class RainlinkEvent {
	name: keyof RainlinkEventsInterface;
	enabled: boolean;

	constructor({ name, enabled }: RainlinkEventProps) {
		this.name = name;
		this.enabled = enabled || true;
	}

	async run(client: DiscordClient, ...args: any[]) {
		throw new Error("Method not implemented.");
	}
}
