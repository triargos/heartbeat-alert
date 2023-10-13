import {prisma} from "db/src/db";
import {parseIso} from "./luxon";
import {DateTime} from "luxon";
import {ACTIONS} from "db/lib/actions.constants";

export type MonitorStatusChangeContext = {
    monitorName: string
    status: string
}

export type ErrorContext = {
    cause: string;
}

export class Logger {

    async status(context: MonitorStatusChangeContext) {
        await prisma.action.create({
            data: {
                type: context.status === "up" ? ACTIONS.STATUS_UP : ACTIONS.STATUS_DOWN,
                context: JSON.stringify(context),
                timestamp: parseIso(DateTime.now()),
            }
        })
    }


    async down(context: MonitorStatusChangeContext) {
        await prisma.action.create({
            data: {
                type: ACTIONS.STATUS_DOWN,
                context: JSON.stringify(context),
                timestamp: parseIso(DateTime.now()),
                monitorName: context.monitorName
            }
        })
    }

    async up(context: MonitorStatusChangeContext) {
        await prisma.action.create({
            data: {
                type: ACTIONS.STATUS_UP,
                context: JSON.stringify(context),
                timestamp: parseIso(DateTime.now()),
                monitorName: context.monitorName
            }
        })
    }

    async error(context: ErrorContext) {
        await prisma.action.create({
            data: {
                type: ACTIONS.ERROR,
                context: JSON.stringify(context),
                timestamp: parseIso(DateTime.now()),
            }
        })
    }

    async recovered(context: ErrorContext) {
        await prisma.action.create({
            data: {
                type: ACTIONS.ERROR_RECOVERED,
                context: JSON.stringify(context),
                timestamp: parseIso(DateTime.now()),
            }
        })
    }

}