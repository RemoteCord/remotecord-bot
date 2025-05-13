import type { DiscordClient } from "@/clients/DiscordClient";
import { EndpointsInteractions } from "@/services/interactions/endpoints-interactions";
import { emojis, fallbackAvatar } from "@/shared";
import { Logger } from "@/shared/Logger";
// import { WsService, ClusterService } from "@/services";
import { DiscordEvent } from "@/structures/DiscordEvent";
import { Events, type GuildMember } from "discord.js";
import { type Socket } from "socket.io-client";
// import clusterWorker from "node:cluster";

export default class extends DiscordEvent {
	constructor() {
		super({
			name: Events.GuildMemberAdd,
			enabled: true,
			rest: false
		});
	}

	run = async (client: DiscordClient, ws: Socket, member: GuildMember) => {
		try {
			const endpointsInteractions = new EndpointsInteractions(member.user.id);

			const userAvatar = member.user.avatarURL() ?? member.user.defaultAvatarURL;

			// console.log("Member joined", member.user.username, userAvatar);

			const res = await endpointsInteractions.activateController({
				picture: userAvatar ?? fallbackAvatar,
				name: member.user.username
			});

			// console.log("Bot is ready", client.cluster.id);
			// console.log(res);

			if (res.status) {
				// console.log("Channel", channel);
				await member.send({
					content: `${emojis.Success} Welcome! We've automatically activated your account. You can now take advantage of all of the bot's features.`
				});
			} else {
				if (res.isAlreadyActivated) {
					await member.send({
						content: `${emojis.Success} Welcome! Your account is already activated. You do not need to activate your account again.`
					});
					return;
				}

				await member.send(
					"👋 Welcome to RemoteCord! Please run the </activate:1350102731074961433> command to activate your account."
				);
			}
		} catch (error) {
			await member.send(
				"👋 Welcome to RemoteCord! Please run the </activate:1350102731074961433> command to activate your account."
			);
		}
		//
	};
}
