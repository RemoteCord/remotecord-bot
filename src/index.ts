import { ClusterManager } from "discord-hybrid-sharding";
import axios from "axios";
import type { ShardRequest } from "@/types/Shard";
import { ConfigService } from "@/shared/ConfigService";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const configData = new ConfigService();
const { config } = configData;

const __dirname = dirname(fileURLToPath(import.meta.url));

async function getRecommendedShards() {
	const response = await axios.get<ShardRequest>("https://discord.com/api/v10/gateway/bot", {
		headers: {
			Authorization: `Bot ${config?.bot.TOKEN}`
		}
	});

	const totalShards = response.data.shards;

	if (totalShards < 144)
		return {
			totalShards,
			large: false
		};

	let shards = totalShards;
	while (shards % 16 !== 0) {
		shards++;
	}

	return {
		totalShards: shards,
		large: true
	};
}

async function start() {
	const token = config?.bot.TOKEN;
	let clusterId: number;
	const recommendedShards = await getRecommendedShards();

	const clusterTotal = Math.round(recommendedShards.totalShards / 16);

	// Crear una instancia de ClusterManager
	const manager = new ClusterManager(join(__dirname, "./bot.ts"), {
		totalShards: recommendedShards.totalShards,
		shardsPerClusters: 16,
		totalClusters: recommendedShards.large ? clusterTotal : "auto",
		mode: "worker",
		token
	});

	manager.on("clusterCreate", (cluster) => {
		clusterId = cluster.id;
		console.log(`|-------------------------- Cluster ${cluster.id} / ${clusterTotal} lanzado en el bot --------------------------|`);
	});

	manager.on("debug", (msg) => {
		if (msg === `[CM => Cluster ${String(clusterId)}] Ready`) {
			console.log(`|------------------------------ Cluster ${clusterId} preparado! ------------------------------|`);
		}
	});

	manager.spawn({ timeout: -1 }).catch((err: unknown) => {
		console.error("Error al iniciar el clúster:", err);
	});
}

try {
	void start();
} catch (err) {
	console.error("Error en el proceso de inicio:", err);
}
