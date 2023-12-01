import {parseIso} from "@packages/logger/src/luxon";
import {DateTime} from "luxon";
import {prisma} from "./db";
import {ACTION, CHANNEL} from "../lib/actions.constants";


export async function getLastMessageForChannel(monitorName: string, channel: string) {
    return prisma.message.findFirst({
        where: {
            channel,
            monitorName
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}


export async function logMessage({monitorName, channel, status}: {
    monitorName?: string,
    channel: CHANNEL,
    status: ACTION
}) {
    return prisma.message.create({
        data: {
            status,
            monitorName,
            timestamp: parseIso(DateTime.now()),
            channel,
        }
    })
}

export async function getLastMessageStatusForChannel(channel: CHANNEL, status: ACTION) {
    return prisma.message.findFirst({
        where: {
            channel,
            status
        }
    })
}

export async function evictOldMessages() {
    const now = parseIso(DateTime.now().minus({days: 5}))
    return prisma.message.deleteMany({
        where: {
            timestamp: {
                lt: now
            }
        }
    })
}