type Breakpoint =
  | "is-mobile"
  | "is-tablet"
  | "is-desktop"
  | "is-widescreen"
  | "is-fullhd";

type Size = "is-small" | "is-medium" | "is-large" | "is-fullheight";

type Type =
  | "is-primary"
  | "is-danger"
  | "is-info"
  | "is-white"
  | "is-black"
  | "is-light"
  | "is-dark"
  | "is-success"
  | "is-warning";

type Position =
  | "is-top-right"
  | "is-top"
  | "is-top-left"
  | "is-bottom-right"
  | "is-bottom"
  | "is-bottom-left";

type Unpacked<T> = T extends Array<infer E>
  ? E
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer P>
  ? P
  : T;

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]>;
};

interface Button<T extends Function> {
  label?: string;
  type?: Type;
  icon?: string;
  iconPack?: string;
  disabled?: boolean;
  action: T;
}

export { Size, Type, Position, Unpacked, DeepPartial, Button, Breakpoint };
