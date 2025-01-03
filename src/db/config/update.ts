import { DatabaseClient } from "@/clients/DatabaseClient";
import { Configs } from ".";

export default class Update {
	static async updateConfig({ serverid, channelid }: { serverid: string; channelid: string }) {
		try {
			new DatabaseClient();

			const exists = await Configs.exists({ serverid });

			if (exists) {
				await Configs.updateOne({ serverid }, { channelid });
			} else {
				await Configs.create({ serverid, channelid });
			}
		} catch (error) {
			console.error(error);
		}
	}
}
