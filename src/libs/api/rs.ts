import { AxiosInstance, AxiosStatic } from "axios";
import { Token } from "../xchg";

interface Error {
  id: number;
  context: string;
  title: string;
  detail: string;
  suggestion: string;
  links: {
    about: string;
  };
  source: {
    pointer: string;
    parameter: string;
  };
}

interface Rs<T extends AxiosStatic = AxiosStatic>
  extends Pick<T, "get" | "post"> {
  readonly axios: T;
  readonly token?: string;
  of(
    op: string,
    ...svc: string[]
  ): <R = void, T = undefined>(body?: T) => Promise<R>;
}

export { Rs, Error };
