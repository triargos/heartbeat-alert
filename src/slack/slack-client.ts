import axios from "axios";
import {App} from "../alert/uptime";
import {env} from "../env";
import {blockHeader, divider, errorBlock, errorImageBlock, messageConfig, statusBlock} from "./message-blocks";
import {DateTime} from "luxon";


export const slackClient = axios.create({baseURL: env.SLACK_WEBHOOK_URL})

export function sendAppStatusUpdates(apps: App[]) {
    const blocks = generateBlocks(apps)
    return slackClient.post("", {
        text: "",
        blocks
    })
}

export function sendErrorMessage(errorMessage: string) {
    const timeStamp = DateTime.now().toFormat("yyyy-MM-dd HH:mm:ss")
    const blocks = [errorBlock(errorMessage, timeStamp), errorImageBlock(errorMessage, timeStamp)]
    return slackClient.post("", {
        text: "",
        blocks
    })
}


export function sendMessage(message: string, type: "ERROR" | "SUCCESS") {
    return slackClient.post("", {
        attachments: [{
            text: message,
            color: type === "SUCCESS" ? messageConfig.successColor : messageConfig.errorColor
        }]
    })
}

function generateBlocks(apps: App[]) {
    const blocks: any[] = [blockHeader, divider]
    apps.forEach(app => {
        //Get the status itself
        const appStatusBlock = getAppStatusBlock(app)
        const appContextBlock = getAppContextBlock(app)
        blocks.push(appStatusBlock)
        if (appContextBlock) blocks.push(appContextBlock)
        blocks.push(divider)

    })
    return blocks
}


function getAppStatusBlock(app: App) {
    const statusText = (app: App) => {
        const emoji = app.status === "up" ? messageConfig.successEmoji : messageConfig.errorEmoji
        return `${emoji} *${app.name}* is *${app.status.toUpperCase()}*\n${app.url}`
    }
    return statusBlock(statusText(app))
}

function getAppContextBlock(app: App) {
    if (!app.tags) return undefined;
    return {
        "type": "context",
        "elements": app.tags.map(tag => {
            return {
                "type": "mrkdwn",
                "text": tag
            }
        })
    }
}
