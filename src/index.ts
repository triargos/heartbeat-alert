import {Heartbeat} from "heartbeat/src/client";
import {env} from "./env";
import {Logger, MonitorStatusChangeContext} from "logger/src/logger";
import {getLastError, getLastMonitorAction} from "db/src/actions";
import {ACTIONS} from "db/lib/actions.constants";


function watchMonitors() {
    const heartbeat = new Heartbeat(env.ELASTICSEARCH_API_KEY, env.ELASTICSEARCH_URL);
    const logger = new Logger();
    setInterval(async () => {
        try {
            const monitors = await heartbeat.getMonitors();
            //Loop through each monitor and check if we have that status logged
            for (const monitor of monitors) {
                const lastStatus = await getLastMonitorAction(monitor.name);
                //If we don't have any status, we log it
                if (!lastStatus) {
                    await logger.status({monitorName: monitor.name, status: monitor.status})
                    continue;
                }
                const context = JSON.parse(lastStatus.context) as MonitorStatusChangeContext;
                //If the status has changed, we log it
                if (context.status !== monitor.status) {
                    await logger.status({monitorName: monitor.name, status: monitor.status})
                }
            }
        } catch (error) {
            //Check if we are already in error state
            const errorMessage = error instanceof Error ? error.message : "Unable to retrieve status: Unknown error";
            const lastError = await getLastError();
            //If we have an error, we check if it is recovered. If not, we log a new one
            if (lastError && lastError.type !== ACTIONS.ERROR_RECOVERED) {
                await logger.error({cause: errorMessage})
            }
        }
    }, 30000)
}


//This function watches the actions table for changes and sends a message to slack
function watchEvents() {





}


function index() {


}

index()




