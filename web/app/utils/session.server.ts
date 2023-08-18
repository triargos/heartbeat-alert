import {createCookieSessionStorage, Session} from "@remix-run/node";
import {env} from "../../../src/env";
import {ElasticAuthentication} from "~/utils/elastic.server";

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "__session",
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        secrets: [env.SESSION_SECRET],
        secure: process.env.NODE_ENV === "production",
    },
});

export async function getSession(request: Request) {
    const cookie = request.headers.get("Cookie");
    return sessionStorage.getSession(cookie);
}

export async function commitSession(session: Session) {
    return sessionStorage.commitSession(session);
}

export async function requireAuthentication(request: Request) {
    const session = await getSession(request);
    const elasticAuth = session.get("elasticAuth") as ElasticAuthentication | undefined;
    if (!elasticAuth) {
        throw new Error("User not authenticated")
    }
    return elasticAuth;
}