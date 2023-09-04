import {z} from "zod";
require('dotenv').config();
const envSchema = z.object({
    SLACK_WEBHOOK_URL: z.string(),
    ELASTICSEARCH_API_KEY: z.string(),
    ELASTICSEARCH_URL: z.string(),
    KIBANA_URL: z.string(),
});

export const env = envSchema.parse(process.env);