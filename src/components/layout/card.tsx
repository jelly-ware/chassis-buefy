import * as tsx from "vue-tsx-support";
import { Generic } from "./generic";

interface EventsWithOn {
  onClick(): void;
}

const Card = tsx
  .componentFactoryOf<EventsWithOn>()
  .mixin(Generic)
  .create({
    props: {
      overlayContent: {
        type: Boolean,
        default: false
      }
    },
    render() {
      return (
        <div
          class="card"
          onClick={() => {
            this.$emit("click");
          }}
        >
          {(this.$slots.title || this.$slots.icon) && (
            <header class="card-header">
              {this.$slots.title && (
                <p class="card-header-title">{this.$slots.title}</p>
              )}
              {this.$slots.icon && (
                <a href="#" class="card-header-icon" aria-label="more options">
                  {this.$slots.icon}
                </a>
              )}
            </header>
          )}
          {this.$slots.image && (
            <div class="card-image">{this.$slots.image}</div>
          )}
          {this.$slots.default && (
            <div
              class={{
                "card-content": true,
                "is-overlay": this.overlayContent
              }}
            >
              {this.$slots.default}
            </div>
          )}
          {this.$slots.control && this.$slots.control.length > 0 && (
            <footer class="card-footer">
              {this.$slots.control.map(c => (
                <a class="card-footer-item">{c}</a>
              ))}
            </footer>
          )}
        </div>
      );
    }
  });

export { Card };
