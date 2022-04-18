import NewJoke from "~/components/NewJoke";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { ZodError } from "zod";
import { db } from "~/utils/db.server";
import { getUserId, requireUserId } from "~/utils/session.server";
import {
  FormValidator,
  FormValidatorErrors,
  Joke,
  User,
} from "~/utils/validation";
import { Link, useActionData, useCatch } from "@remix-run/react";

export interface FormFields {
  name: string;
  content: string;
}

export interface ActionData {
  formError?: string;
  fieldErrors?: Partial<FormFields>;
  fieldValues?: Partial<FormFields>;
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return json({});
};

export const action: ActionFunction = async ({
  request,
}): Promise<ActionData | Response | void> => {
  const { name, content } = Object.fromEntries(await request.formData());

  if (typeof name !== "string" || typeof content !== "string") {
    return badRequest({ formError: "Form not submitted correctly." });
  }

  const userId = await requireUserId(request);
  try {
    const data = FormValidator(Joke, { name, content });
    const joke = await db.joke.create({
      data: { ...data, jokesterId: userId },
    });

    return redirect(`/jokes/${joke.id}`);
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        fieldValues: { name, content },
        fieldErrors: FormValidatorErrors(error),
      };
    }
    throw new Error(error.message);
  }
};

export default function NewJokeRoute() {
  const actionData = useActionData<ActionData>();
  return <NewJoke data={actionData} />;
}

export function ErrorBoundary() {
  return (
    <div className="error-container">
      Something unexpected went wrong. Sorry about that.
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <div className="error-container">
        <p>You must be logged in to create a joke.</p>
        <Link to="/login">Login</Link>
      </div>
    );
  }
}
