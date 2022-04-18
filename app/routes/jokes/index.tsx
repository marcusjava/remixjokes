import type { LoaderFunction } from "@remix-run/node";
import { db } from "~/utils/db.server";
import type { Joke } from "@prisma/client";
import { json } from "@remix-run/node";
import { useLoaderData, useCatch } from "@remix-run/react";
import JokeRandom from "~/components/JokeRandom";

export type LoaderData = {
  randomJoke: Pick<Joke, "id" | "name" | "content">;
};

export const loader: LoaderFunction = async (): Promise<
  LoaderData | Response
> => {
  const count = await db.joke.count();
  const randomRowNumber = Math.floor(Math.random() * count);
  const [randomJoke] = await db.joke.findMany({
    take: 1,
    skip: randomRowNumber,
  });

  if (!randomJoke) {
    throw new Response("No random joke found", {
      status: 404,
    });
  }

  const data: LoaderData = { randomJoke };

  return json(data);
};

export default function JokesRandomRoute() {
  const { randomJoke } = useLoaderData<LoaderData>();
  return <JokeRandom joke={randomJoke} />;
}

export function ErrorBoundary() {
  return <div className="error-container">I did a whoopsies.</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return (
      <div className="error-container">There are no jokes to display.</div>
    );
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
