import {sendAppStatusUpdates, sendMessage} from "./slack/slack-client";
import {getMonitorStatus, parseElasticResponse} from "./elastic/elastic-client";
import {elasticConfig} from "../config/elastic";
import {getChangedApps} from "./alert/uptime";
import {AxiosError} from "axios";

async function getStatus() {
    const response = await getMonitorStatus()
    return parseElasticResponse(response.data);
}

function index() {
    sendMessage(`🚀 The monitoring service has started! Expect the first status update in 20 seconds 🚀`, "SUCCESS").then(() => console.log("Initialized"))
    setInterval(async () => {
        try {
            const status = await getStatus()
            const changedApps = getChangedApps(status)
            changedApps.length > 0 && await sendAppStatusUpdates(changedApps)
        } catch (error: unknown) {
            if (error instanceof Error || error instanceof AxiosError) {
                await sendMessage(error.message, "ERROR")
            } else await sendMessage("Error reading status. Please check your configuration", "ERROR")
        }
    }, elasticConfig.intervalSeconds * 1000)

}

index()




