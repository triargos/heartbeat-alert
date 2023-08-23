import {DataFunctionArgs, json} from "@remix-run/node";
import {prisma} from "~/utils/db.server";
import {Link, useLoaderData} from "@remix-run/react";
import {ErrorCard} from "~/components/ui/error";
import {zfd} from "zod-form-data";
import {requireParam, requireResult} from "~/utils";
import {buttonVariants} from "~/components/ui/button";
import {MonitorTable} from "~/components/tables/monitors/data-table";
import {monitorTableColumns} from "~/components/tables/monitors/columns";
import {getElasticMonitors} from "~/utils/elastic.server";


export const loader = async ({request, params}: DataFunctionArgs) => {
    const projectId = requireParam("projectId", params)
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        include: {
            monitors: true
        }
    }).then(requireResult)
    const elasticMonitors = await getElasticMonitors();
    const monitors = project.monitors.map(monitor => {
        const elasticMonitor = elasticMonitors.find(elasticMonitor => elasticMonitor.id === monitor.elasticId)
        return {
            ...monitor,
            status: elasticMonitor?.status || "LOCAL"
        }
    })
    return json({project, monitors})
}

const assignMonitorSchema = zfd.formData({
    monitorsToAssign: zfd.repeatable(zfd.text())
})


const ProjectPage = () => {
    const {monitors, project} = useLoaderData<typeof loader>()

    return (
        <>
          <div className={"flex justify-between items-center"}>
              <div>
                  <p className={"text-muted-foreground"}>Project</p>
                  <h2 className={"text-4xl font-bold"}>{project.name}</h2>
              </div>
              <div className={"flex items-center gap-2"}>
                  <Link to={"assign-monitors"} className={buttonVariants({variant: "secondary"})}>Assign monitors</Link>
                  <Link to={"add-monitor"} className={buttonVariants()}>Add monitor</Link>
              </div>
          </div>
            <main className={"mt-4"}>
                {monitors.length < 1 && <ErrorCard title={"No monitors in this project"}
                                                   image={"https://illustrations.popsy.co/blue/searching-location-on-the-phone.svg"}
                                                   description={"This project does not have any monitors. You can go ahead and assign some monitors."}/>}
            </main>
            <MonitorTable columns={monitorTableColumns} data={monitors}/>

        </>
    )

}

export default ProjectPage