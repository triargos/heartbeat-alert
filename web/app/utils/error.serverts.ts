import { ZodError } from "zod";
import { json } from "@remix-run/node";

type FormValidationError<ERROR> = {
    [P in keyof ERROR]?: string[];
};

export type TransformedFormValidationError<ERROR> = {
    [P in keyof ERROR]?: string;
};
export type ValidatedActionData<ERROR> = {
    formValidationErrors?: TransformedFormValidationError<ERROR>;
    error?: string;
};

export function handleActionError(error: unknown) {
    //This is required to keep thrown redirects working
    if (error instanceof Response) {
        throw error;
    }
    if (error instanceof ZodError) {
        const fieldErrors = error.formErrors.fieldErrors;
        const transformedErrors = transformErrors<typeof fieldErrors>(fieldErrors);
        return json({ formValidationErrors: transformedErrors });
    }
    if (error instanceof Error) return json({ error: error.message });
    return json({ error: "An unknown error occurred" });
}

export function transformErrors<ERROR>(errors?: FormValidationError<ERROR>) {
    if (!errors) {
        return undefined;
    }

    const transformedErrors: { [P in keyof ERROR]?: string } = {};
    const keys = Object.keys(errors);
    keys.forEach((key) => {
        transformedErrors[key as keyof typeof errors] =
            errors?.[key as keyof typeof errors]?.[0];
    });
    return transformedErrors;
}