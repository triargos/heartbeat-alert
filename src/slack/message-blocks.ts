import {App} from "../alert/uptime";
import {env} from "../env";

export const messageConfig = {
    successColor: "#48A868",
    successEmoji: "🟢",
    errorColor: "#CC3643",
    errorEmoji: "🔴",

}

export const blockHeader = {
    type: "header",
    text: {
        type: "plain_text",
        text: "Monitoring: Status change detected",
        emoji: true
    }
}
export const divider = {
    type: "divider"
}

export const errorBlock = (errorMessage: string, timestamp: string) => (
    {
        "type": "section",
        "text": {
            "type": "mrkdwn",
            "text": "*Error checking status:*"
        }
    }
)

export const errorImageBlock = (errorMessage: string, timestamp: string) => ({
    "type": "section",
    "text": {
        "type": "mrkdwn",
        "text": `*Description:*\nThe Alerting service entered a failure status because of the following error:\n*Error cause*:\n${errorMessage}\n*First occurrence:* \n${timestamp}`
    },
    "accessory": {
        "type": "image",
        "image_url": "https://i.imgur.com/0sV8bCq.png",
        "alt_text": "error image"
    }
})


export const statusBlock = (statusText: string) => (
    {
        type: "section",
        text: {
            type: "mrkdwn",
            text: statusText
        },
        accessory: {
            type: "button",
            text: {
                type: "plain_text",
                emoji: true,
                text: "View"
            },
            url: `${env.KIBANA_URL}/app/uptime`
        }
    }
)