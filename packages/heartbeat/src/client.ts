import axios, {AxiosInstance} from "axios";
import {monitorQuery} from "./query";
import {monitorSchema} from "../lib/monitor-schema";

export type Monitor = {
    name: string,
    id: string,
    status: string,
}

export class Heartbeat {
    private client: AxiosInstance

    constructor(apiKey: string, baseUrl: string) {
        this.client = axios.create({
            baseURL: baseUrl, headers: {
                "Authorization": `ApiKey ${apiKey}`
            }
        })
    }

    private async fetchMonitors() {
        const response = await this.client.post("heartbeat-*/_search", {
            ...monitorQuery
        })
        return monitorSchema.parse(response.data)
    }

    private extractMonitors(data: Awaited<ReturnType<typeof this.fetchMonitors>>) {
        const monitors: Monitor[] = [];
        if (data.aggregations && data.aggregations.by_monitors && data.aggregations.by_monitors.buckets) {
            const buckets = data.aggregations.by_monitors.buckets;

            for (const bucket of buckets) {
                if (bucket.top_hit && bucket.top_hit.hits && bucket.top_hit.hits.hits.length > 0) {
                    const hit = bucket.top_hit.hits.hits[0]._source;

                    const monitor: Monitor = {
                        name: hit.monitor.name,
                        id: hit.monitor.id,
                        status: hit.monitor.status,
                    };

                    monitors.push(monitor);
                }
            }
        }
        return monitors;
    }

    async getMonitors() {
        const response = await this.fetchMonitors()
        return this.extractMonitors(response)
    }


}