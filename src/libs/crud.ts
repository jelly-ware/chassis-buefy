import { api, Rs } from "./api";
import { Settings } from "../settings";

const persist = "persist";
const find = "find";
const select = "select";
const del = "delete";
const enm = "enum";
const invokestate = "invokestate";
const validate = "validate";

type Pagination = Record<"page" | "size", number>;

interface Entity<K = any, V extends string = string> {
  id?: K;
  status?: V;
  display?: string;
  [key: string]: any;
}

interface Enum {
  name: string;
  display: string;
  ordinal: number;
  [key: string]: any;
}

type PredicateType = 'EQUAL' | 'LIKE' | 'OR' | 'AND' | 'IS_NULL' | 'IS_NOT_NULL';

interface Predicate {
  type: PredicateType;
  params?: { [key: string]: any };
  restrictions?: Predicate[];
}

interface Sorting {
  column: string;
  desc: boolean;
}

interface Request<K = any, V extends string = string> {
  id?: K;
  status?: V;
  name?: string;
  entity?: Entity<K, V>;
  mdl: string;
  pageNumber?: number;
  pageSize?: number;
  where?: Predicate[];
  orderBy?: Sorting[];
}

type Links = Record<"self" | "first" | "prev" | "next" | "last", string>;

type Meta = Record<
  "pageNumber" | "pageSize" | "lastPageNumber" | "totalCount",
  number
>;

interface PagedResponse<T extends {} = { [key: string]: any }> {
  data: T[];
  links: Links;
  meta: Meta;
}

interface Violation {
  message: string;
  propertyPath: string;
  rootBeanClass: string;
  constraint: string;
}

class Crud {
  private settings: Settings;
  constructor(settings: Settings) {
    this.settings = settings;
  }
  persist<K, V extends string>(
    mdl: string,
    entity: Entity<K, V>
  ): Promise<Entity<K, V>> {
    return this.settings.opt.rs.of(persist)({
      mdl,
      entity
    });
  }
  delete<K>(mdl: string, id: K): Promise<void> {
    return this.settings.opt.rs.of(del)({
      mdl,
      id
    });
  }
  find<K, V extends string>(
    req: Pick<Request<K, V>, "mdl" | "id" | "name" | "status" | "where">
  ): Promise<Entity<K, V>> {
    return this.settings.opt.rs.of(find)(req);
  }
  select<K, V extends string>(
    req: Pick<
      Request<K, V>,
      | "mdl"
      | "id"
      | "name"
      | "status"
      | "where"
      | "orderBy"
      | "pageNumber"
      | "pageSize"
    >
  ): Promise<PagedResponse<Entity<K, V>>> {
    return this.settings.opt.rs.of(select)({
      ...req
    });
  }
  invokeState<K, V extends string>(
    mdl: string,
    id: K,
    status: V
  ): Promise<void> {
    return this.settings.opt.rs.of(invokestate)({
      mdl,
      id,
      status
    });
  }
  validate<K, V extends string>(
    mdl: string,
    entity: Entity<K, V>
  ): Promise<Array<Violation>> {
    return this.settings.opt.rs.of(validate)({
      mdl,
      entity
    });
  }
  enumerate(mdl: string): Promise<Array<Enum>> {
    return this.settings.opt.rs.of(enm)(mdl);
  }
}

export {
  Pagination,
  Entity,
  Enum,
  PredicateType,
  Predicate,
  Sorting,
  Request,
  Links,
  Meta,
  PagedResponse,
  Violation,
  Crud
};
