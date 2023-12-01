import {ACTION, ACTIONS, CHANNEL, evictOldActions, getLatestError} from "@packages/db";
import {actionEmitter} from "@packages/emitter";
import {Heartbeat} from "@packages/heartbeat/src/client";
import {Logger} from "@packages/logger";
import {env} from "./env";
import {notifyChannel, notifyErrorMessage, shouldNotify, shouldNotifyErrorMessage} from "./send";
import {evictOldMessages} from "@packages/db/src/messages";
import {readServiceConfig} from "./read-config";

function watchMonitors() {
    const heartbeat = new Heartbeat(env.ELASTICSEARCH_API_KEY, env.ELASTICSEARCH_URL);
    const logger = new Logger();
    const config = readServiceConfig();
    setInterval(async () => {
        try {
            await evictOldActions();
            await evictOldMessages();
            logger.info("Checking monitors")
            const monitors = await heartbeat.getMonitors();
            for (const monitor of monitors) {
                logger.info(`Checking ${monitor.name}`)
                await logger.status({monitorName: monitor.name, status: monitor.status});
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Unable to retrieve status: Unknown error";
            const lastError = await getLatestError();
            if (lastError && lastError.type !== ACTIONS.ERROR_RECOVERED) {
                await logger.error({cause: errorMessage})
            }
        }
    }, config.watchMonitorInterval * 1000)
}


function watchEvents() {
    const logger = new Logger();
    actionEmitter.on("action_create", async (type: ACTION, monitorName?: string, context?: string) => {
            if (!monitorName) {
                const channelsToNotify = await shouldNotifyErrorMessage(type) as CHANNEL[];
                for (const channel of channelsToNotify) {
                    logger.info(`Notifying ${channel} for ${type}`)
                    await notifyErrorMessage(channel, type, context)
                }
                return;
            }
            //Get the channels to notify
            const channelsToNotify = await shouldNotify(monitorName, type);
            for (const channel of channelsToNotify) {
                logger.info(`Notifying ${channel} for ${monitorName} ${type}`)
                await notifyChannel(monitorName, channel, type)
            }
        }
    )

}

function index() {
    watchMonitors();
    watchEvents();
}

index()




