import { DiscordClient } from "./clients/DiscordClient";
import { ConfigService } from "@/shared/ConfigService";
import { type Config } from "./types/config.types";

// Sentry.init({
// 	dsn: "http://4c52f7ce1a82424d9753673df394f5b4@192.168.192.84:8000/2"
// });

const configData = new ConfigService();
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
const config: Config = configData.config ?? ({} as Config);

// const botPath = `${process.cwd()}/src/bot.ts`;

// Create a new client instance
const client = new DiscordClient(config);

// Start the client
client.start().catch((error: unknown) => console.error(error));
