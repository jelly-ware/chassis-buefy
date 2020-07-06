import * as tsx from "vue-tsx-support";
import { Size } from "../../toolkit";
import { Generic } from "./generic";

type Separator =
  | "has-arrow-separator"
  | "has-bullet-separator"
  | "has-dot-separator"
  | "has-succeeds-separator";

type Alignment = "is-centered" | "is-right";

const Breadcrumb = tsx.componentFactory.extendFrom(Generic).create({
  props: {
    separator: {
      type: String as () => Separator
    },
    alignment: {
      type: String as () => Alignment
    },
    size: {
      type: String as () => Size
    }
  },
  computed: {
    classes() {
      const cls = ["breadcrumb"];
      if (this.size) {
        cls.push(this.size);
      }
      if (this.separator) {
        cls.push(this.separator);
      }
      if (this.alignment) {
        cls.push(this.alignment);
      }
      return cls;
    }
  },
  render() {
    return (
      <nav class={this.classes} aria-label="breadcrumbs">
        <ul>
          {this.$slots.default &&
            this.$slots.default.map((val, idx) => (
              <li
                class={{
                  "is-active": idx === this.$slots.default!.length - 1
                }}
              >
                {val}
              </li>
            ))}
        </ul>
      </nav>
    );
  }
});

export { Breadcrumb, Alignment, Separator };
