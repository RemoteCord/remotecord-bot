import { Command } from "@/structures/Command";
import { SlashCommandBuilder } from "discord.js";

export default class extends Command {
	constructor() {
		super({
			name: "ping",
			description: "Ping pong!",
			category: "devs",
			aliases: ["pong"],
			interaction: true,
			permissions: ["SEND_MESSAGES"],
			premium: false,
			enabled: true,
			slash: new SlashCommandBuilder().setName("ping").setDescription("Ping pong!")
		});
	}

	async run({ client, msg, ...args }) {
		// msg.reply("Pong!");
	}
}
