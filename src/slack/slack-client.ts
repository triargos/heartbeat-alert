import axios from "axios";
import {App, UptimeStore} from "../state/uptime";


const statusText = (app: App) => {
    const emoji = app.status === "up" ? "🟢" : "🔴"
    return `${emoji} *${app.name}* is *${app.status.toUpperCase()}*\n${app.url}`
}

export class SlackClient {
    private readonly webhookUrl: string;
    private readonly successColor: string = "#48A868";
    private readonly errorColor: string = "#CC3643";

    constructor(webhookUrl: string) {
        this.webhookUrl = webhookUrl;
    }
    async sendAppStatusUpdate(apps: App[]) {
        const blocks: any[] = generateBlocks(apps)
        return axios.post(this.webhookUrl, {
            text: "",
            blocks: blocks
        })
    }
    sendMessage(message
                    :
                    string, type
                    :
                    "ERROR" | "SUCCESS"
    ) {
        return axios.post(this.webhookUrl, {
            attachments: [{
                text: message,
                color: type === "SUCCESS" ? this.successColor : this.errorColor
            }]
        })
    }
}
function generateBlocks(apps: App[]) {
    const sortedApps = UptimeStore.sortAppsByStatus(apps)
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
        blocks.push(divider)
    }
    return blocks
}

