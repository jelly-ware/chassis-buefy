import Vue from "vue";
import { Configuration as ModalConfiguration } from "../components/layout/modal";

const REFRESH = "chassis:refresh";

class EventHub {
  readonly vue: Vue;
  constructor() {
    this.vue = new Vue();
  }
  publish(event: string, ...args: any[]) {
    this.vue.$emit(event, ...args);
  }
  subscribe(event: string | Array<string>, callback: Function) {
    this.vue.$on(event, callback);
  }
  unsubscribe(event?: string | Array<string>, callback?: Function) {
    this.vue.$off(event, callback);
  }
  // refresh
  refresh() {
    this.publish(REFRESH);
  }
  onRefresh(callback: () => void) {
    this.subscribe(REFRESH, callback);
  }
  offRefresh(callback?: () => void) {
    this.unsubscribe(REFRESH, callback);
  }
}

export { EventHub };
