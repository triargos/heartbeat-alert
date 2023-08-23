import { ColumnDef } from "@tanstack/react-table"
import {Monitor} from ".prisma/client";
import {Badge} from "~/components/ui/badge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const monitorTableColumns: ColumnDef<Monitor>[] = [
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const variant = row.getValue("status") === "up" ? "success" : row.getValue("status") === "LOCAL" ? "warn" : "destructive"
            return <Badge className={"capitalize"} variant={variant}>{row.getValue("status")}</Badge>
        },
    },
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
    }
]
