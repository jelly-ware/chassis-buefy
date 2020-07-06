import { AxiosStatic } from "axios";
import { Rs } from "./libs/api";
import { Pagination } from "./libs/crud";

interface Options<T extends AxiosStatic = AxiosStatic> {
  rs: Rs<T>;
  defaultPagination: Record<"data-table" | "form-element", Pagination>;
  pageSizes: Array<number>;
}

const defaults = {
  defaultPagination: {
    "data-table": {
      page: 1,
      size: 5
    },
    "form-element": {
      page: 1,
      size: 10
    }
  },
  pageSizes: [1, 5, 10, 15, 20, 25, 30, 50, 100, 200, 500, 1000, 5000]
} as Options;

class Settings {
  private _opt: Options;
  constructor(opt: Partial<Options>) {
    this._opt = Object.assign({}, defaults, opt);
  }
  get opt() {
    return this._opt;
  }
  update(opt: Partial<Options>) {
    this._opt = Object.assign(this._opt, opt);
  }
}

export { Options, defaults, Settings };
