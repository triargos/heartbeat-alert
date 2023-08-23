import axios, {AxiosError} from "axios";
import {env} from "../../../src/env";

import {z} from "zod"
import {elasticClient, getElasticQuery, parseElasticResponse} from "../../../src/elastic/elastic-client";
import {elasticConfig} from "../../../config/elastic";
import {ElasticHeartbeatResponse} from "../../../types/elastic";

export const elasticAuthResponse = z.object({
    username: z.string(),
    roles: z.array(z.string()),
    full_name: z.null(),
    email: z.null(),
    metadata: z.object({_reserved: z.boolean()}),
    enabled: z.boolean(),
    authentication_realm: z.object({name: z.string(), type: z.string()}),
    lookup_realm: z.object({name: z.string(), type: z.string()}),
    authentication_type: z.string()
})

export type ElasticAuthentication = z.infer<typeof elasticAuthResponse>


const elasticAuthClient = axios.create({
    baseURL: env.ELASTICSEARCH_URL,
})

export async function authenticate(username: string, password: string) {
    try {
        const response = await elasticAuthClient.get("/_security/authenticate", {
            auth: {
                username,
                password
            }
        });
        return elasticAuthResponse.parse(response.data);
    } catch (error) {
        if (error instanceof Error || error instanceof AxiosError) {
            throw new Error(`Authentication error: ${error.message}`)
        }
    }
}

export async function getElasticMonitors(){
    const query = getElasticQuery(10);
    const response = await elasticClient.post<ElasticHeartbeatResponse>(`/${elasticConfig.index}/_search`, {
        ...query
    })
    return parseElasticResponse(response.data);
}