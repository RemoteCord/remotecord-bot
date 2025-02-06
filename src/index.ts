import { DiscordClient } from "./clients/DiscordClient";
import { ConfigService } from "@/shared/ConfigService";
import { Config } from "./types/Config";

const configData = new ConfigService();
const config: Config = configData.config ?? ({} as Config);

// const botPath = `${process.cwd()}/src/bot.ts`;

// Create a new client instance
const client = new DiscordClient(config);

// Start the client
client.start().catch((error) => console.error(error));
