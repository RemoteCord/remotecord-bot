import { embeds, emojis } from "@/shared";
import { type EndpointsInteractions } from "./endpoints-interactions";

export class EmbedsInteractions {
    constructor(private readonly controllerid: string, private readonly endpointsInteractions: EndpointsInteractions) { }

    async generateFriendsEmbed({
        title,
        description,
        color,
        options = {
            showConnectedEmoji: true
        },
    }: {
        title: string;
        description: string;
        color?: keyof typeof embeds.Colors;
        options?: {
            showConnectedEmoji?: boolean;

        }
    }) {

        const selectedColor = color ? embeds.Colors[color] : embeds.Colors.default;
        const clients = await this.endpointsInteractions.getFriends()

        const embedClients = {
            title,
            description,
            fields: [
                {
                    name: "Clients",
                    value: clients
                        .map((client) => {
                            let emoji;
                            if (client.isactive) {
                                if (client.isconnected) {
                                    emoji = emojis.Dnd;
                                } else {
                                    emoji = emojis.Online;
                                }
                            } else {
                                emoji = emojis.Offline;
                            }

                            return `* ${options?.showConnectedEmoji ? emoji : ""} ${client.alias} *(${client.clientid})*`;
                        })
                        .join("\n")
                }
            ],
            color: selectedColor
        };


        return {
            embedClients,
            clients
        }
    }
}