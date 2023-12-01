import * as fs from "node:fs";
import * as path from "path";
import { ACTIONS, CHANNELS } from "@packages/db";
import { z } from "zod";

const defaultConfig = {
  watchMonitorInterval: 60,
  rules: [
    {
      event: "STATUS_DOWN",
      channels: ["SLACK"],
    },
    {
      event: "STATUS_UP",
      channels: ["SLACK"],
    },
    {
      event: "ERROR",
      channels: ["SLACK"],
    },
    {
      event: "ERROR_RECOVERED",
      channels: ["SLACK"],
    },
  ],
};

function getTypedObjectKeys<T extends object>(object: T) {
  return Object.keys(object) as (keyof typeof object)[];
}

const [firstEventKey, ...otherEventKey] = getTypedObjectKeys(ACTIONS);
const [firstChannelKey, ...otherChannelKeys] = getTypedObjectKeys(CHANNELS);

const configSchema = z.object({
  watchMonitorInterval: z.number(),
  rules: z
    .array(
      z.object({
        event: z.enum([firstEventKey, ...otherEventKey]),
        channels: z.array(z.enum([firstChannelKey, ...otherChannelKeys])),
      }),
    )
    .default([]),
});

function readConfig() {
  const data = fs.readFileSync(".heartbeat.json", "utf8");
  return configSchema.parse(JSON.parse(data));
}

export function readRules() {
  return readConfig().rules;
}

export function readServiceConfig() {
  try {
    return readConfig();
  } catch (e) {
    console.log("Couldn't read service config", e);
    return defaultConfig;
  }
}
