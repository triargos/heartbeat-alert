import {DataFunctionArgs, json} from "@remix-run/node";
import {requireAuthentication} from "~/utils/session.server";
import {prisma} from "~/utils/db.server";
import {useLoaderData} from "@remix-run/react";
import {Project} from "@prisma/client";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "~/components/ui/card";
import {ReactNode} from "react";
import {ErrorCard} from "~/components/ui/error";


export const loader = async ({request}: DataFunctionArgs) => {
    const auth = await requireAuthentication(request)
    const projects = await prisma.project.findMany();
    return json({projects})
}


const ProjectPage = () => {
    const {projects} = useLoaderData<typeof loader>()

    return (
        <div>
            <h2 className={"text-2xl"}>Projects</h2>

            <div>
                {projects.map(project => (
                    <ProjectCard project={project}/>
                ))}
            </div>
            {projects.length === 0 && (
                <ErrorCard title={"No projects"} image={} description={}
            )}


        </div>


    )

}


const ProjectCard = ({project}: { project: Project }) => {
    return <Card>
        <CardHeader>
            <CardTitle>{project.name}</CardTitle>
        </CardHeader>
    </Card>

}