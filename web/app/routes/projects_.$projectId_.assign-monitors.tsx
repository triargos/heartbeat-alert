import {DataFunctionArgs, json, redirect} from "@remix-run/node";
import {prisma} from "~/utils/db.server";
import {Form, Link, useLoaderData} from "@remix-run/react";
import {requireParam} from "~/utils";
import {Separator} from "~/components/ui/separator";
import {MonitorTable} from "~/components/tables/monitors/data-table";
import {monitorTableColumns} from "~/components/tables/monitors/columns";
import {Label} from "~/components/ui/label";
import {ColumnDef} from "@tanstack/react-table";
import {Monitor} from ".prisma/client";
import {ReactNode, useState} from "react";
import {Button} from "~/components/ui/button";
import {MoreVertical, PlusCircle, Trash2Icon} from "lucide-react";
import {zfd} from "zod-form-data";
import {handleActionError} from "~/utils/error.serverts";


export const loader = async ({request, params}: DataFunctionArgs) => {
    const projectId = requireParam("projectId", params)
    const assignableMonitors = await prisma.monitor.findMany({
        where: {
            projects: {
                none: {
                    id: projectId
                }
            }
        }
    });
    const assignedMonitors = await prisma.monitor.findMany({
        where: {
            projects: {
                some: {
                    id: projectId
                }
            }
        }
    })

    return json({assignableMonitors, assignedMonitors})
}

const assignMonitorSchema = zfd.formData({
    monitorIds: zfd.repeatableOfType(zfd.text())
})

export const action = async ({request, params}: DataFunctionArgs) => {
    const projectId = requireParam("projectId", params)
    try {
        const {monitorIds} = assignMonitorSchema.parse(await request.formData())
        //Clear all existing relations
        await prisma.project.update({
            where: {
                id: projectId
            },
            data: {
                monitors: {
                    set: []
                }
            }
        })
        //Add new relations
        for (const monitorId of monitorIds) {
            await prisma.project.update({
                where: {
                    id: projectId
                },
                data: {
                    monitors: {
                        connect: {
                            id: monitorId
                        }
                    }
                }
            })
        }
        return redirect(`/projects/${projectId}`)

    } catch (error) {
        return handleActionError(error)
    }
}


const ProjectPage = () => {
    const {assignableMonitors, assignedMonitors} = useLoaderData<typeof loader>()
    const [updatedAssignedMonitors, setUpdatedAssignedMonitors] = useState<Monitor[]>(assignedMonitors)

    const assignedMonitorTableColumns: ColumnDef<Monitor>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "url",
            header: "URL",
        },
        {
            accessorKey: "type",
            header: "Type",
        },
        {
            id: "action",
            header: () => <div className={"text-right pr-4"}>Action</div>,
            cell: ({row}) => {
                const monitor = row.original
                return (
                    <div className={"justify-end flex pr-4"}>
                        <Trash2Icon onClick={() => {
                            const filtered = updatedAssignedMonitors.filter(assignedMonitor => assignedMonitor.id !== monitor.id)
                            setUpdatedAssignedMonitors(filtered)
                        }} className={"text-red-500 stroke-1 w-4 h-4 hover:cursor-pointer"}/>
                    </div>
                )
            },
        }
    ]

    const assignMonitorTableColumns: ColumnDef<Monitor>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "url",
            header: "URL",
        },
        {
            accessorKey: "type",
            header: "Type",
        },
        {
            id: "action",
            header: () => <div className={"text-right pr-4"}>Action</div>,
            cell: ({row}) => {
                const monitor = row.original
                return (
                    <div className={"justify-end flex pr-4"}>
                        <PlusCircle onClick={() => {
                            setUpdatedAssignedMonitors([...updatedAssignedMonitors, monitor])
                        }} className={"text-green-500 stroke-1 w-4 h-4 hover:cursor-pointer"}/>
                    </div>
                )
            },
        }
    ]

    return (
        <>
            <h2 className={"text-4xl font-bold "}>Assign monitors</h2>
            <div className={"mt-5"}>
                <Label className={"text-lg"}>Assigned monitors</Label>
                <MonitorTable columns={assignedMonitorTableColumns} data={updatedAssignedMonitors}/>
                <Separator className={"my-4"}/>
                <Label className={"text-lg"}>Assignable monitors</Label>
                <MonitorTable columns={assignMonitorTableColumns}
                              data={assignableMonitors.filter(monitor => !updatedAssignedMonitors.includes(monitor))}/>
                <Form method={"post"} className={"mt-4"}>
                    {updatedAssignedMonitors.map(monitor => {
                        return <input type={"hidden"} name={"monitorIds"} value={monitor.id}/>
                    })}
                    <div className={"flex justify-end"}>
                        <Button>Save</Button>
                    </div>
                </Form>
            </div>
        </>
    )

}


export default ProjectPage