export type App = {
    name: string
    status: string,
    url: string
    tags: string[]
}

let appStatus: App[] = [];

export function getChangedApps(apps: App[]){
    const messages: App[] = [];
    apps.forEach(app => {
        const lastAppStatus = appStatus.find(status => status.name === app.name)
        if(!lastAppStatus || lastAppStatus.status !== app.status){
            messages.push(app)
        }
    })
    appStatus = apps;
    return sortByStatus(messages)
}

function sortByStatus(apps: App[]){
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


