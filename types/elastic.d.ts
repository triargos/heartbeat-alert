export interface ElasticHeartbeatResponse {
    took: number
    timed_out: boolean
    _shards: Shards
    hits: Hits
    aggregations: Aggregations
}

export interface Shards {
    total: number
    successful: number
    skipped: number
    failed: number
}

export interface Hits {
    total: Total
    max_score: any
    hits: Hit[]
}

export interface Total {
    value: number
    relation: string
}

export interface Aggregations {
    by_monitors: ByMonitors
}

export interface ByMonitors {
    doc_count_error_upper_bound: number
    sum_other_doc_count: number
    buckets: Bucket[]
}

export interface Bucket {
    key: string
    doc_count: number
    top_hit: TopHit
}

export interface TopHit {
    hits: Hits
}


export interface Hit {
    _index: string
    _id: string
    _score: any
    _source: Source
    sort: number[]
}

export interface Source {
    url: Url
    monitor: Monitor
}

export interface Url {
    domain: string
    full: string
}

export interface Monitor {
    name: string
    status: string
}
