import {Await, Form, useLoaderData} from "@remix-run/react";
import {DataFunctionArgs, defer, redirect} from "@remix-run/node";
import {getElasticMonitors} from "~/utils/elastic.server";
import {Suspense, useState} from "react";
import {Badge} from "~/components/ui/badge";
import {Switch} from "~/components/ui/switch";
import {Button} from "~/components/ui/button";
import {zfd} from "zod-form-data";
import {z} from "zod";
import {prisma} from "~/utils/db.server";
import {handleActionError} from "~/utils/error.serverts";

export const loader = ({request}: DataFunctionArgs) => {
    const monitorsToImport = getElasticMonitors();
    return defer({monitorsToImport})
}

const importMonitorSchema = zfd.formData({
    monitorIds: zfd.repeatableOfType(zfd.text())
})

export const action = async ({request}: DataFunctionArgs) => {
    try {
        const {monitorIds} = importMonitorSchema.parse(await request.formData())
        const elasticMonitors = await getElasticMonitors();
        const monitorsToImport = elasticMonitors.filter(monitor => monitorIds.includes(monitor.id))
        for (const monitor of monitorsToImport) {
            await prisma.monitor.upsert({
                where: {
                    elasticId: monitor.id
                },
                create: {
                    name: monitor.name,
                    type: monitor.type,
                    elasticId: monitor.id,
                    url: monitor.url
                },
                update: {
                    name: monitor.name,
                    type: monitor.type,
                    url: monitor.url
                }
            })
        }
        return redirect("/monitors")
    } catch (error) {
        return handleActionError(error)
    }
}


const ImportMonitorsPage = () => {
    const {monitorsToImport} = useLoaderData<typeof loader>()
    return <>
        <h2 className={"text-4xl font-bold"}>Import monitors</h2>
        <Suspense fallback={"Loading monitors..."}>
            <Await resolve={monitorsToImport}>
                {(monitorsToImport) => (
                    <>
                        <Form method={"post"} className={"space-y-4 py-4"}>
                            <div className={"grid gap-2"}>
                                {monitorsToImport.map(monitor => (
                                    <MonitorToImport monitor={monitor} key={monitor.id}/>
                                ))}
                            </div>
                            <div className={"flex justify-end"}><Button>Import</Button></div>
                        </Form>
                    </>
                )}
            </Await>
        </Suspense>
    </>

}
type Monitor = Awaited<ReturnType<typeof getElasticMonitors>>[number]

const MonitorToImport = ({monitor}: { monitor: Monitor }) => {
    const [importMonitor, setImportMonitor] = useState(true)


    return <div className={"rounded-md border shadow flex justify-between items-center py-2 px-5"}>
        <div>
            {importMonitor && <input type="hidden" name={"monitorIds"} value={monitor.id}/>}
            <Badge variant={"secondary"}>{monitor.id}</Badge>
            <p className={"font-semibold"}>{monitor.name}</p>
            <p className={"text-muted-foreground text-sm"}>{monitor.url}</p>
        </div>
        <Switch checked={importMonitor} onCheckedChange={(val) => setImportMonitor(val)}></Switch>
    </div>
}

export default ImportMonitorsPage;