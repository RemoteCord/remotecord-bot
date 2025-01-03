import chalk from "chalk";

export class Logger {
	public static info(...props: unknown[]): void {
		const timestamp = new Date().toLocaleString("pt-PT").replace(",", "");
		const prefix = chalk.bgHex("#38b3ff").white.bold(" info  ");
		const blueText = chalk.hex("#38b3ff");
		const grayText = chalk.hex("#707070");
		console.log(blueText(`${grayText(`${timestamp}`)} | ${prefix} | ${props.join(" ")}`));
	}

	public static log(...props: unknown[]): void {
		const timestamp = new Date().toLocaleString("pt-PT").replace(",", "");
		const prefix = chalk.bgHex("#4d4d4d").white.bold(" log   ");
		const grayText = chalk.hex("#707070");
		console.log(grayText(`${timestamp} | ${prefix} | ${props.join(" ")}`));
	}

	public static error(...props: unknown[]): void {
		const timestamp = new Date().toLocaleString("pt-PT").replace(",", "");
		const prefix = chalk.bgHex("#ff3c26").white.bold(" error ");
		const redText = chalk.hex("#ff3c26");
		const grayText = chalk.hex("#707070");
		console.log(redText(`${grayText(`${timestamp}`)} | ${prefix} | `, props.join(" ")));
	}

	public static warn(...props: unknown[]): void {
		const timestamp = new Date().toLocaleString("pt-PT").replace(",", "");
		const prefix = chalk.bgHex("#ffa600").white.bold(" warn  ");
		const orangeText = chalk.hex("#ffa600");
		const grayText = chalk.hex("#707070");
		console.log(orangeText(`${grayText(`${timestamp}`)} | ${prefix} | ${props.join(" ")}`));
	}
}
