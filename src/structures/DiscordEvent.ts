import type { DiscordClient } from "@/clients/DiscordClient";
import type { EventProps } from "@/types/Structures";

export class DiscordEvent {
	name: string;
	enabled: boolean;
	rest: boolean;

	constructor({ name, enabled, rest }: EventProps) {
		this.name = name;
		this.enabled = enabled || true;
		this.rest = rest;
	}

	async run(client: DiscordClient, ...args: any[]): Promise<void> {
		throw new Error("Method not implemented.");
	}
}
