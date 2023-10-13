import {z} from "zod"

export const monitorSchema = z.object({
    took: z.number(),
    timed_out: z.boolean(),
    _shards: z.object({
        total: z.number(),
        successful: z.number(),
        skipped: z.number(),
        failed: z.number()
    }),
    hits: z.object({
        total: z.object({value: z.number(), relation: z.string()}),
        max_score: z.null(),
        hits: z.array(z.unknown())
    }),
    aggregations: z.object({
        by_monitors: z.object({
            doc_count_error_upper_bound: z.number(),
            sum_other_doc_count: z.number(),
            buckets: z.array(
                z.object({
                    key: z.string(),
                    doc_count: z.number(),
                    top_hit: z.object({
                        hits: z.object({
                            total: z.object({value: z.number(), relation: z.string()}),
                            max_score: z.null(),
                            hits: z.array(
                                z.object({
                                    _index: z.string(),
                                    _id: z.string(),
                                    _score: z.null(),
                                    _source: z.object({
                                        url: z.object({domain: z.string(), full: z.string()}),
                                        monitor: z.object({
                                            id: z.string(),
                                            status: z.string(),
                                            name: z.string(),
                                            type: z.string()
                                        })
                                    }),
                                    sort: z.array(z.number())
                                })
                            )
                        })
                    })
                })
            )
        })
    })
})
