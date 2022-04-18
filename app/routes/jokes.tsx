import { useLoaderData } from "@remix-run/react";
import type { LinksFunction, LoaderFunction } from "@remix-run/node";
import stylesUrl from "~/styles/jokes.css";
import Jokes from "~/components/Jokes";
import { db } from "~/utils/db.server";
import type { Joke } from "@prisma/client";
import { json } from "@remix-run/node";
import { getUser } from "~/utils/session.server";

export interface LoaderData {
  jokes: Pick<Joke, "id" | "name">[];
  user: Awaited<ReturnType<typeof getUser>>;
}

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const loader: LoaderFunction = async ({
  request,
}): Promise<LoaderData | Response> => {
  const jokes = await db.joke.findMany({
    take: 5,
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  const user = await getUser(request);
  const data: LoaderData = {
    jokes,
    user,
  };

  return json(data);
};

export default function JokesRoute() {
  const { jokes, user } = useLoaderData<LoaderData>();
  return <Jokes jokes={jokes} user={user} />;
}
