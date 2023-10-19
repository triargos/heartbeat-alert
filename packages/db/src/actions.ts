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

export async function getLastError() {
    return prisma.action.findFirst({
        where: {
            type: ACTIONS.ERROR || ACTIONS.ERROR_RECOVERED
        },
        orderBy: {
            timestamp: "desc"
        }
    })
}

export async function getLatestActionsToSend() {
    //Get all monitors first
    const uniqueMonitors = await prisma.action.findMany({
        where: {
            sent: false
        },
        orderBy: {
            timestamp: 'desc'
        },
        distinct: ['monitorName']
    });
    const actionsToSend: Action[] = [];
    for (const monitor of uniqueMonitors) {
        const latestSentAction = await prisma.action.findFirst({
            where: {
                monitorName: monitor.monitorName,
                sent: true
            },
            orderBy: {
                timestamp: 'desc'
            }
        });
        const latestUnsentAction = await prisma.action.findFirst({
            where: {
                monitorName: monitor.monitorName,
                sent: false
            },
            orderBy: {
                timestamp: 'desc'
            }
        });
        if (latestUnsentAction && latestSentAction?.type !== latestUnsentAction?.type) {
            actionsToSend.push(latestUnsentAction);
        }

    }
    return actionsToSend;
}


export async function markActionAsSent(action: Action) {
    const monitorsToUpdate = await prisma.action.findMany({
        where: {
            monitorName: action.monitorName,
            timestamp: {lte: action.timestamp}
        },
    });
    for (const monitor of monitorsToUpdate) {
        await prisma.action.update({
            where: {id: monitor.id},
            data: {sent: true},
        });
    }
    return prisma.action.update({
        where: {
            id: action.id
        },
        data: {
            sent: true
        }
    })
}


