import * as R from "ramda";
import v from "voca";
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { Button } from "../../toolkit";

interface Handler<T = unknown> {
  cfg: Configuration<T>;
  update: (cfg: Partial<Configuration<T>>) => void;
  close: () => void;
}

interface Configuration<T = unknown> {
  content: (handler: Handler<T>) => VNode | VNode[];
  foot?:
    | Button<(handler: Handler<T>) => void>[]
    | ((handler: Handler<T>) => VNode | VNode[]);
  canCancel?: boolean;
  fullScreen?: boolean;
  title?: string;
  data: T;
}

interface EventsWithOn {
  onHandle(handler: Handler): void;
}

const Modal = tsx.componentFactoryOf<EventsWithOn>().create({
  props: {
    value: {
      type: Object as () => Configuration,
      required: true
    }
  },
  data() {
    return {
      cfg: this.value
    };
  },
  computed: {
    handler(): Handler {
      return {
        cfg: this.cfg,
        update: cfg => (this.cfg = R.mergeRight(this.cfg, cfg)),
        close: () => this.$emit("close")
      };
    }
  },
  watch: {
    value: {
      handler(val: Configuration) {
        this.cfg = val;
      }
    },
    cfg: {
      immediate: true,
      handler() {
        this.$emit("handle", this.handler);
      }
    }
  },
  render() {
    let wrapInCard = false;
    if (this.cfg.foot)
      if (typeof this.cfg.foot === "function") wrapInCard = true;
      else if (this.cfg.foot.length > 0) wrapInCard = true;
    if (this.cfg.title) wrapInCard = true;
    const content = this.cfg.content(this.handler);
    return wrapInCard ? (
      <div class="modal-card">
        {this.cfg.title && (
          <header class="modal-card-head">
            <p class="modal-card-title">{v.titleCase(this.cfg.title)}</p>
            {this.cfg.canCancel ||
              (true && (
                <button
                  class="delete"
                  aria-label="close"
                  onClick={() => this.handler.close()}
                />
              ))}
          </header>
        )}
        <section class="modal-card-body section">{content}</section>
        {typeof this.cfg.foot === "function" && (
          <footer
            class="modal-card-foot"
            style={{
              "justify-content": "space-between"
            }}
          >
            {this.cfg.foot(this.handler)}
          </footer>
        )}
        {this.cfg.foot &&
          typeof this.cfg.foot !== "function" &&
          this.cfg.foot.length > 0 && (
            <div class="buttons">
              {this.cfg.canCancel ||
                (true && (
                  <b-button onClick={() => this.handler.close()}>
                    Close
                  </b-button>
                ))}
              {this.cfg.foot.map(actn => (
                <b-button
                  onClick={() => actn.action(this.handler)}
                  disabled={actn.disabled}
                  type={actn.type}
                  props={{
                    "icon-left": actn.icon,
                    "icon-pack": actn.iconPack
                  }}
                >
                  {v.titleCase(actn.label)}
                </b-button>
              ))}
            </div>
          )}
      </div>
    ) : (
      <div>{content}</div>
    );
  }
});

export { Modal, Configuration, Handler };
