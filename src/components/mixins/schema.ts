import { Schema as _Schema, api } from "../../libs/api";
import * as tsx from "vue-tsx-support";
import { chassis } from "../..";

const Schema = tsx.component({
  props: {
    mdl: {
      type: String
    },
    schema: {
      type: Object as () => _Schema
    }
  },
  data() {
    return {
      newSchema: {} as _Schema
    };
  },
  watch: {
    schema: {
      immediate: true,
      handler(val: _Schema) {
        if (val) {
          this.newSchema = val;
        }
      }
    },
    mdl: {
      immediate: true,
      async handler(val: string) {
        if (val) {
          this.newSchema = await chassis.api.schema(val);
        }
      }
    }
  }
});

export { Schema };
