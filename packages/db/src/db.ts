import {PrismaClient} from "@prisma/client";
import {actionEmitter, monitorEmitter} from "@packages/emitter";
import {ACTIONS} from "../lib/actions.constants";

const prismaClient = new PrismaClient()

export const prisma = prismaClient.$extends({
    query: {
        action: {
            async create({query, model, operation, args}) {
                actionEmitter.emit("action_create", args.data.monitorName);
                return query(args);
            }
        },
        monitor: {
            async upsert({query, model, operation, args}) {
                if (args.create.status === ACTIONS.STATUS_DOWN || args.update.status === ACTIONS.STATUS_DOWN) {
                    const id = args.update.id || args.create.id
                    monitorEmitter.emit("monitor_down", id)
                }
                if (args.create.status === ACTIONS.STATUS_UP || args.update.status === ACTIONS.STATUS_UP) {
                    const id = args.update.id || args.create.id
                    monitorEmitter.emit("monitor_up", id)
                }
                return query(args);
            }
        }
    }
})