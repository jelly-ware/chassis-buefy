import * as tsx from "vue-tsx-support";
import { Generic } from "./generic";

const Caption = tsx.extendFrom(Generic).create({
  render() {
    return (
      <div>
        <div class="is-hidden-tablet has-text-centered">
          {this.$slots.default}
        </div>
        <div class="is-hidden-mobile">{this.$slots.default}</div>
      </div>
    );
  }
});

export { Caption };
