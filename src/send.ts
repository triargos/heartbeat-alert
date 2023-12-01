import {ACTION, ACTIONS, CHANNEL, CHANNELS, getLastMonitorActions} from "@packages/db";
import {getLastMessageForChannel, getLastMessageStatusForChannel, logMessage} from "@packages/db";
import {Slack} from "@packages/slack";
import {DateTime} from "luxon";
import {env} from "./env";
import {readRules} from "./read-config";

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


export async function notifyChannel(monitorName: string, channel: CHANNEL, status: ACTION) {
    const handler = channelHandlers[channel]();
    switch (status) {
        case ACTIONS.STATUS_DOWN: {
            await handler.sendDownNotification({
                appName: monitorName,
                previousStatus: "up",
                currentStatus: "down"
            })
            await logMessage({monitorName, channel, status});
            break;
        }
        case ACTIONS.STATUS_UP: {
            await handler.sendUpNotification({
                appName: monitorName,
                previousStatus: "down",
                currentStatus: "up"
            })
            await logMessage({monitorName, channel, status});
            break;
        }
    }
}

export async function notifyErrorMessage(channel: CHANNEL, status: ACTION, message?: string) {
    const handler = channelHandlers[channel]();
    switch (status) {
        case ACTIONS.ERROR: {
            const errorMessage = message || "An error occurred";
            await handler.sendErrorNotification(errorMessage);
            await logMessage({channel, status});
            break;
        }
        case ACTIONS.ERROR_RECOVERED: {
            await handler.sendErrorRecoveredNotification();
            await logMessage({channel, status});
            break;
        }
    }


}


export async function shouldNotify(monitorName: string, status: ACTION) {
    const rules = readRules().filter(rule => rule.event === status);
    //We check if the last three status updates were the same
    const lastThreeActions = await getLastMonitorActions(monitorName);
    const isSame = lastThreeActions.every(action => action.type === status);
    if (lastThreeActions.length < 3 || !isSame) {
        return [];
    }
    const channelsToNotify: CHANNEL[] = [];

    //We need to check each channel if we already sent a message
    for (const rule of rules) {
        for (const channel  of rule.channels) {
            const lastMessage = await getLastMessageForChannel(monitorName, channel);
            //The case where the last message has not been sent yet
            if (!lastMessage || lastMessage?.status !== status) {
                channelsToNotify.push(channel)
            } else {
                const diff = DateTime.now().diff(DateTime.fromISO(lastMessage.timestamp)).as("hours");
                if (diff > 12 && status === ACTIONS.STATUS_DOWN) {
                    channelsToNotify.push(channel)
                }
            }
        }
    }
    return channelsToNotify;
}


export async function shouldNotifyErrorMessage(status: ACTION) {
    const rules = readRules().filter(rule => rule.event === status);
    const channelsToNotify = await Promise.all(rules.map(async rule => {
        return await Promise.all(rule.channels.map(async channel => {
            //Check if we already sent an error
            const lastErrorMessage = await getLastMessageStatusForChannel(channel, status);
            if (!lastErrorMessage) {
                return channel
            }
            const diff = DateTime.now().diff(DateTime.fromISO(lastErrorMessage.timestamp)).as("hours");
            if (diff > 12 && status === ACTIONS.STATUS_DOWN) {
                return channel
            }
            return null;
        }))
    }))
    return channelsToNotify.flat().filter(Boolean)
}