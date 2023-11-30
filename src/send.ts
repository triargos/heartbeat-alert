import {ACTIONS, CHANNELS} from "@packages/db";
import {getLastMessageForChannel, logMessage} from "@packages/db/src/messages";
import {Slack} from "@packages/slack";
import {Monitor} from "@prisma/client";
import {DateTime} from "luxon";
import {env} from "./env";
import {Rule} from "./read-config";

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


export async function notifyMonitorDown(monitor: Monitor, rule: Rule) {
    //Check if we already sent a down notification in the last 12 hours
    for (const channel of rule.channels) {
        const lastSentMessage = await getLastMessageForChannel(monitor.id, channel);
        //We send if it doesnt exist, if is
        switch (lastSentMessage?.status) {
            case ACTIONS.STATUS_DOWN: {
                //Check if it has been 12 hours since the last notification
                if (DateTime.now().diff(DateTime.fromISO(lastSentMessage.timestamp)).as("hours") > 12) {
                    await channelHandlers[channel]().sendDownNotification({
                        appName: monitor.name,
                        previousStatus: "up",
                        currentStatus: "down"
                    });
                    //We need to log that we sent something
                    await logMessage(monitor.id, channel, ACTIONS.STATUS_DOWN);
                }
                break;
            }
            case ACTIONS.STATUS_UP: {
                //If it was up before, we notify immediately
                await channelHandlers[channel]().sendDownNotification({
                    appName: monitor.name,
                    previousStatus: "up",
                    currentStatus: "down"
                });
                await logMessage(monitor.id, channel, ACTIONS.STATUS_DOWN);
            }
        }

    }
}

export async function notifyMonitorUp(monitor: Monitor, rule: Rule) {
    for (const channel of rule.channels) {
        const lastSentMessage = await getLastMessageForChannel(monitor.id, channel);
        switch (lastSentMessage?.status) {
            case ACTIONS.STATUS_DOWN: {
                //If it was down before, we notify immediately. Otherwise we dont notify
                await channelHandlers[channel]().sendDownNotification({
                    appName: monitor.name,
                    previousStatus: "up",
                    currentStatus: "down"
                });
                await logMessage(monitor.id, channel, ACTIONS.STATUS_UP);
            }
        }
    }
}