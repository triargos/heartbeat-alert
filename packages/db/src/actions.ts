import {parseIso} from "@packages/logger/src/luxon";
import {DateTime} from "luxon";
import {ACTIONS} from "../lib/actions.constants";
import {prisma} from "./db";
import {Action} from "@prisma/client";


export async function getLatestError() {
    return prisma.action.findFirst({
        where: {
            type: ACTIONS.ERROR || ACTIONS.ERROR_RECOVERED
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}


export async function getLastMonitorActions(monitorName: string) {
    const fiveMinutesAgo = parseIso(DateTime.now().minus({minutes: 5}))
    return prisma.action.findMany({
        where: {
            monitorName,
            timestamp: {
                gte: fiveMinutesAgo
            },
        },
        take: 3
    });
}


