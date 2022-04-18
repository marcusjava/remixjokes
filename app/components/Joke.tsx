import { Link } from "@remix-run/react";
import type { LoaderData } from "~/routes/jokes/$jokeId";

export default function Joke({ joke, isOwner, canDelete = true }: LoaderData) {
  return (
    <div>
      <p>{joke?.name}</p>
      <p>{joke?.content}</p>
      <Link to=".">{joke.name} Permalink</Link>
      {isOwner ? (
        <form method="post">
          <input type="hidden" name="_method" value="delete" />

          <button type="submit" className="button" disabled={!canDelete}>
            Delete
          </button>
        </form>
      ) : null}
    </div>
  );
}
