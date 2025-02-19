import type { DiscordClient } from "@/clients/DiscordClient";
import HttpClient from "@/clients/HttpClient";
import type { CommandHandler } from "@/handlers/CommandHandler";
import { Command } from "@/structures/Command";
import { CustomPermissions } from "@/types/Permissions";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "testapi",
			description: "testapi!",
			category: "testapi",
			aliases: ["dev"],
			interaction: true,
			userPermissions: [],
			botPermissions: [],
			customPermissions: [CustomPermissions.BotAdmin],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("testapi").setDescription("test api!")
		});
	}

	async run(client: DiscordClient, handler: CommandHandler, ...args: any[]): Promise<void> {
		const res = await HttpClient.axios
			.post({
				url: "/bot/files/send",
				data: {
					controllerid: "546000599267672074",
					fileurl:
						"https://cdn.discordapp.com/ephemeral-attachments/1341764920240242752/1341769420833558619/VirtualBoxVM_8MX8RcVcKQ.png?ex=67b733a6&is=67b5e226&hm=e01f715708965dc34380af3b6500f368ade10157add3fc72b1b13d9c24fdb799&"
				}
			})
			.then((res) => res)
			.catch((err: unknown) => {
				console.log(err);
			});

		console.log(res);

		await handler.reply({
			content: `Test api`
		});
	}
}
