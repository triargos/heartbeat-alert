import {env} from "./env";
import {Heartbeat} from "../packages/heartbeat/src/client";
import {Logger, MonitorStatusChangeContext} from "../packages/logger/src/logger";
import {getLatestActionsToSend, getLastError, getLastMonitorAction} from "../packages/db/src/actions";
import {ACTIONS} from "../packages/db/lib/actions.constants";
import {readRules, readServiceConfig} from "./read-config";
import {sendMessages} from "./send-messages";

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
            const lastError = await getLastError();
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
    const config = readServiceConfig();
    setInterval(async () => {
        try {
            const unsentEvents = await getLatestActionsToSend();
            //If we do not have anything unsent, we can just skip
            if (unsentEvents.length === 0) {
                return;
            }
            const rules = readRules();
            for (const rule of rules) {
                const actions = unsentEvents.filter(action => {
                    return action.type === rule.event
                })
                for (const action of actions) {
                    await sendMessages(action, rule);
                }
            }
        } catch (e) {
            console.log("Error sending messages", e);
        }
    }, config.watchEventsInterval * 1000)
}

function index() {
    watchMonitors();
    watchEvents();
}

index()




