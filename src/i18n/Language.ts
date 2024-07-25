import type { Locales, LanguageFile } from "@/types/Language";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import yaml from "js-yaml";

export class Language {
	public static get(language: Locales, file: LanguageFile, key: string, params?: Record<string, string>): string {
		const languagePath = join(__dirname, "..", "i18n", "languages", language, `${file}.yml`);
		const langFile = yaml.load(readFileSync(languagePath, "utf8"));

		if (!langFile) console.error(`Language file not found: ${languagePath}`);

		const value = (langFile as Record<string, string>)[key];
		if (!value) console.error(`Key not found: ${key}`);

		if (params) return this.replaceParams(value, params);

		return key;
	}

	private static replaceParams(value: string, params: Record<string, string>): string {
		let newValue = value;
		for (const key of Object.keys(params)) {
			newValue = value.replace(`%{${key}}`, params[key]);
		}

		return newValue;
	}
}
