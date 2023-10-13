import axios, {AxiosInstance} from "axios";
import {messageConfig} from "../../../src/slack/message-blocks";
import {getStatusChangedToDownBlock, getStatusChangedToUpBlock} from "./block-creator";


type MessageType = "ERROR" | "SUCCESS"
export type NotificationProps = {
    appName: string,
    previousStatus: string,
    currentStatus: string
}

export class Slack {
    private client: AxiosInstance
    private successColor = "#48A868"
    private successEmoji = "🟢"
    private errorColor = "#CC3643"
    private errorEmoji = "🔴"

    constructor(baseUrl: string) {
        this.client = axios.create({baseURL: baseUrl})
    }

    private async sendMessage(message: string, type: MessageType) {
        return this.client.post("", {
            attachments: [{
                text: message,
                color: type === "SUCCESS" ? messageConfig.successColor : messageConfig.errorColor
            }]
        });
    }

    private async sendBlocks(blocks: object[]) {
        return this.client.post("", {
            text: "",
            blocks
        })
    }

    async sendUpNotification(props: NotificationProps) {
        const blocks = getStatusChangedToUpBlock(props)
        return this.sendBlocks(blocks)
    }

    async sendDownNotification(props: NotificationProps) {
        const blocks = getStatusChangedToDownBlock(props)
        return this.sendBlocks(blocks)
    }

    async sendApplicationError(message: string) {
        return this.sendMessage(message, "ERROR")
    }


}