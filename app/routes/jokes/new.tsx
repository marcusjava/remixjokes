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
import { Link, useActionData, useCatch, useTransition } from "@remix-run/react";
import JokeComponent from "~/components/Joke";

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

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return `That joke is too short`;
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return `That joke's name is too short`;
  }
}

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
  const transition = useTransition();
  if (transition.submission) {
    const name = transition.submission.formData.get("name");
    const content = transition.submission.formData.get("content");
    if (
      typeof name === "string" &&
      typeof content === "string" &&
      !validateJokeContent(content) &&
      !validateJokeName(name)
    ) {
      return (
        <JokeComponent
          joke={{ name, content }}
          isOwner={true}
          canDelete={false}
        />
      );
    }
  }
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
