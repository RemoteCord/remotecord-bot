export function fromBytesToMB(totalMemoryBytes: number) {
	return Math.round(totalMemoryBytes / (1024 * 1024));
}
