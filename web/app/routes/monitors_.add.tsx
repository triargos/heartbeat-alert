import {DataFunctionArgs, json, redirect} from "@remix-run/node";
import {prisma} from "~/utils/db.server";
import {Form, useFormAction, useLoaderData} from "@remix-run/react";
import {requireParam} from "~/utils";
import {Separator} from "~/components/ui/separator";
import {MonitorTable} from "~/components/tables/monitors/data-table";
import {monitorTableColumns} from "~/components/tables/monitors/columns";
import {Label} from "~/components/ui/label";
import {ColumnDef} from "@tanstack/react-table";
import {Monitor} from ".prisma/client";
import {ReactNode, useRef, useState} from "react";
import {Button} from "~/components/ui/button";
import {MoreVertical, PlusCircle, Trash2Icon} from "lucide-react";
import {zfd} from "zod-form-data";
import {handleActionError} from "~/utils/error.serverts";
import {Input} from "~/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select";
import {Badge} from "~/components/ui/badge";


const addMonitorSchema = zfd.formData({
    name: zfd.text(),
    url: zfd.text(),
    type: zfd.text(),
    elasticId: zfd.text(),
    tags: zfd.repeatableOfType(zfd.text())


})

export const action = async ({request, params}: DataFunctionArgs) => {
    try {
        const {name, url, type, elasticId, tags} = addMonitorSchema.parse(await request.formData())
        //Clear all existing relations
        const monitor = await prisma.monitor.upsert({
            where: {
                elasticId
            },
            create: {
                name,
                url,
                type,
                elasticId,

            },
            update: {
                name,
                url,
                type,
            }
        })
        //Set tags
        for (const tag of tags) {
            await prisma.monitor.update({
                where: {
                    id: monitor.id
                },
                data: {
                    tags: {
                        create: {
                            name: tag
                        }
                    }
                }
            })
        }
        return redirect(`/monitors`)

    } catch (error) {
        return handleActionError(error)
    }
}

const AddMonitorPage = () => {

    const [tags, setTags] = useState<string[]>([])
    const [value, setValue] = useState("")
    const formRef = useRef<HTMLFormElement | null>(null)
    return (
        <>
            <h2 className={"text-4xl font-bold "}>Add monitor</h2>
            <div className={"mt-5 grid gap-4"}>
                <Form ref={formRef} className={"grid gap-4"} method={"post"}>
                    <div className={"grid gap-2"}>
                        <Label>Name</Label>
                        <Input name={"name"} placeholder={"My Monitor"}></Input>
                    </div>
                    <div className={"grid gap-2"}>
                        <Label>ID</Label>
                        <Input name={"elasticId"} placeholder={"my-monitor-01"}></Input>
                    </div>
                    <div className={"grid gap-2"}>
                        <Label>URL</Label>
                        <Input name={"url"} placeholder={"https://mymonitor.com,"}></Input>
                    </div>
                    <div className={"grid gap-2"}>
                        <Label>URL</Label>
                        <Select name={"type"} defaultValue={"http"}>
                            <SelectTrigger>
                                <SelectValue placeholder="Monitor type"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="http">HTTP</SelectItem>
                                <SelectItem value="icmp">ICMP</SelectItem>
                                <SelectItem value="tcp">TCP</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {tags.map(tag => <input type="hidden" name={"tags"} value={tag}/>)}
                </Form>
                <div className={"grid gap-2"}>
                    <Label>Tags</Label>
                    <Input value={value} onChange={(event) => setValue(event.target.value)} onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            setTags([...tags, value])
                            setValue("")
                        }

                    }} name={"url"} placeholder={"Tag-01"}></Input>
                </div>
                <div className={"flex gap-2 flex-wrap"}>
                    {tags.map(tag => (
                        <Badge className={"hover:cursor-pointer"} variant={"secondary"} onClick={() => {
                            setTags(tags.filter(t => t !== tag))
                        }}>{tag}</Badge>
                    ))}
                </div>
                <div className={"flex justify-end"}>
                    <Button onClick={() => formRef?.current?.submit()}>Add monitor</Button>
                </div>
            </div>
        </>
    )

}


export default AddMonitorPage