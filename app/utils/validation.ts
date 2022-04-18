import type { ZodError } from "zod";
import { z } from "zod";

interface InputFields {
  name?: string;
  content?: string;
  username?: string;
  password?: string;
}

const parse = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): z.infer<T> => {
  try {
    return schema.parse(data);
  } catch (err) {
    // handle error
    throw new Error();
  }
};

export const Joke = z.object({
  name: z.string().min(5, "Joke name is too short"),
  content: z.string().min(10, "Joke content is too short"),
});

export const User = z.object({
  username: z.string().min(3, "Usernames must be at least 3 characters long"),
  password: z.string().min(6, "Passwords must be at least 6 characters long"),
});

export const FormValidator = <T extends z.ZodTypeAny>(
  schema: T,
  input: InputFields
): z.infer<T> => {
  return schema.parse(input);
};

export const FormValidatorErrors = (error: ZodError) => {
  return error.issues.reduce((acc, issue) => {
    //@ts-ignore
    acc[issue.path[0]] = issue.message;
    return acc;
  }, {});
};
