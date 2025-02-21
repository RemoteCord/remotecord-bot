export interface FileMulterWs {
	controllerid: string;
	file: FileRequest;
}

export interface DirEntry {
	/** The name of the entry (file name with extension or directory name). */
	name: string;
	/** Specifies whether this entry is a directory or not. */
	isDirectory: boolean;
	/** Specifies whether this entry is a file or not. */
	isFile: boolean;
	/** Specifies whether this entry is a symlink or not. */
	isSymlink: boolean;
}

export interface GetFilesFolder {
	controllerid: string;
	files: DirEntry[];
	folder: string;
	relativepath: string;
}

export interface FileRequest {
	buffer: ArrayBuffer;
	metadata: {
		filename: string;
		size: number;
		format: string;
	};
}
