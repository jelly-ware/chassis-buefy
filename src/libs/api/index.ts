import { Rs } from "./rs";
import { Settings } from "../../settings";
import { AxiosStatic } from "axios";

type ValueType =
  | "COLLECTION"
  | "OBJECT"
  | "STRING"
  | "NUMBER"
  | "BOOLEAN"
  | "VOID"
  | "SELF"
  | "RECURRENT"
  | "MAP"
  | "ENUM";

interface Annotation {
  type: string;
  params: { [s: string]: any };
}

interface Properties {
  [s: string]: Schema;
}

interface Schema {
  mdl: string;
  type: ValueType;
  title: string;
  validations: Array<Annotation>;
  uis: Array<Annotation>;
  properties: Properties;
  element?: Schema;
  key?: Schema;
  value?: Schema;
}

type OpSchema = Record<"svc" | "op", string> &
  Record<"parameter" | "returnType", Schema>;

type SchemaReq =
  | string
  | {
      op: string;
      svc: string | string[];
    };

interface Api<T extends AxiosStatic = AxiosStatic> {
  rs: Rs<T>;
  schema: <T extends SchemaReq>(
    req: T
  ) => Promise<T extends string ? Schema : OpSchema>;
}

const api: (settings: Settings) => Api = settings => ({
  get rs() {
    return settings.opt.rs;
  },
  schema(req) {
    if (typeof req == "string") {
      return this.rs.of("schema")({
        mdl: req
      });
    } else {
      const param: any = Object.assign({}, req);
      if (param.svc) {
        if (typeof param.svc == "string") {
          param.svc = [param.svc];
        }
      }
      return this.rs.of("schema")(param);
    }
  }
});

export {
  SchemaReq,
  ValueType,
  Annotation,
  Properties,
  Schema,
  OpSchema,
  Api,
  api,
  Rs
};
