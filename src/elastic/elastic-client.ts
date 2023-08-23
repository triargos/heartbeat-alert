import axios from "axios";
import {elasticConfig} from "../../config/elastic";
import {ElasticHeartbeatResponse} from "../../types/elastic";
import {env} from "../env";

export const elasticClient = axios.create({baseURL: env.ELASTICSEARCH_URL, headers: {
    "Authorization": `ApiKey ${env.ELASTICSEARCH_API_KEY}`
    }})

export async function getMonitorStatus(){
    return elasticClient.post(`/${elasticConfig.index}/_search`, {
        ...getElasticQuery(elasticConfig.minutesAgo)
    })
}

export function parseElasticResponse(data: ElasticHeartbeatResponse) {
    try {
        return data.aggregations.by_monitors.buckets.map((bucket) => {
            const name = bucket.key;
            const status = bucket.top_hit.hits.hits[0]._source.monitor.status;
            const tags = bucket.top_hit.hits.hits[0]._source.tags
            const url = bucket.top_hit.hits.hits[0]._source.url.full;
            const id = bucket.top_hit.hits.hits[0]._source.monitor.id;
            const type = bucket.top_hit.hits.hits[0]._source.monitor.type;
            return {name, status, url, tags, id, type}
        });
    } catch (error) {
        throw new Error("Error parsing response");
    }
}


export function getElasticQuery(minutesAgo: number){
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
                                    "monitor.id",
                                    "monitor.status",
                                    "monitor.type",
                                    "url.full",
                                    "url.domain",
                                    "tags"
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

