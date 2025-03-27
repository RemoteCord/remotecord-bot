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
}

export interface WsScreenshot {
	controllerid: string;
	screenshot: ArrayBuffer;
}

export interface WsScreensToBot {
	controllerid: string;
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
