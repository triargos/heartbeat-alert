import * as fs from "fs";
import * as path from "path";
import {z} from "zod";
import {ACTIONS, CHANNELS} from "../packages/db";

export type Rule = z.infer<typeof ruleSchema>;

function getTypedObjectKeys<T extends object>(object: T) {
    return Object.keys(object) as (keyof typeof object)[];
}

const [firstEventKey, ...otherEventKey] = getTypedObjectKeys(ACTIONS);
const [firstChannelKey, ...otherChannelKeys] = getTypedObjectKeys(CHANNELS);

const ruleSchema = z.object({
    event: z.enum([firstEventKey, ...otherEventKey]),
    channels: z.array(z.enum([firstChannelKey, ...otherChannelKeys])),
    after_seconds: z.number()
})

export function readRules() {
    const directoryPath = path.join(__dirname, "..", "config", "rules");
    const files = fs.readdirSync(directoryPath);
    const rules: z.infer<typeof ruleSchema>[] = [];
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        try {
            const data = fs.readFileSync(filePath, "utf8");
            const json = JSON.parse(data);
            rules.push(ruleSchema.parse(json));
        } catch (e) {
            console.log("Error reading file", filePath, e);
        }
    }
    return rules;
}

const serviceSchema = z.object({
    watchMonitorInterval: z.number(),
    watchEventsInterval: z.number(),
});

const defaultServiceConfig = {
    watchMonitorInterval: 30,
    watchEventsInterval: 30,
}


export function readServiceConfig() {
    try {
        const filePath = path.join(__dirname, "..", "config", "services.json");
        const data = fs.readFileSync(filePath, "utf8");
        const json = JSON.parse(data);
        return serviceSchema.parse(json)
    } catch (e) {
        return defaultServiceConfig;
    }
}