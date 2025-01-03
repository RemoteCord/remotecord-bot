import mongoose, { type ObjectId, type Model } from "mongoose";

export interface Config {
	_id?: ObjectId | string;
	serverid: string;
	channelid: string;
}

export const configSchema = new mongoose.Schema<Config>({
	serverid: { type: String, required: true, unique: true },
	channelid: { type: String, required: true }
});

// Creating a mongoose model for the todo document
export const Configs: Model<Config> =
	mongoose.models?.Servers || mongoose.model("Configs", configSchema);
