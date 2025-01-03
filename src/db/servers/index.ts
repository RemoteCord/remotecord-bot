import mongoose, { type ObjectId, type Model } from "mongoose";

export interface Admins {
	id: string;
	rol?: "admin" | "owner";
	level?: number;
	name: string;
}

export interface Server {
	_id?: ObjectId | string;
	server_name: string;
	server_url: string;
	server_id: string;
	form: [Record<string, string | string[] | number>];
	admins: Admins[];
	owner_id: string;
}

export const serverSchema = new mongoose.Schema<Server>({
	server_name: { type: String, required: true },
	server_url: { type: String, required: true },
	server_id: { type: String, required: true, unique: true },
	admins: [
		{
			id: { type: String, required: true },
			rol: { type: String, required: false, default: "admin" },
			name: { type: String, required: true },
			level: { type: Number, required: false, default: 0 }
		}
	],
	form: [{ type: Object, required: false, default: [] }],
	owner_id: { type: String, required: true }
});

// Creating a mongoose model for the todo document
export const Servers: Model<Server> =
	mongoose.models?.Servers || mongoose.model("Servers", serverSchema);
