import {
  DialogProgrammatic,
  LoadingProgrammatic,
  ModalProgrammatic,
  NotificationProgrammatic,
  SnackbarProgrammatic,
  ToastProgrammatic
} from "buefy";
import {
  BDialogConfig,
  BModalConfig,
  BPromptDialogConfig
} from "buefy/types/components";
import * as R from "ramda";
import * as tsx from "vue-tsx-support";
import { Position, Type } from "../../toolkit";
import {
  Configuration as ModalConfiguration,
  Handler as ModalHandler,
  Modal
} from "./modal";
// import { store } from '@/store/modules'

interface ClsHndlr {
  close: () => void;
}

type AlertDuration = "long" | "short" | "indefinite";

const alertDurations: Record<AlertDuration, number> = {
  long: 5000,
  short: 2000,
  indefinite: 10000
};

const Generic = tsx.component({
  data() {
    const loadingHandler: {
      page?: ClsHndlr;
      containers: { [index: string]: ClsHndlr };
    } = {
      containers: {}
    };
    return {
      modals: [] as ModalHandler[],
      dialog: {
        alert: (params: BDialogConfig | string) => {
          DialogProgrammatic.alert(params);
        },
        confirm: (params: BDialogConfig) => {
          DialogProgrammatic.confirm(params);
        },
        prompt: (params: BPromptDialogConfig) => {
          DialogProgrammatic.prompt(params);
        }
      },
      loading: {
        show: (
          canCancel = false,
          onCancel = () => {
            // empty
          },
          ref?: string
        ) => {
          const container = ref ? (this.$refs[ref] as any).$el : null;
          if (ref) {
            if (loadingHandler.containers[ref]) {
              loadingHandler.containers[ref].close();
            }
            loadingHandler.containers[ref] = LoadingProgrammatic.open({
              canCancel,
              onCancel,
              container
            });
          } else {
            if (loadingHandler.page) {
              loadingHandler.page.close();
            }
            loadingHandler.page = LoadingProgrammatic.open({
              canCancel,
              onCancel,
              container
            });
          }
        },
        kill: (ref?: string) => {
          if (ref) {
            if (loadingHandler.containers[ref]) {
              loadingHandler.containers[ref].close();
            }
          } else {
            if (loadingHandler.page) {
              loadingHandler.page.close();
            }
          }
        },
        killAll() {
          this.kill();
          Object.keys(loadingHandler).forEach(lh => this.kill());
        }
      },
      msg: {
        notification: (
          message: string,
          type: Type = "is-primary",
          position: Position = "is-top-right"
        ) => (duration: AlertDuration) => {
          NotificationProgrammatic.open({
            message,
            type,
            position,
            indefinite: duration === "indefinite" ? true : false,
            duration:
              duration !== "indefinite" ? alertDurations[duration] : undefined
          });
        },
        snackbar: (
          message: string,
          type: Type = "is-light",
          position: Position = "is-bottom",
          action: {
            label: string;
            callback: () => void;
          } = {
              label: "OK",
              callback: () => {
                // empty
              }
            }
        ) => (duration: AlertDuration) => {
          SnackbarProgrammatic.open({
            message,
            type,
            position,
            indefinite: duration === "indefinite" ? true : false,
            duration:
              duration !== "indefinite" ? alertDurations[duration] : undefined,
            actionText: action.label,
            onAction: action.callback
          });
        },
        toast: (
          message: string,
          type: Type = "is-primary",
          position: Position = "is-bottom"
        ) => (duration: AlertDuration) => {
          ToastProgrammatic.open({
            message,
            type,
            position,
            duration: alertDurations[duration]
          });
        }
      }
    };
  },
  methods: {
    openModal<T>(
      configuration: ModalConfiguration<T>,
      params: Omit<
        BModalConfig,
        "content" | "component" | "parent" | "props" | "events"
      > = {}
    ): Promise<number> {
      return new Promise(resolve => {
        let idx: number;
        let hasModalCard = false;
        if (configuration.title) hasModalCard = true;
        if (configuration.foot)
          if (typeof configuration.foot === "function") hasModalCard = true;
          else if (configuration.foot.length > 0) hasModalCard = true;
        this.$buefy.modal.open(
          R.mergeRight(
            {
              component: Modal,
              props: {
                value: configuration
              },
              events: {
                handle: (handler: ModalHandler) => {
                  if (idx !== undefined) {
                    this.$set(this.modals, idx, handler);
                  } else {
                    idx = this.modals.push(handler) - 1;
                    resolve(idx);
                  }
                }
              },
              canCancel: configuration.canCancel,
              fullScreen: configuration.fullScreen,
              hasModalCard
            },
            params
          )
        )
        // ModalProgrammatic.open(
        //   R.mergeRight(
        //     {
        //       component: Modal,
        //       props: {
        //         value: configuration
        //       },
        //       events: {
        //         handle: (handler: ModalHandler) => {
        //           if (idx !== undefined) {
        //             this.$set(this.modals, idx, handler);
        //           } else {
        //             idx = this.modals.push(handler) - 1;
        //             resolve(idx);
        //           }
        //         }
        //       },
        //       canCancel: configuration.canCancel,
        //       fullScreen: configuration.fullScreen,
        //       hasModalCard
        //     },
        //     params
        //   )
        // );
      });
    }
  }
});

export { Generic };
