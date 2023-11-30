import {ACTIONS, getLastMonitorActions, getLatestError} from "@packages/db";
import {findMonitor, setMonitorDown, setMonitorUp} from "@packages/db/src/monitors";
import {actionEmitter, monitorEmitter} from "@packages/emitter";
import {Heartbeat} from "@packages/heartbeat/src/client";
import {Logger} from "@packages/logger";
import {env} from "./env";
import {readRules, readServiceConfig} from "./read-config";
import {notifyMonitorDown, notifyMonitorUp} from "./send";

function watchMonitors() {
    const heartbeat = new Heartbeat(env.ELASTICSEARCH_API_KEY, env.ELASTICSEARCH_URL);
    const logger = new Logger();
    const config = readServiceConfig();
    setInterval(async () => {
        try {
            logger.info("Checking monitors")
            const monitors = await heartbeat.getMonitors();
            console.log(monitors)
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
    actionEmitter.on("action_create", async (monitorName?: string) => {
            if (monitorName) {
                const lastMonitorActions = await getLastMonitorActions(monitorName);
                if (lastMonitorActions.length < 3) {
                    return;
                }
                const allDown = lastMonitorActions.every(action => action.type === ACTIONS.STATUS_DOWN);
                const allUp = lastMonitorActions.every(action => action.type === ACTIONS.STATUS_UP);
                if (allDown) {
                    logger.info(`Updating status for ${monitorName}: down`)
                    await setMonitorDown(monitorName)
                }
                if (allUp) {
                    logger.info(`Updating status for ${monitorName}: up`)
                    await setMonitorUp(monitorName)
                }
            } else {
                console.error("There was an error")
            }
        }
    )
    monitorEmitter.on("monitor_down", async (monitorId: number) => {
        const monitor = await findMonitor(monitorId);
        if (!monitor) {
            console.error("This monitor does not exist")
            return;
        }
        logger.info(`Detected down status of ${monitor.name}`)
        const rules = readRules();
        const downRules = rules.filter(rule => rule.event === ACTIONS.STATUS_DOWN);
        for (const rule of downRules) {
            logger.info(`Notifying ${rule.channels.join(", ")} about ${monitor.name} being down`)
            await notifyMonitorDown(monitor, rule)
        }
    })
    monitorEmitter.on("monitor_up", async (monitorId: number) => {
        const monitor = await findMonitor(monitorId);
        if (!monitor) {
            console.error("This monitor does not exist")
            return;
        }
        logger.info(`Detected up status of ${monitor.name}`)
        const rules = readRules();
        const upRules = rules.filter(rule => rule.event === ACTIONS.STATUS_UP);
        for (const rule of upRules) {
            logger.info(`Notifying ${rule.channels.join(", ")} about ${monitor.name} being up`)
            await notifyMonitorUp(monitor, rule)
        }
    })
}

function index() {
    watchMonitors();
    watchEvents();
}

index()




