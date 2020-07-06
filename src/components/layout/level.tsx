import * as tsx from "vue-tsx-support";
import { Generic } from "./generic";
import { Breakpoint } from "../../toolkit";

/**
 * ## Level
 * A multi-purpose horizontal level, which can contain almost any other element
 * * If you want a centered level, you can use as many default slots as you want.
 * * By default, for space concerns, the level is vertical on mobile. If you want the level to be horizontal on mobile as well, add the **is-mobile** breakpoint
 */
const Level = tsx
  .componentFactoryOf<{}, { default: { data: any } }>()
  .mixin(Generic)
  .create({
    props: {
      breakpoint: {
        type: String as () => Breakpoint
      }
    },
    computed: {
      cls() {
        const cls = ["level"];
        if (this.breakpoint) cls.push(this.breakpoint);
        return cls;
      }
    },
    render() {
      return (
        <div class={this.cls}>
          {this.$slots.left && (
            <div class="level-left">
              {this.$slots.left.map(li => (
                <div class="level-item">{li}</div>
              ))}
            </div>
          )}
          {this.$slots.default &&
            this.$slots.default.map(li => <div class="level-item">{li}</div>)}
          {this.$slots.right && (
            <div class="level-right">
              {this.$slots.right.map(li => (
                <div class="level-item">{li}</div>
              ))}
            </div>
          )}
        </div>
      );
    }
  });

export { Level };
