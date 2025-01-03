import { DatabaseClient } from "@/clients/DatabaseClient";
import { Servers } from ".";

export class Delete {
	static async deleteServer({ server_id }: { server_id: string }) {
		try {
			new DatabaseClient();

			console.log("Deleting server...", server_id);
			await Servers.deleteOne({ server_id });
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}
