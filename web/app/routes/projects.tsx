import {DataFunctionArgs, json, redirect} from "@remix-run/node";
import {requireAuthentication} from "~/utils/session.server";
import {prisma} from "~/utils/db.server";
import {Form, Link, useLoaderData} from "@remix-run/react";
import {Project} from "@prisma/client";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {ReactNode} from "react";
import {ErrorCard} from "~/components/ui/error";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "~/components/ui/dialog";
import {Button, buttonVariants} from "~/components/ui/button";
import {MoreVertical, Plus} from "lucide-react";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {zfd} from "zod-form-data";
import {handleActionError} from "~/utils/error.serverts";
import {Popover, PopoverContent, PopoverTrigger} from "~/components/ui/popover";


export const loader = async ({request}: DataFunctionArgs) => {
    const projects = await prisma.project.findMany();
    return json({projects})
}


const addProjectSchema = zfd.formData({
    projectName: zfd.text()
})

export const action = async ({request}: DataFunctionArgs) => {
    try {
        const {projectName} = addProjectSchema.parse(await request.formData())
        const project = await prisma.project.create({
            data: {
                name: projectName
            }
        })
        return redirect(`/projects/${project.id}`)
    } catch (error) {
        return handleActionError(error)
    }


}

const ProjectPage = () => {
    const {projects} = useLoaderData<typeof loader>()

    return (
        <>
            <div className={"flex gap-2 items-center justify-between"}>
                <h2 className={"text-4xl font-bold"}>Projects</h2>
                <AddProject/>
            </div>
            <main className={"mt-4"}>
                {projects.length < 1 && <ErrorCard title={"No projects"}
                                                   image={"https://illustrations.popsy.co/blue/searching-location-on-the-phone.svg"}
                                                   description={"You dont have any projects yet"}/>}
            </main>
            {projects.map(project => (
                <ProjectCard key={project.id} project={project}></ProjectCard>
            ))}


        </>
    )

}

const AddProject = () => {
    return <Dialog>
        <DialogTrigger asChild={true}><Button><Plus className={"w-4 h-4"}/>Add</Button></DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Project</DialogTitle>
                <DialogDescription>
                    <Form method={"post"}>
                        <div className={"py-2 grid gap-2"}>
                            <Label>Project name</Label>
                            <Input name={"projectName"}/>
                        </div>
                        <DialogFooter>
                            <Button type={"submit"}>Add project</Button>
                        </DialogFooter>
                    </Form>
                </DialogDescription>
            </DialogHeader>
        </DialogContent>
    </Dialog>


}


const ProjectCard = ({project}: { project: Project }) => {
    return <Card className={"max-w-lg w-full"}>
        <CardHeader>
            <div className={"flex justify-between items-center"}>
               <Link to={project.id}>
                   <div>
                       <CardTitle className={"text-lg font-semibold"}>{project.name}</CardTitle>
                       <CardDescription>This is a project description</CardDescription>
                   </div>
               </Link>
                <Popover>
                    <PopoverTrigger asChild={true}>
                        <MoreVertical className={"text-muted-foreground stroke-1 hover:cursor-pointer"}/>
                    </PopoverTrigger>
                    <PopoverContent className={"grid gap-2"}>
                       <div>
                           <Link className={buttonVariants({variant: "ghost"})} to={project.id}>Edit</Link>
                       </div>
                        <Form method={"post"}>
                            <Button variant={"ghost"} name={"deleteProject"} value={project.id}
                                    className={"text-destructive outline-transparent border-transparent"}>Delete</Button>
                        </Form>
                    </PopoverContent>
                </Popover>
            </div>
        </CardHeader>

    </Card>

}

export default ProjectPage