import yaml from "js-yaml";
import { readFileSync } from "node:fs";
import { Logger } from "./Logger";
import { config } from "dotenv";
import type { Config, EnvConfig, YamlConfig, ConfigColors } from "@/types/Config";

config();

const path = process.cwd();

export class ConfigService {
	private yamlConfig: YamlConfig | undefined;
	private readonly logger: typeof Logger;
	public config: Config | undefined;

	constructor() {
		this.logger = Logger;
		this.setup();
	}

	setup() {
		this.getYamlConfig();
		this.getConfig();
		if (!this.checkConfig()) process.exit(1);
	}

	checkConfig() {
		let valid = true;
		const configKeys = Object.keys(this.config!);
		const defaultConfigKeys = Object.keys(this.getDefaultConfig());
		const missingKeys = defaultConfigKeys.filter((key) => !configKeys.includes(key));
		if (missingKeys.length) {
			this.logger.error(`Missing keys in config file: ${missingKeys.join(", ")}`);
			valid = false;
		}

		console.log("aaaaaaaaaaa");

		for (const key of defaultConfigKeys) {
			// @ts-expect-error key is a valid key
			if (!this.config![key]) {
				this.logger.error(`Missing config for key [${key}]`);
				valid = false;
				continue;
			}

			// @ts-expect-error key is a valid key
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const keys = Object.keys(this.config![key]);

			// @ts-expect-error key is a valid key
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			const defaultKeys = Object.keys(this.getDefaultConfig()[key]);
			const missingKeys = defaultKeys.filter((key) => !keys.includes(key));

			if (missingKeys.length) {
				this.logger.error(`Missing keys in [${key}]: ${missingKeys.join(", ")}`);
				valid = false;
			}

			for (const key of keys) {
				// @ts-expect-error key is a valid key
				const value = this.config![key];
				// @ts-expect-error key is a valid key
				const defaultValue = this.getDefaultConfig()[key];
				if (typeof value !== typeof defaultValue) {
					this.logger.error(`Invalid value type for key [${key}]`);
					valid = false;
				}
			}
		}

		console.log("aaaaaaaaaaa");

		return valid;
	}

	getYamlConfig() {
		const pathToConfig = `${path}/config.yml`;
		if (!pathToConfig) this.logger.error("Config file not found");
		const doc = yaml.load(readFileSync(pathToConfig, "utf8"));
		if (!doc) this.logger.error("Config file is empty");
		this.logger.info("Config file loaded");
		this.yamlConfig = doc as YamlConfig;
	}

	getEnvConfig(): EnvConfig {
		const envConfig: EnvConfig = process.env;
		return {
			DISCORD_CLIENT_TOKEN: envConfig.DISCORD_CLIENT_TOKEN,
			DISCORD_CLIENT_ID: envConfig.DISCORD_CLIENT_ID,
			PREFIX: envConfig.PREFIX
		};
	}

	getConfig() {
		const envConfig = this.getEnvConfig();
		if (!envConfig.DISCORD_CLIENT_TOKEN) this.logger.error("Missing environment variables");
		const defaultConfig = this.getDefaultConfig();
		const config = this.yamlConfig?.config;

		this.config = {
			bot: {
				TOKEN: envConfig.DISCORD_CLIENT_TOKEN ?? defaultConfig.bot.TOKEN,
				ID: envConfig.DISCORD_CLIENT_ID ?? defaultConfig.bot.ID,
				PREFIX: envConfig.PREFIX ?? defaultConfig.bot.PREFIX,
				...(config?.bot ?? defaultConfig.bot)
			},

			emojis: config?.emojis ?? defaultConfig.emojis,
			colors: config?.colors ?? (defaultConfig.colors as ConfigColors)
		};
	}

	getDefaultConfig() {
		return {
			bot: {
				TOKEN: "",
				ID: "",
				PREFIX: "!",
				EMBED_COLOR: "#5865f2",
				ADMIN: [],

				BETA_MODE: false
			},

			emojis: {
				success: "✅",
				error: "❌"
			},
			colors: {
				burple: "#5865f2",
				red: "#ed4245",
				green: "#57f287",
				yellow: "#fee75c",
				purple: "#a443f0",
				black: "#23272a",
				white: "#f8f9fa"
			}
		};
	}
}
