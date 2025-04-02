declare module "axios" {
	export interface AxiosError {
		response: {
			data: {
				message: string;
				error: string;
				statusCode: number;
				status: number;
			};
		};
	}
}
