import {PrismaClient} from "@prisma/client";
import {actionEmitter} from "../../emitter";

const prismaClient = new PrismaClient()

export const prisma = prismaClient.$extends({
    query: {
        action: {
            async create({query, model, operation, args}) {
                actionEmitter.emit("action_create", args.data.monitorName)
                console.log("Emitted event")
                return query(args);
            }
        }
    }
})