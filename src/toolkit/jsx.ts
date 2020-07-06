import { VueConstructor } from "vue";

type Type<T extends VueConstructor> = T extends VueConstructor<infer U>
  ? U
  : never;

export { Type };
