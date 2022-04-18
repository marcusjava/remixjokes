import type {
  ActionFunction,
  LinksFunction,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, Link, useSearchParams } from "@remix-run/react";
import { ZodError } from "zod";
import Authentication from "~/components/Authentication";

import { db } from "~/utils/db.server";
import { createUserSession, login, register } from "~/utils/session.server";
import { FormValidator, FormValidatorErrors, User } from "~/utils/validation";
import stylesUrl from "../styles/login.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: stylesUrl }];
};

export const meta: MetaFunction = () => {
  return {
    title: "Remix Jokes | Login",
    description: "Login to submit your own jokes to Remix Jokes!",
  };
};

export interface FormFields {
  loginType: string;
  username: string;
  password: string;
}

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<FormFields>;
  fields?: Partial<FormFields>;
};

function validateUrl(url: any) {
  console.log({ url });
  let urls = ["/jokes", "/", "https://remix.run"];
  if (urls.includes(url)) {
    return url;
  }
  return "/jokes";
}

const badRequest = (data: ActionData) => {
  return json(data, { status: 400 });
};
export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const loginType = form.get("loginType");
  const username = form.get("username");
  const password = form.get("password");
  const redirectTo = validateUrl(form.get("redirectTo") || "/jokes");

  if (
    typeof loginType !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string" ||
    typeof redirectTo !== "string"
  ) {
    return badRequest({ formError: `Form not submitted correctly.` });
  }
  const fields = { loginType, username, password };
  try {
    //twixrox
    const data = FormValidator(User, { username, password });

    switch (loginType) {
      case "login": {
        // login to get the user
        // if there's no user, return the fields and a formError
        // if there is a user, create their session and redirect to /jokes
        const user = await login(data);
        if (!user) {
          return badRequest({
            fields,
            formError: "Username/Password combination is incorrect",
          });
        }
        return createUserSession(user.id, redirectTo);
      }
      case "register": {
        const userExists = await db.user.findFirst({
          where: { username },
        });
        if (userExists) {
          return badRequest({
            fields,
            formError: `User with username ${username} already exists`,
          });
        }
        // create the user
        const user = await register(data);
        if (!user) {
          return badRequest({
            fields,
            formError: `Something goes wrong when creating user`,
          });
        }

        // create their session and redirect to /jokes
        return createUserSession(user.id, redirectTo);
      }
      default: {
        return badRequest({
          fields,
          formError: `Login type invalid`,
        });
      }
    }
  } catch (error: any) {
    if (error instanceof ZodError) {
      return badRequest({
        fields,
        fieldErrors: FormValidatorErrors(error),
      });
    }
    throw new Error(error.message);
  }
};
export default function Login() {
  const actionData = useActionData<ActionData>();

  const [searchParams] = useSearchParams();

  return (
    <Authentication
      data={actionData}
      searchParams={searchParams.get("redirectTo") || undefined}
    />
  );
}
