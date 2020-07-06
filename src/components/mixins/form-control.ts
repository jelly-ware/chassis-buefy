import * as tsx from "vue-tsx-support";
import { Size, Type } from "../../toolkit";
import { Schema } from "./schema";
import { Generic } from "../layout";

const FormControl = tsx.componentFactory
  .extendFrom(Generic)
  .mixin(Schema)
  .create({
    props: {
      size: {
        type: String as () => Size
      },
      expanded: {
        type: Boolean
      },
      rounded: {
        type: Boolean
      },
      icon: {
        type: String
      },
      iconPack: {
        type: String
      },
      type: {
        type: String as () => Type
      },
      placeholder: {
        type: String
      }
    }
  });

export { FormControl };
