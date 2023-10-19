import {Action} from "@prisma/client";
import {DateTime} from "luxon";
import {CHANNELS} from "../packages/db/lib/actions.constants";
import {markActionAsSent} from "../packages/db/src/actions";
import {MonitorStatusChangeContext} from "../packages/logger/src/logger";
import {Slack} from "../packages/slack";
import {env} from "./env";
import {Rule} from "./read-config";


export function shouldBeSent(action: Action, rule: Rule) {
    const now = DateTime.now();
    const actionTime = DateTime.fromISO(action.timestamp);
    const diff = now.diff(actionTime).as("seconds");
    return diff >= rule.after_seconds;
}

export async function sendMessages(action: Action, rule: Rule) {
    //First, we need to determine if we need to send a message
    if (shouldBeSent(action, rule)) {
        //Determine the type
        switch (rule.event) {
            case "STATUS_DOWN":
                console.log("Sending down messages")
                await sendDownMessages(action, rule);
                break;
            case "STATUS_UP":
                console.log("Sending up messages")
                await sendUpMessages(action, rule);
                break;
        }
    }
}


async function sendDownMessages(action: Action, rule: Rule) {
    if (rule.channels.includes(CHANNELS.SLACK)) {
        const context = JSON.parse(action.context) as MonitorStatusChangeContext;
        const client = new Slack(env.SLACK_WEBHOOK_URL);
        try {
            await client.sendDownNotification({
                appName: context.monitorName,
                previousStatus: "up",
                currentStatus: context.status
            });
            await markActionAsSent(action);
        } catch (e) {
            console.log("Error sending slack message", e);
        }
    }
}

async function sendUpMessages(action: Action, rule: Rule) {
    if (rule.channels.includes(CHANNELS.SLACK)) {
        const context = JSON.parse(action.context) as MonitorStatusChangeContext;
        const client = new Slack(env.SLACK_WEBHOOK_URL);
        try {
            await client.sendUpNotification({
                appName: context.monitorName,
                previousStatus: "down",
                currentStatus: context.status
            });
            await markActionAsSent(action);
        } catch (e) {
            console.log("Error sending slack message", e);
        }
    }
    //TODO: Implement more channels
}

