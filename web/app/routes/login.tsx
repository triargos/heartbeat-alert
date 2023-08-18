import {DataFunctionArgs, redirect} from "@remix-run/node";
import {zfd} from "zod-form-data";
import {authenticate} from "~/utils/elastic.server";
import {commitSession, getSession} from "~/utils/session.server";
import {handleActionError, ValidatedActionData} from "~/utils/error.serverts";
import {Form, useActionData} from "@remix-run/react";
import {Label} from "~/components/ui/label";
import {Input} from "~/components/ui/input";
import {Button} from "~/components/ui/button";
import {z} from "zod";

export const action = async ({request}: DataFunctionArgs) => {
    try {
        const {username, password} = loginSchema.parse(await request.formData());
        const data = await authenticate(username, password);
        const session = await getSession(request)
        session.set("elasticAuth", data)
        return redirect("/", {
            headers: {
                "Set-Cookie": await commitSession(session),
            }
        })
    } catch (error) {
        return handleActionError(error)
    }


}
type LoginSchema = z.infer<typeof loginSchema>
const loginSchema = zfd.formData({
    username: zfd.text(),
    password: zfd.text(),
})

const LoginPage = () => {
    const data = useActionData<ValidatedActionData<LoginSchema>>()
    return (
        <main className={"w-full"}>
            <div
                className={
                    "container flex h-[calc(100vh-60px)] w-screen flex-col items-center justify-center"
                }
            >
                <h1 className={"text-2xl font-bold tracking-tight"}>Welcome back</h1>
                <p className={"text-sm text-muted-foreground"}>
                    Sign in with your elastic credentials below
                </p>
                <Form method={"post"} className={"mt-5 grid w-full max-w-md gap-4"}>
                    <div className={"grid gap-2"}>
                        <Label>Username</Label>
                        <Input
                            name={"username"}
                            placeholder={"myusername"}
                        />
                        <p className={"text-sm text-destructive"}>{data?.formValidationErrors?.username}</p>
                    </div>
                    <div className={"grid gap-2"}>
                        <Label>Password</Label>
                        <Input
                            type={"password"}
                            name={"password"}
                            placeholder={"mypassword"}
                        />
                        <p className={"text-sm text-destructive"}>{data?.formValidationErrors?.password}</p>
                    </div>
                    <Button>Sign in</Button>
                </Form>
            </div>
        </main>
    );
};
