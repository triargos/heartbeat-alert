import {parseIso} from "@packages/logger/src/luxon";
import {Monitor} from "@prisma/client";
import {DateTime} from "luxon";
import {ACTIONS} from "../lib/actions.constants";
import {prisma} from "./db";

export async function getLastDownNotificationForChannel(monitorId: Monitor["id"], channel: string) {
    return prisma.message.findFirst({
        where: {
            channel,
            monitorId,
            status: ACTIONS.STATUS_DOWN
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}

export async function getLastMessageForChannel(monitorId: Monitor["id"], channel: string) {
    return prisma.message.findFirst({
        where: {
            channel,
            monitorId
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}


export async function getLastUpNotificationForChannel(monitorId: Monitor["id"], channel: string) {
    return prisma.message.findFirst({
        where: {
            channel,
            monitorId,
            status: ACTIONS.STATUS_UP
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}

export async function logMessage(monitorId: Monitor["id"], channel: string, status: string) {
    return prisma.message.create({
        data: {
            status,
            timestamp: parseIso(DateTime.now()),
            channel,
            monitorId
        }
    })
}