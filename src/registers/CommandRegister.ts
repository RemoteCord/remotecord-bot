import type { DiscordClient } from "@/clients/DiscordClient";
import type { Command } from "@/structures/Command";
import { REST, Routes } from "discord.js";
import { readdirSync } from "node:fs";

export class CommandRegister {
	static async registerCommands(client: DiscordClient) {
		const commandFolderPath = `${process.cwd()}/src/commands`;
		const commandFolders = readdirSync(commandFolderPath);
		for (const folder of commandFolders) {
			const commandFiles = readdirSync(`${commandFolderPath}/${folder}`).filter((file) =>
				file.endsWith(".ts")
			);
			for (const file of commandFiles) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-call
				const command: Command = new (
					await import(`file://${commandFolderPath}/${folder}/${file}`)
				).default();
				if (!command?.name) {
					client.logger.error(`Command ${file} in ${folder} failed to load`);
					break;
				}

				client.logger.info(`Loaded command: ${command.name}`);
				client.commands.set(command.name, command);
			}

			client.logger.info(`(${client.commands.size}/${client.commands.size})`);
		}
	}

	// Unused from orignal code. idk what these are for lol
	// static registerMenus(client: DiscordClient) {}
	// static registerButtons(client: DiscordClient) {}
	// static registerSelectMenus(client: DiscordClient) {}
	// static registerContextMenus(client: DiscordClient) {}

	static async registerSlashApi(client: DiscordClient) {
		const slashCommands = client.commands
			.filter((command) => command.slash && command.enabled)
			.map((command) => command.slash);

		const rest = await new REST({ version: "10" })
			.setToken(client.config.bot.TOKEN)
			.put(Routes.applicationCommands(client.config.bot.ID), { body: slashCommands })
			.then(() => client.logger.info("Loaded Slash Commands correctly!"));

		return rest;
	}
}
