import { Link } from "@remix-run/react";
import type { FormFields } from "~/routes/login";

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<FormFields>;
  fields?: Partial<FormFields>;
};

interface Props {
  data?: ActionData;
  searchParams?: string;
}

export default function Authentication({ data, searchParams }: Props) {
  return (
    <div className="container">
      <div className="content" data-light="">
        <h1>Login</h1>
        <form method="post">
          <input type="hidden" name="redirectTo" value={searchParams} />
          <fieldset>
            <legend className="sr-only">Login or Register?</legend>
            <label>
              <input
                type="radio"
                name="loginType"
                value="login"
                defaultChecked={
                  !data?.fields?.loginType ||
                  data?.fields?.loginType === "login"
                }
              />{" "}
              Login
            </label>
            <label>
              <input
                type="radio"
                name="loginType"
                value="register"
                defaultChecked={data?.fields?.loginType === "register"}
              />{" "}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor="username-input">Username</label>
            <input
              type="text"
              id="username-input"
              name="username"
              defaultValue={data?.fields?.username}
              aria-invalid={Boolean(data?.fieldErrors?.username)}
              aria-errormessage={
                data?.fieldErrors?.username ? "username-error" : undefined
              }
            />
            {data?.fieldErrors?.username ? (
              <p
                className="form-validation-error"
                role="alert"
                id="username-error"
              >
                {data.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="password-input">Password</label>
            <input
              id="password-input"
              name="password"
              defaultValue={data?.fields?.password}
              type="password"
              aria-invalid={Boolean(data?.fieldErrors?.password) || undefined}
              aria-errormessage={
                data?.fieldErrors?.password ? "password-error" : undefined
              }
            />
            {data?.fieldErrors?.password ? (
              <p
                className="form-validation-error"
                role="alert"
                id="password-error"
              >
                {data.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id="form-error-message">
            {data?.formError ? (
              <p className="form-validation-error" role="alert">
                {data.formError}
              </p>
            ) : null}
          </div>
          <button type="submit" className="button">
            Submit
          </button>
        </form>
        <div className="links">
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/jokes">Jokes</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
