import {sendAppStatusUpdates, sendErrorMessage, sendMessage} from "./slack/slack-client";
import {getMonitorStatus, parseElasticResponse} from "./elastic/elastic-client";
import {elasticConfig} from "../config/elastic";
import {getChangedApps} from "./alert/uptime";
import {Axios, AxiosError} from "axios";
import {errorBlock} from "./slack/message-blocks";

async function getStatus() {
    const response = await getMonitorStatus()
    return parseElasticResponse(response.data);
}

function index() {
    let hasError = false;
    sendMessage(`🚀 The monitoring service has started! Expect the first status update in 20 seconds 🚀`, "SUCCESS").then(() => console.log("Initialized"))
    setInterval(async () => {
        try {
            const status = await getStatus()
            const changedApps = getChangedApps(status)
            changedApps.length > 0 && await sendAppStatusUpdates(changedApps)
            hasError = false;
        } catch (error: unknown) {
            if (!hasError) {
                const errorMessage = error instanceof Error || error instanceof AxiosError ? error.message : "Error reading status. Please check your configuration"
                await sendErrorMessage(errorMessage);
            }
            console.log(error)
            hasError = true;
        }
    }, elasticConfig.intervalSeconds * 1000)

}

index()




