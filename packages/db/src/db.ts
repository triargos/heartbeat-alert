import { actionEmitter } from "@packages/emitter";
import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

export const prisma = prismaClient.$extends({
  query: {
    action: {
      async create({ query, model, operation, args }) {
        actionEmitter.emit(
          "action_create",
          args.data.type,
          args.data.monitorName,
          args.data.context,
        );
        return query(args);
      },
    },
  },
});
