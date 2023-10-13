export const monitorQuery = {
    _source: ["@timestamp", "monitor.status", "monitor.name"],
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
                            from: `now-5m`,
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
                            ],
                        },
                        size: 1,
                    },
                },
            },
        },
    },
};