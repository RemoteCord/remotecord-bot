import type { DiscordClient } from "@/clients/DiscordClient";

export default class ClusterService {
	guilds: string[] = [];

	constructor(client: DiscordClient) {
		void this.start(client);
	}

	async start(client: DiscordClient) {
		this.guilds = (
			await client.cluster.broadcastEval(
				(cluster, context) => cluster.guilds.cache.map((guild) => guild.id),
				{
					context: {}
				}
			)
		).flat();

		console.log("Guilds", this.guilds);
	}
}
