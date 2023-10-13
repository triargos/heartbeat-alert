import {prisma} from "./db";
import {ACTIONS} from "../lib/actions.constants";

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

//TODO: Correct function
export async function getUnsentActions(channel: string) {
    //Find all actions for a given channel that do not have any sent actions
    return prisma.action.findMany({
        where: {
            sentActions: {
                every: {
                    channel,

                }
            }
        }
    })
}