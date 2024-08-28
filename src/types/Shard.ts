export interface ShardRequest {
	url: string;
	session_start_limit: SessionStartLimit;
	shards: number;
}

export interface SessionStartLimit {
	max_concurrency: number;
	remaining: number;
	reset_after: number;
	total: number;
}
