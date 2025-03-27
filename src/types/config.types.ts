import type { ColorResolvable } from "discord.js";

export interface EnvConfig extends NodeJS.ProcessEnv {
	DISCORD_CLIENT_TOKEN?: string;
	DISCORD_CLIENT_ID?: string;
	PREFIX?: string;
	API_URL?: string;
	WS_URL?: string;
	ENV_URL?: string;
}

export interface Config {
	bot: ConfigBot;
	emojis: ConfigEmojis;
	colors: ConfigColors;
}

export interface YamlConfig {
	config: {
		bot: ConfigBotYaml;
		emojis: ConfigEmojis;
		colors: ConfigColors;
	};
}

interface ConfigBot extends ConfigBotYaml {
	TOKEN: string;
	ID: string;
	PREFIX: string;
}

interface ConfigBotYaml {
	ADMIN: string[];
	EMBED_COLOR: string;
	BETA_MODE: boolean;
}

interface ConfigEmojis {
	success: string;
	error: string;
}

export interface ConfigColors {
	burple: ColorResolvable;
	red: ColorResolvable;
	green: ColorResolvable;
	yellow: ColorResolvable;
	purple: ColorResolvable;
	black: ColorResolvable;
	white: ColorResolvable;
}
