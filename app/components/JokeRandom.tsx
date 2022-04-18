import type { Joke } from "@prisma/client";
import { Link } from "@remix-run/react";

export type LoaderData = {
  joke: Pick<Joke, "id" | "name" | "content">;
};

export default function JokeRandom({ joke }: LoaderData) {
  return (
    <div>
      <p>{joke.name}</p>
      <p>{joke.content}</p>
      <Link to={joke.id}>{joke.name} Permalink</Link>
    </div>
  );
}
