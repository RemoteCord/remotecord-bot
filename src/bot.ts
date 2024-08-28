import { DiscordClient } from "@/clients/DiscordClient";
import { ConfigService } from "@/shared/ConfigService";
const configService = new ConfigService();
const discordClient = new DiscordClient(configService.config!);

discordClient.start().catch((error: unknown) => {
	discordClient.logger.error(`Discord client failed to start ${error}`);
});
