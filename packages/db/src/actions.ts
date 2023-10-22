import {ACTIONS} from "../lib/actions.constants";
import {prisma} from "./db";
import {Action} from "@prisma/client";

export async function getLastMonitorAction(monitorName: string) {
    //Return the newest item from the actions table for the given monitorName
    return prisma.action.findFirst({
        where: {
            type: ACTIONS.STATUS_UP || ACTIONS.STATUS_DOWN,
            monitorName
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}

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

export async function getLatestUnsentError() {
    return prisma.action.findFirst({
        where: {
            type: ACTIONS.ERROR || ACTIONS.ERROR_RECOVERED,
            sent: false
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}


export async function shouldNotify(monitorName?: string) {
    if (!monitorName) {
        const latestUnsentError = await getLatestUnsentError()
        const sendNotification = !!latestUnsentError;
        return {sendNotification, latestUnsentMessage: latestUnsentError}
    }
    const [latestSentMessage, latestUnsentMessage] = await Promise.all([
        prisma.action.findFirst({
            where: {
                monitorName,
                sent: true
            },
            orderBy: {
                timestamp: 'desc'
            }
        }),
        prisma.action.findFirst({
            where: {
                monitorName,
                sent: false
            },
            orderBy: {
                timestamp: 'desc'
            }
        })]);
    const sendNotification = latestSentMessage?.type !== latestUnsentMessage?.type
    return {sendNotification, latestUnsentMessage}
}

export async function markActionAsSent(actionId: Action["id"]) {
    return prisma.action.update({
        where: {
            id: actionId
        },
        data: {
            sent: true
        }
    });
}


