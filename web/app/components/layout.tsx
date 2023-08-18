import {ReactNode} from "react";
import {Header} from "~/components/header";
import {Sidebar} from "~/components/sidebar";

export const Layout = ({children}: {children: ReactNode}) => {
    return <main className={"font-inter"}>
        <Header/>
        <div className={"flex w-full"}>
            <Sidebar/>
            <div className={"w-full pl-[240px]"}>
                <div className={"min-h-[calc(100vh-60px)] w-full p-5"}>
                    {children}
                </div>
            </div>
        </div>
    </main>
}