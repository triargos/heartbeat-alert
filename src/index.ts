import {SlackClient} from "./slack/slack-client";
import {env} from "./env";
import {ElasticClient, parseElasticResponse} from "./elastic/elastic-client";
import {elasticConfig} from "../config/elastic";
import {UptimeStore} from "./state/uptime";

const slackClient = new SlackClient(env.SLACK_WEBHOOK_URL);
const elasticClient = new ElasticClient(env.ELASTICSEARCH_URL, env.ELASTICSEARCH_API_KEY, elasticConfig.index)
const uptimeStore = new UptimeStore(slackClient);

async function getStatus() {
    console.log("Getting status")
    const response = await elasticClient.getStatus()
    return parseElasticResponse(response.data);
}

function index() {
    console.log("Started...")
    setInterval(async () => {
        try {
            const status = await getStatus()
            const hasChanged = uptimeStore.checkUptimeChange(status)
            if(hasChanged){
                await slackClient.sendAppStatusUpdate(status)
            }
        } catch (error: unknown) {
            if(error instanceof  Error){
                await slackClient.sendMessage(error.message, "ERROR")
            }
            throw error
        }
        }, elasticConfig.intervalSeconds * 1000)

}
index()




