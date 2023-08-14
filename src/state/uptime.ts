import {SlackClient} from "../slack/slack-client";

export type App = {
    name: string
    status: string,
    url: string
}

export class UptimeStore {
    private apps: App[]

    constructor(slackClient: SlackClient) {
        this.apps = []
    }
    checkUptimeChange(updatedApps: App[]) {
        let hasChanged = false;
        if(this.apps.length < 1){
            hasChanged = true;
        }
        this.apps.forEach(app => {
            const updatedApp = updatedApps.find(updatedApp => updatedApp.name === app.name)
            if(!updatedApp){
                throw new Error(`Monitor ${app.name} has been removed. Was this intended?`)
            }
            if(updatedApp.status !== app.status){
                hasChanged = true;
            }
        })
        this.apps = updatedApps;
        return hasChanged;
    }

    static sortAppsByStatus(apps: App[]){
        return apps.sort((a, b) => {
            if (a.status === 'down' && b.status === 'up') {
                return -1; // "down" status comes before "up" status
            }
            if (a.status === 'up' && b.status === 'down') {
                return 1; // "up" status comes after "down" status
            }
            return 0; // maintain the current order if statuses are the same

        })
    }


}