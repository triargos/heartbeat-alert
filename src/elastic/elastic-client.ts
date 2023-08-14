import axios from "axios";
import {elasticConfig} from "../../config/elastic";
import {ElasticHeartbeatResponse} from "../../types/elastic";
import {App} from "../state/uptime";

export class ElasticClient {
    private readonly elasticServiceUrl: string;
    private readonly apiKey: string;
    private readonly index: string;

    constructor(elasticServiceUrl: string, apiKey: string, index: string) {
        this.elasticServiceUrl = elasticServiceUrl;
        this.apiKey = apiKey;
        this.index = index;
    }

    async getStatus() {
        const url = `${this.elasticServiceUrl}/${this.index}/_search`;
        return axios.post<ElasticHeartbeatResponse>(url, {
            ...getElasticQuery(elasticConfig.minutesAgo),
        }, {
            headers: {
                "Authorization": `ApiKey ${this.apiKey}`
            }
        })
    }


}

export function parseElasticResponse(data: ElasticHeartbeatResponse) {
    try {
        return data.aggregations.by_monitors.buckets.map((bucket) => {
            const name = bucket.key;
            const status = bucket.top_hit.hits.hits[0]._source.monitor.status;
            const url = bucket.top_hit.hits.hits[0]._source.url.full;
            return {name, status, url}
        });
    } catch (error) {
        throw new Error("Error parsing response");
    }
}


function getElasticQuery(minutesAgo: number){
    return {
        _source: ["@timestamp", "monitor.status", "monitor.name", "url.full"],
        sort: [
            {
                "@timestamp": {
                    order: "desc",
                },
            },
        ],
        size: 0,
        query: {
            bool: {
                should: [
                    {
                        term: {
                            "monitor.status": {
                                value: "up",
                            },
                        },
                    },
                    {
                        term: {
                            "monitor.status": {
                                value: "down",
                            },
                        },
                    },
                ],
                filter: [
                    {
                        range: {
                            "@timestamp": {
                                from: `now-${minutesAgo}m`,
                            },
                        },
                    },
                ],
            },
        },
        aggregations: {
            by_monitors: {
                terms: {
                    field: "monitor.name",
                    size: 9999
                },
                aggs: {
                    top_hit: {
                        top_hits: {
                            sort: [
                                {
                                    "@timestamp": {
                                        order: "desc",
                                    },
                                },
                            ],
                            _source: {
                                includes: [
                                    "monitor.name",
                                    "monitor.status",
                                    "url.full",
                                    "url.domain",
                                ],
                            },
                            size: 1,
                        },
                    },
                },
            },
        },
    };
}

