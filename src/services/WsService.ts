import type { DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type DMChannel
} from "discord.js";
import WebSocket from "ws"; // Import WebSocket

export default class WsService {
    constructor(client: DiscordClient) {
        this.startWsServer(client);
    }

    startWsServer(client: DiscordClient) {
        const ws = new WebSocket(`ws://localhost:${process.env.WEBSOCKET_PORT}?username=BOT`);

        ws.on("open", () => {
            Logger.info("Connected to WebSocket server");
        });

        ws.on("message", async (content) => {
            Logger.info(`Received message from WebSocket server: ${content}`);

            const data = JSON.parse(content.toString()); // { serverId: 'ID_DEL_SERVIDOR', content: 'MENSAJE' }

            const {
                id: serverid,
                message
            }: {
                id: string;
                message: string;
            } = data;

            const decline = new ButtonBuilder()
                .setCustomId("decline")
                .setLabel("Decline")
                .setStyle(ButtonStyle.Danger);
            const accept = new ButtonBuilder()
                .setCustomId("accept")
                .setLabel("Accept")
                .setStyle(ButtonStyle.Success);

            const embed = new EmbedBuilder()
                .setAuthor({ name: "aaaa" })
                .setDescription("aaaaa")
                .setColor(0x23272a);
            const row = new ActionRowBuilder<ButtonBuilder>().addComponents(accept, decline);

            // Directly send the message to the appropriate channel
            const guild = client.guilds.cache.get(serverid);
            if (guild) {
                const channel = guild.channels.cache.get("1322962839803134200") as unknown as DMChannel;
                if (channel) {
                    await channel.send({ components: [row], embeds: [embed] });
                    Logger.info(`Message sent to channel: ${channel.id}`);
                } else {
                    Logger.warn(`Channel not found for ID: 1322962839803134200`);
                }
            } else {
                Logger.warn(`Guild not found for ID: ${serverid}`);
            }
        });

        ws.on("close", () => {
            Logger.warn("Disconnected from WebSocket server");
        });
    }
}