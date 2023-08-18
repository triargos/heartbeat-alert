import {Card} from "~/components/ui/card";
import {cn} from "~/utils";

interface ErrorCardProps {
    title: string;
    image: string;
    description: string;
    className?: string;
}


export const ErrorCard = ({title, image, description, className}: ErrorCardProps) => {
    return (
        <Card className={cn("flex w-full flex-col items-center p-5", className)}>
            <h2 className={"text-xl font-semibold"}>{title}</h2>
            <p className={"text-sm text-muted-foreground"}>{description}</p>
            <img className={"max-w-[200px]"} src={image} alt=""/>
        </Card>
    )
}