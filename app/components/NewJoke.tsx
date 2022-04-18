import type { ActionData } from "~/routes/jokes/new";

type Props = {
  data?: ActionData;
};

export default function NewJoke({ data }: Props) {
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method="post">
        <div>
          <label>
            Name:{" "}
            <input
              type="text"
              name="name"
              defaultValue={data?.fieldValues?.name}
              aria-invalid={Boolean(data?.fieldErrors?.name) || undefined}
              aria-errormessage={
                data?.fieldErrors?.name ? "name-error" : undefined
              }
            />
          </label>
          {data?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {data.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{" "}
            <textarea
              name="content"
              defaultValue={data?.fieldValues?.content}
              aria-invalid={Boolean(data?.fieldErrors?.content) || undefined}
              aria-errormessage={
                data?.fieldErrors?.content ? "name-error" : undefined
              }
            />
          </label>
          {data?.fieldErrors?.content ? (
            <p
              className="form-validation-error"
              role="alert"
              id="content-error"
            >
              {data.fieldErrors.content}
            </p>
          ) : null}
        </div>
        {data?.formError ? (
          <p className="form-validation-error" role="alert">
            {data.formError}
          </p>
        ) : null}
        <div>
          <button type="submit" className="button">
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
