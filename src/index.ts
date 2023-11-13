import {ACTIONS, getLastMonitorAction, getLatestError, shouldNotify} from "@packages/db";
import {actionEmitter} from "@packages/emitter";
import {Heartbeat} from "@packages/heartbeat/src/client";
import {Logger} from "@packages/logger";
import {env} from "./env";
import {readRules, readServiceConfig} from "./read-config";
import {notify} from "./send";

function watchMonitors() {
    const heartbeat = new Heartbeat(env.ELASTICSEARCH_API_KEY, env.ELASTICSEARCH_URL);
    const logger = new Logger();
    const config = readServiceConfig();
    setInterval(async () => {
        try {
            const monitors = await heartbeat.getMonitors();
            /**
             * Loop through each monitor and check if we have that status logged
             */
            for (const monitor of monitors) {
                const lastStatus = await getLastMonitorAction(monitor.name);
                /**
                 * If we don't have any status or the last status is not the same as the current one, we log it
                 */
                if (!lastStatus || JSON.parse(lastStatus.context).status !== monitor.status) {
                    await logger.status({monitorName: monitor.name, status: monitor.status});
                }
            }
        } catch (error) {
            /**
             * Check if we are already in error state
             */
            const errorMessage = error instanceof Error ? error.message : "Unable to retrieve status: Unknown error";
            const lastError = await getLatestError();
            /**
             * If we have an error, we check if it is recovered. If not, we log a new one
             */
            if (lastError && lastError.type !== ACTIONS.ERROR_RECOVERED) {
                await logger.error({cause: errorMessage})
            }
        }
    }, config.watchMonitorInterval * 1000)
}

/**
 * This function watches the actions table for changes and sends a message to slack
 */
function watchEvents() {
    actionEmitter.on("action_create", async (monitorName?: string) => {
            const {sendNotification, latestUnsentMessage} = await shouldNotify(monitorName);
            if (sendNotification && latestUnsentMessage) {
                const rules = readRules();
                const filteredRules = rules.filter(rule => rule.event === latestUnsentMessage?.type);
                for (const rule of filteredRules) {
                    await notify(latestUnsentMessage, rule)
                }
            }
        }
    )
}

function index() {
    watchMonitors();
    watchEvents();
}

index()




