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
	size: number;
}

export interface FileRequest {
	buffer: ArrayBuffer;
	metadata: {
		filename: string;
		size: number;
		format: string;
	};
}

export interface Process {
	name: string;
	cmd: string[];
	exe: string | null;
	pid: number;
	environ: string[];
	cwd: string | null;
	root: string | null;
	memory: number;
	virtual_memory: number;
	parent: number | null;
	status: ProcessStatus;
	start_time: number;
	run_time: number;
	cpu_usage: number;
	disk_usage: DiskUsage;
	user_id: string | null;
	effective_user_id: string | null;
	group_id: string | null;
	effective_group_id: string | null;
	session_id: number | null;
	count: number;
}

export type ProcessStatus =
	| "Idle"
	| "Run"
	| "Sleep"
	| "Stop"
	| "Zombie"
	| "Tracing"
	| "Dead"
	| "Wakekill"
	| "Waking"
	| "Parked"
	| "LockBlocked"
	| "UninterruptibleDiskSleep"
	| { Unknown: number };

export interface DiskUsage {
	total_written_bytes: number;
	written_bytes: number;
	total_read_bytes: number;
	read_bytes: number;
}
