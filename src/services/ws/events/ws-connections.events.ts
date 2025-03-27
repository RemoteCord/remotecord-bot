import { type DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import { type WsConnection } from "@/types/ws-events.types";

export class WsConnectionsEvents {
	constructor(private readonly client: DiscordClient) {}

	connection = async (data: WsConnection) => {
		try {
			const { controllerid, clientid, alias } = data;

			const owner = await this.client.users.fetch(controllerid);
			if (owner) {
				const embed = {
					title: "Client Connected",
					description: `A client has successfully connected `,
					fields: [
						{
							name: "Alias",
							value: alias,
							inline: false
						},
						{
							name: "Client ID",
							value: clientid,
							inline: false
						}
					],
					color: 0x00ff00,
					timestamp: new Date().toISOString()
				};
				Logger.info(`Client with ID: ${clientid} connected`);

				await owner.send({ embeds: [embed] });
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		} catch (error) {
			Logger.error("Error sending message", error);
		}
	};

	disconnect = async (data: WsConnection) => {
		try {
			const { controllerid, clientid, alias } = data;

			if (!controllerid || controllerid === "null") {
				Logger.warn("Invalid controller ID received");
				return;
			}

			const owner = await this.client.users.fetch(controllerid);
			if (owner) {
				const embed = {
					title: "Client Disconnected",
					description: `A client has been disconnected from your session`,
					fields: [
						{
							name: "Alias",
							value: alias,
							inline: false
						},
						{
							name: "Client ID",
							value: clientid,
							inline: false
						}
					],
					color: 0xff0000,
					timestamp: new Date().toISOString()
				};

				await owner.send({ embeds: [embed] });
				Logger.info(`Client with ID: ${clientid} disconnected`);
			} else {
				Logger.warn(`Owner not found for ID: ${controllerid}`);
			}
		} catch (error) {
			Logger.error("Error sending message", error);
		}
	};
}
