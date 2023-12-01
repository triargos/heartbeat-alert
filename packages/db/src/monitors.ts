import {Monitor} from "@prisma/client";
import {ACTIONS} from "../lib/actions.constants";
import {prisma} from "./db";

export async function setMonitorDown(monitorName: string) {
    return prisma.monitor.upsert({
        where: {
            name: monitorName
        },
        update: {
            status: ACTIONS.STATUS_DOWN
        },
        create: {
            name: monitorName,
            status: ACTIONS.STATUS_DOWN
        }
    })
}

export async function setMonitorUp(monitorName: string) {
    return prisma.monitor.upsert({
        where: {
            name: monitorName
        },
        update: {
            status: ACTIONS.STATUS_UP
        },
        create: {
            name: monitorName,
            status: ACTIONS.STATUS_UP
        }
    })
}

export async function findMonitor(monitorId: Monitor["id"]) {
    return prisma.monitor.findFirst({
        where: {
            id: monitorId
        }
    })
}

export async function findMonitorByName(monitorName: string){
    return prisma.monitor.findFirst({
        where: {
            name: monitorName
        }
    })
}