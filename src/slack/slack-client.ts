import axios from "axios";
import {App, UptimeStore} from "../state/uptime";
import {env} from "../env";

const messageConfig = {
    successColor: "#48A868",
    successEmoji: "🟢",
    errorColor: "#CC3643",
    errorEmoji: "🔴",

}


export const slackClient = axios.create({baseURL: env.SLACK_WEBHOOK_URL})

export function sendAppStatusUpdates(apps: App[]) {
    const blocks = generateBlocks(apps)
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
    const sortedApps = UptimeStore.sortAppsByStatus(apps)
    const statusText = (app: App) => {
        const emoji = app.status === "up" ? messageConfig.successEmoji : messageConfig.errorEmoji
        return `${emoji} *${app.name}* is *${app.status.toUpperCase()}*\n${app.url}`
    }
    const blockHeader = {
        type: "header",
        text: {
            type: "plain_text",
            text: "Monitoring: Status change detected",
            emoji: true
        }
    }
    const divider = {
        type: "divider"
    }
    const blocks: any[] = [blockHeader, divider]
    for (const app of sortedApps) {
        /**
         * First we push the section itself
         */
        blocks.push({
            type: "section",
            text: {
                type: "mrkdwn",
                text: statusText(app)
            },
            accessory: {
                type: "button",
                text: {
                    type: "plain_text",
                    emoji: true,
                    text: "View"
                },
                url: "https://monitoring.timzolleis.com/app/uptime"
            }
        })
        /**
         * Then we add the tags as context (such as the operating platform or the system environment
         */
        blocks.push({
            "type": "context",
            "elements": app.tags.map(tag => {
                return {
                    "type": "mrkdwn",
                    "text": tag
                }
            })
        },)
        //After that we add a divider
        blocks.push(divider)
    }
    return blocks
}

