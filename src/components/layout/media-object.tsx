import * as tsx from "vue-tsx-support";
import { Generic } from "./generic";

interface EventsWithOn {
  onClick(): void;
}

/**
 * The famous media object prevalent in social media interfaces, but useful in any context
 */
const MediaObject = tsx
  .componentFactoryOf<EventsWithOn>()
  .mixin(Generic)
  .create({
    render() {
      return (
        <div
          class="media"
          onClick={() => {
            this.$emit("click");
          }}
        >
          {this.$slots.left && <div class="media-left">{this.$slots.left}</div>}
          {this.$slots.default && (
            <div class="media-content">{this.$slots.default}</div>
          )}
          {this.$slots.right && (
            <div class="media-right">{this.$slots.right}</div>
          )}
        </div>
      );
    }
  });

export { MediaObject };
