import { DatabaseClient } from "@/clients/DatabaseClient";
import { Servers } from ".";

export class Create {
	static async createServer({
		server_name,
		server_url,
		server_id,
		owner_id
	}: {
		server_name: string;
		server_url: string;
		server_id: string;
		owner_id: string;
	}) {
		try {
			new DatabaseClient();

			console.log("Creating server...", server_name, server_url, server_id);

			const server = new Servers({
				server_name,
				server_url,
				server_id,
				owner_id
			});

			const res = await server.save();
			console.log(res);
			return res;
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
