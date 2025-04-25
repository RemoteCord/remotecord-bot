import HttpClient from "@/clients/HttpClient";

export class EndpointsInteractions {

    constructor(
        private readonly controllerid: string,
    ) { }

    async getStats() {
        const stats = await HttpClient.axios.get<{
            connections: number;
            clients: number;
            commands: number;
            web_analytics: {
                visitors: number;
                views: number;
                sessions: number;
            };
        }>({
            url: `/controllers/stats`
        });

        return stats
    }

    async getFriends() {
        const { clients } = await HttpClient.axios.get<{
            clients: Array<{
                clientid: string;
                isactive: boolean;
                isconnected: boolean;
                alias: string;
            }>;
        }>({
            url: `/controllers/${this.controllerid}/friends`
        });


        return clients
    }

    async getUploadLargeFileUrl() {
        const res = await HttpClient.axios.post<string>({
            url: `/controllers/${this.controllerid}/upload-large-file`,
            data: {}
        }).catch(() => (null));

        console.log(res);

        return res
    }

    async getCameras(data: {
        messageid: string
    }) {
        const res = await HttpClient.axios.post<{ status: boolean; isAlreadyActivated: boolean }>({
            url: `/controllers/${this.controllerid}/cameras`,
            data
        });

        return res
    }

    async activateController(data: {
        picture: string,
        name: string,

    }) {
        const res = await HttpClient.axios.post<{ status: boolean; isAlreadyActivated: boolean }>({
            url: `/controllers/${this.controllerid}/activate`,
            data
        });

        return res
    }

    async addFriend(data: {
        clientid: string;
        name: string;
        picture: string;
    }) {
        const res = await HttpClient.axios.post<{ status: boolean; isAlreadyAdded: boolean }>({
            url: `/controllers/${this.controllerid}/add-friend`,
            data
        });

        return res
    }

    async disconnectClient() {
        const res = await HttpClient.axios.post<{ status: boolean }>({
            url: `/controllers/${this.controllerid}/disconnect-client`,

        });

        return res
    }
}