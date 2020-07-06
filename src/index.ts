import { Exchanger, EventHub, Crud, api } from "./libs";
import { Options, Settings } from "./settings";
import { Api } from "./libs/api";

interface Chassis {
  settings: Settings;
  api: Api;
  crud: Crud;
  eventhub: EventHub;
  xchg: Exchanger;
}

declare module "vue/types/vue" {
  interface Vue {
    $chassis: Chassis;
  }
}

const settings = new Settings({});

const chassis: Chassis = {
  settings,
  api: api(settings),
  crud: new Crud(settings),
  eventhub: new EventHub(),
  xchg: new Exchanger(settings)
};

const plugin: (
  opt: Pick<Options, "rs"> & Partial<Omit<Options, "rs">>
) => Chassis = opt => {
  settings.update(opt);
  return chassis;
};

export * from "./components";
export * from "./toolkit";
export { Chassis, Exchanger, EventHub, Crud, api, chassis, plugin as default };
