import { ClusterManager, HeartbeatManager, ReClusterManager } from "discord-hybrid-sharding";
import axios from "axios";
import type { ShardRequest } from "@/types/Shard";
import { ConfigService } from "@/shared/ConfigService";
import { Logger } from "./shared/Logger";

const configData = new ConfigService();
const { config } = configData;

const botPath = `${process.cwd()}/src/bot.ts`;

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
	// console.log("Token:", token);
	let clusterId: number;
	const recommendedShards = await getRecommendedShards();
	// console.log("Recomendación de shards:", recommendedShards);

	const clusterTotal = Math.round(recommendedShards.totalShards / 16);

	// console.log("Recomendación de shards:", recommendedShards);

	// Crear una instancia de ClusterManager
	const manager = new ClusterManager(botPath, {
		totalShards: recommendedShards.totalShards,
		shardsPerClusters: 16,
		totalClusters: recommendedShards.large ? clusterTotal : "auto",
		mode: "process",
		token,
		execArgv: [...process.execArgv],
		restarts: {
			max: 5,
			interval: 60000 * 60
		}
	});

	// console.log("aaaaaaaaaaaaaaaaaaaa");

	manager.extend(
		new HeartbeatManager({
			interval: 2000,
			maxMissedHeartbeats: 5
		})
	);

	manager.extend(
		new ReClusterManager({
			restartMode: "rolling"
		})
	);

	manager.on("clusterCreate", (cluster) => {
		clusterId = cluster.id;
		console.log(
			`|-------------------------- Cluster ${cluster.id} / ${clusterTotal} lanzado en el bot --------------------------|`
		);
	});

	manager.on("debug", (msg) => {
		if (msg === `[CM => Cluster ${String(clusterId)}] Ready`) {
			console.log(
				`|------------------------------ Cluster ${clusterId} preparado! ------------------------------|`
			);
		}
	});

	manager.spawn({ timeout: -1 }).catch((err: unknown) => {
		console.error("Error al iniciar el clúster:", err);
	});

	manager.on("message", (message) => {
		console.log(message);
	});

	// Connect to WebSocket server
}

process
	.on("unhandledRejection", (error) =>
		Logger.error("AntiCrash - UnhandledRejection", error as string)
	)
	.on("uncaughtException", (error) =>
		Logger.error("AntiCrash - UncaughtException", error as unknown as string)
	)
	.on("uncaughtExceptionMonitor", (error) =>
		Logger.error("AntiCrash - UncaughtExceptionMonitor", error)
	)
	.on("exit", () => Logger.info("Manager - Exit", "Se ha cerrado el bot correctamente"))
	.on("SIGINT", () => {
		Logger.info("Manager - SIGINT", "Cerrando bot...");
		process.exit(0);
	});

try {
	void start();
} catch (err) {
	console.error("Error en el proceso de inicio:", err);
}
