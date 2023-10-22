import {Action} from "@prisma/client";
import {env} from "./env";
import {Rule} from "./read-config";
import {ACTIONS, CHANNELS, markActionAsSent} from "../packages/db";
import {Slack} from "../packages/slack/src/client";
import {ErrorContext, MonitorStatusChangeContext} from "../packages/logger";

const channelHandlers = {
    [CHANNELS.SLACK]: () => {
        return new Slack(env.SLACK_WEBHOOK_URL)
    },
    [CHANNELS.EMAIL]: () => {
        return new Slack(env.SLACK_WEBHOOK_URL)
    },
    [CHANNELS.DISCORD]: () => {
        return new Slack(env.SLACK_WEBHOOK_URL)
    }
} as const


export async function notify(action: Action, rule: Rule) {
    switch (rule.event) {
        case ACTIONS.STATUS_UP: {
            const context = JSON.parse(action.context) as MonitorStatusChangeContext
            for (const channel of rule.channels) {
                await channelHandlers[channel]().sendUpNotification({
                    appName: context.monitorName,
                    previousStatus: "down",
                    currentStatus: context.status
                });
            }
            await markActionAsSent(action.id);
            break;
        }
        case ACTIONS.STATUS_DOWN: {
            const context = JSON.parse(action.context) as MonitorStatusChangeContext
            for (const channel of rule.channels) {
                await channelHandlers[channel]().sendDownNotification({
                    appName: context.monitorName,
                    previousStatus: "up",
                    currentStatus: context.status
                });
            }
            await markActionAsSent(action.id);
            break;
        }
        case ACTIONS.ERROR: {
            const context = JSON.parse(action.context) as ErrorContext
            for (const channel of rule.channels) {
                await channelHandlers[channel]().sendErrorNotification(context.cause);
            }
            await markActionAsSent(action.id);
            break;
        }
        case ACTIONS.ERROR_RECOVERED: {
            for (const channel of rule.channels) {
                await channelHandlers[channel]().sendErrorRecoveredNotification();
            }
            await markActionAsSent(action.id);
            break;
        }
    }
}
