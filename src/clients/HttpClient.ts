import axios from "axios";
import type { AxiosError } from "axios";

interface FetchOptions {
	url: string;
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	headers?: Record<string, string>;
	body?: string | FormData | URLSearchParams | any;
}

const { API_TOKEN, API_URL } = process.env;

class FetchClient {
	private async customFetch<ResponseJSON>(config: FetchOptions): Promise<ResponseJSON> {
		const url = `${config.url}`;

		Reflect.deleteProperty(config, "url");

		return fetch(url, config).then(async (response) => {
			if (!response.ok) {
				throw new Error(response.statusText);
			}

			const contentType = response.headers.get("Content-Type");
			switch (contentType) {
				case "text/plain":
					return (await response.text()) as unknown as Promise<ResponseJSON>;
				case "application/octet-stream":
					return (await response.arrayBuffer()) as unknown as Promise<ResponseJSON>;
				case "multipart/form-data":
				case "application/x-www-form-urlencoded":
					return (await response.formData()) as unknown as Promise<ResponseJSON>;
				default:
					return (await response.json()) as Promise<ResponseJSON>;
			}
		});
	}

	async get<ResponseJSON>(config: Omit<FetchOptions, "method">): Promise<ResponseJSON> {
		return this.customFetch<ResponseJSON>({ ...config, method: "GET" });
	}

	async post<ResponseJSON>(config: Omit<FetchOptions, "method">): Promise<ResponseJSON> {
		return this.customFetch<ResponseJSON>({ ...config, method: "POST" });
	}

	async patch<ResponseJSON>(config: Omit<FetchOptions, "method">): Promise<ResponseJSON> {
		return this.customFetch<ResponseJSON>({ ...config, method: "PATCH" });
	}

	async put<ResponseJSON>(config: Omit<FetchOptions, "method">): Promise<ResponseJSON> {
		return this.customFetch<ResponseJSON>({ ...config, method: "PUT" });
	}

	async delete<ResponseJSON>(config: Omit<FetchOptions, "method">): Promise<ResponseJSON> {
		return this.customFetch<ResponseJSON>({ ...config, method: "DELETE" });
	}
}

interface AxiosOptions {
	url: string;
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	headers?: Record<string, string>;
	data?: string | FormData | URLSearchParams | any;
	params?: Record<string, string>;
}

class AxiosClient {
	private async customAxios<ResponseJSON>(config: AxiosOptions): Promise<ResponseJSON> {
		const headers = {
			...config.headers,
			"Content-Type": "application/json",
			Authorization: API_TOKEN
		};

		const { url } = config;

		// @ts-ignore aaa
		return axios<ResponseJSON>({
			...config,
			headers,
			url: `${API_URL}${url}`
		}).then((response) => response.data);
	}

	async get<ResponseJSON>(config: Omit<AxiosOptions, "method">): Promise<ResponseJSON> {
		return this.customAxios<ResponseJSON>({
			...config,
			method: "GET"
		});
	}

	async post<ResponseJSON>(config: Omit<AxiosOptions, "method">): Promise<ResponseJSON> {
		return this.customAxios<ResponseJSON>({
			...config,
			method: "POST"
		});
	}

	async patch<ResponseJSON>(config: Omit<AxiosOptions, "method">): Promise<ResponseJSON> {
		return this.customAxios<ResponseJSON>({
			...config,
			method: "PATCH"
		});
	}

	async put<ResponseJSON>(config: Omit<AxiosOptions, "method">): Promise<ResponseJSON> {
		return this.customAxios<ResponseJSON>({
			...config,
			method: "PUT"
		});
	}

	async delete<ResponseJSON>(config: Omit<AxiosOptions, "method">): Promise<ResponseJSON> {
		return this.customAxios<ResponseJSON>({
			...config,
			method: "DELETE"
		});
	}
}

class HttpClient {
	static readonly axios: AxiosClient = new AxiosClient();
	static readonly fetch: FetchClient = new FetchClient();

	static handleErrors(error: unknown) {
		let { message = "An unknown error occurred" } = error as Error;
		if (error instanceof AxiosError) {
			const { response } = error;

			if (typeof response?.data === "object") {
				message =
					response?.data?.errors?.[0]?.message ||
					response?.data?.error?.message ||
					response?.data?.message;
			} else if (typeof response?.data === "string") {
				const trimmedData = response.data.trim();
				const errorText = trimmedData.length > 0 ? trimmedData : response.statusText;

				message = errorText;
			}
		}

		if (message.includes("<!DOCTYPE html>")) {
			message = "Unavailable Service";
		}

		return message;
	}
}

export default HttpClient;
