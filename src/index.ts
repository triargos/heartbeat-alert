import {
  ACTION,
  ACTIONS,
  CHANNEL,
  evictOldActions,
  evictOldMessages,
  getLatestError,
} from "@packages/db";
import { actionEmitter } from "@packages/emitter";
import { Heartbeat } from "@packages/heartbeat";
import { Logger } from "@packages/logger/dist/src";

import { env } from "./env";
import { readServiceConfig } from "./read-config";
import {
  notifyChannel,
  notifyErrorMessage,
  shouldNotify,
  shouldNotifyErrorMessage,
} from "./send";

function watchMonitors() {
  const logger = new Logger();
  logger.info("heartbeat-alert initialized");
  const heartbeat = new Heartbeat(
    env.ELASTICSEARCH_API_KEY,
    env.ELASTICSEARCH_URL,
  );
  logger.info("heartbeat-client initialized");
  const config = readServiceConfig();
  logger.info("read config, starting interval");
  setInterval(async () => {
    try {
      await evictOldActions();
      await evictOldMessages();
      logger.monitor("Checking monitors");
      const monitors = await heartbeat.getMonitors();
      for (const monitor of monitors) {
        logger.monitor(`Checking ${monitor.name}`);
        await logger.status({
          monitorName: monitor.name,
          status: monitor.status,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to retrieve status: Unknown error";
      const lastError = await getLatestError();
      if (lastError && lastError.type !== ACTIONS.ERROR_RECOVERED) {
        await logger.error({ cause: errorMessage });
      }
    }
  }, config.watchMonitorInterval * 1000);
}

function watchEvents() {
  const logger = new Logger();
  actionEmitter.on(
    "action_create",
    async (type: ACTION, monitorName?: string, context?: string) => {
      if (!monitorName) {
        const channelsToNotify = (await shouldNotifyErrorMessage(
          type,
        )) as CHANNEL[];
        for (const channel of channelsToNotify) {
          logger.notification(`Notifying ${channel} for ${type}`);
          await notifyErrorMessage(channel, type, context);
        }
        return;
      }
      //Get the channels to notify
      const channelsToNotify = await shouldNotify(monitorName, type);
      for (const channel of channelsToNotify) {
        logger.notification(`Notifying ${channel} for ${monitorName} ${type}`);
        await notifyChannel(monitorName, channel, type);
      }
    },
  );
}

function index() {
  watchMonitors();
  watchEvents();
}

index();
