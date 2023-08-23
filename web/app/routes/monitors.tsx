import {DataFunctionArgs, json} from "@remix-run/node";
import {prisma} from "~/utils/db.server";
import {Link, useLoaderData} from "@remix-run/react";
import {ErrorCard} from "~/components/ui/error";
import {MonitorTable} from "~/components/tables/monitors/data-table";
import {monitorTableColumns} from "~/components/tables/monitors/columns";
import {getElasticMonitors} from "~/utils/elastic.server";
import {Button, buttonVariants} from "~/components/ui/button";


async function loadMonitors(){
    const monitors = await prisma.monitor.findMany(
        {
            include: {
                projects: true
            }
        }
    )
    const elasticMonitors = await getElasticMonitors()
    return monitors.map(monitor => {
      const elasticMonitor = elasticMonitors.find(elasticMonitor => monitor.elasticId === elasticMonitor.id)

        return {
          ...monitor,
            status: elasticMonitor?.status || "LOCAL"
        }
    })


}


export const loader = async ({request}: DataFunctionArgs) => {
    const monitors = await loadMonitors()
    //Load monitors here
    return json({monitors})
}

const MonitorPage = () => {
    const {monitors} = useLoaderData<typeof loader>()
    return (<>
        <div className={"flex gap-2 items-center justify-between"}>
            <h2 className={"text-4xl font-bold"}>Monitors</h2>
            <Link to={"add"} className={buttonVariants()}>Add monitor</Link>
        </div>
        <main className={"mt-5"}>
            {monitors.length < 1 && <ErrorCard title={"No monitors"}
                                               image={"https://illustrations.popsy.co/blue/searching-location-on-the-phone.svg"}
                                               description={"You dont have any monitors yet. You can either create on or import existing monitors from elasticsearch"}/>}
        </main>
        <MonitorTable columns={monitorTableColumns} data={monitors}/>

    </>)
}

export default MonitorPage;