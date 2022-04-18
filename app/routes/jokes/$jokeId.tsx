import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node";
import { db } from "~/utils/db.server";
import type { Joke as JokeType } from "@prisma/client";
import { useLoaderData, useParams, useCatch } from "@remix-run/react";
import Joke from "~/components/Joke";
import { json, redirect } from "@remix-run/node";
import { requireUserId, getUserId } from "~/utils/session.server";

export interface LoaderData {
  joke: Pick<JokeType, "name" | "content">;
  isOwner: boolean;
  canDelete?: boolean;
}

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: "No joke",
      description: "No joke found",
    };
  }
  return {
    title: `"${data.joke.name}" joke`,
    description: `Enjoy the "${data.joke.name}" joke and much more`,
  };
};
export const loader: LoaderFunction = async ({
  request,
  params,
}): Promise<LoaderData | Response> => {
  const { jokeId } = params;
  const userId = await getUserId(request);
  const joke = await db.joke.findUnique({ where: { id: jokeId! } });
  if (!joke) {
    return new Response("What a joke! Not found.", { status: 404 });
  }
  return { joke, isOwner: userId === joke.jokesterId };
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();
  if (form.get("_method") !== "delete") {
    throw new Response(`The _method ${form.get("_method")} is not supported`, {
      status: 400,
    });
  }
  const userId = await requireUserId(request);
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    throw new Response("Can't delete what does not exist", {
      status: 404,
    });
  }
  if (joke.jokesterId !== userId) {
    throw new Response("Pssh, nice try. That's not your joke", {
      status: 401,
    });
  }
  await db.joke.delete({ where: { id: params.jokeId } });
  return redirect("/jokes");
};

export default function JokeRoute() {
  const { joke, isOwner } = useLoaderData<LoaderData>();
  return <Joke joke={joke} isOwner={isOwner} />;
}

export function ErrorBoundary() {
  const { jokeId } = useParams();
  return (
    <div className="error-container">{`There was an error loading joke by the id ${jokeId}. Sorry.`}</div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  switch (caught.status) {
    case 400: {
      return (
        <div className="error-container">
          What you're trying to do is not allowed.
        </div>
      );
    }
    case 404: {
      return (
        <div className="error-container">
          Huh? What the heck is {params.jokeId}?
        </div>
      );
    }
    case 401: {
      return (
        <div className="error-container">
          Sorry, but {params.jokeId} is not your joke.
        </div>
      );
    }
    default: {
      throw new Error(`Unhandled error: ${caught.status}`);
    }
  }
}
