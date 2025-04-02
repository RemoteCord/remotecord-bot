import { type DiscordClient } from "@/clients/DiscordClient";
import { Logger } from "@/shared/Logger";
import { type WsScreensToBot, type WsScreenshot } from "@/types/ws-events.types";
import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export class WsScreenshotEvents {
	constructor(private readonly client: DiscordClient) {}

	getScreenshot = async (data: WsScreenshot) => {
		const { controllerid, screenshot } = data;
		const owner = await this.client.users.fetch(controllerid);

		// console.log("Screenshot received", screenshot, controllerid);

		if (owner) {
			const attachment = new AttachmentBuilder(Buffer.from(screenshot), {
				name: "screenshot.png"
			});

			await owner.send({
				// content: `Screenshot from: ${controllerid}`,
				files: [attachment]
			});
			Logger.info(`Screenshot sent to owner with ID: ${controllerid}`);
		} else {
			Logger.warn(`Owner not found for ID: ${controllerid}`);
		}
	};

	getScreens = async (data: WsScreensToBot) => {
		const { controllerid, screens, messageid } = data;

		Logger.info("Sending screens", screens, "to controller", controllerid, "with id:", messageid);

		const owner = await this.client.users.fetch(controllerid);
		const dmChannel = await owner.createDM();

		const buttons = screens.map((screen, idx) => {
			const button = new ButtonBuilder()
				.setCustomId(`screen-${screen.id}-${messageid}`)
				.setLabel(`Screen ${idx + 1}`)
				.setStyle(ButtonStyle.Secondary);
			return button;
		});

		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buttons);

		await dmChannel.messages.fetch(messageid).then(async (message) => {
			if (!message) return console.log("No message found.");
			// await message.delete();
			await message.edit({
				content: `Select a screen`,
				components: [row]
			});
		});

		// await owner.send({
		// 	content: `Select a screen`,
		// 	components: [row]
		// });
	};
}
