import type { DiscordClient } from "@/clients/DiscordClient";
import type { EventProps } from "@/types/Structures";
import { type Socket } from "socket.io-client";

export class DiscordEvent {
	name: string;
	enabled: boolean;
	rest: boolean;

	constructor({ name, enabled, rest }: EventProps) {
		this.name = name;
		this.enabled = enabled || true;
		this.rest = rest;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	run = (client: DiscordClient, ws: Socket, ...args: any[]): any => {};
}
