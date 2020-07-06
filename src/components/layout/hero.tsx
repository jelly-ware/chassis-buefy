import * as tsx from "vue-tsx-support";
import { Size, Type } from "../../toolkit";
import { Generic } from "./generic";

/**
 * An imposing hero banner to showcase something
 */
const Hero = tsx.componentFactory.extendFrom(Generic).create({
  props: {
    bold: {
      type: Boolean
    },
    fixedNavbar: {
      type: Boolean
    },
    type: {
      type: String as () => Type
    },
    size: {
      type: String as () => Size
    }
  },
  computed: {
    classes(): string[] {
      const clss = ["hero"];
      if (this.bold) {
        clss.push("is-bold");
      }
      if (this.size) {
        clss.push(this.size);
      }
      if (this.fixedNavbar) {
        clss.push("is-fullheight-with-navbar");
      }
      if (this.type) {
        clss.push(this.type);
      }
      return clss;
    }
  },
  render() {
    return (
      <section class={this.classes}>
        {this.$slots.head && <div class="hero-head">{this.$slots.head}</div>}
        {this.$slots.default && (
          <div class="hero-body">{this.$slots.default}</div>
        )}
        {this.$slots.foot && <div class="hero-foot">{this.$slots.foot}</div>}
      </section>
    );
  }
});

export { Hero };
