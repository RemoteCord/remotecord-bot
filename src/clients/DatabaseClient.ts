import { Logger } from "@/shared/Logger";
import mongoose from "mongoose";

const MONGO_URL = process.env.DATABASE_URL!;

export class DatabaseClient {
	// static readonly Session = Session;

	constructor() {
		this.connect().catch((error: unknown) => Logger.error("ERROR", error));
	}

	private async connect() {
		try {
			await mongoose.connect(MONGO_URL);

			Logger.info("SUCCESS", "Connected to MongoDB");
		} catch (error) {
			Logger.error("DATABASE", error);
		}
	}
}
