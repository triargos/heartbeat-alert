import type {ReactNode} from "react";
import {NavLink} from "@remix-run/react";
import {cn} from "~/utils";
import {Activity} from "lucide-react";

export const Sidebar = () => {
    return (
        <nav
            className={
                "fixed h-[calc(100vh-60px)] w-[240px] border-r border-slate-200 bg-slate-50 p-5"
            }
        >
            <div className={"grid gap-2"}>
                <SidebarNavLink to={"/monitors"}>
                    <Activity className={"h-6 w-6"}/>
                    <p>Monitors</p>
                </SidebarNavLink>
            </div>
        </nav>
    );
};

const SidebarNavLink = ({
                            to,
                            children,
                        }: {
    to: string;
    children: ReactNode;
}) => {
    return (
        <NavLink
            className={() =>
                cn(
                    "flex items-center gap-2 rounded px-4 py-2 text-sm font-medium hover:bg-slate-200"
                )
            }
            to={to}
        >
            {children}
        </NavLink>
    );
};