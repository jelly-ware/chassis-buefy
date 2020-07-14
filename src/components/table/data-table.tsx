import { NotificationProgrammatic } from "buefy";
import numeral from "numeral";
import * as R from "ramda";
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { api } from "../../libs";
import { Schema as _Schema, SchemaReq } from "../../libs/api";
import { PagedResponse, Request } from "../../libs/crud";
import { Unpacked } from "../../toolkit";
import { Schema } from "../mixins";
import { TableActions } from "./table-actions";
import v from "voca";
import { Generic } from "../layout";
import { chassis } from "../..";

interface DefaultSlotProps<T extends {} = { [key: string]: any }> {
  row: Unpacked<PagedResponse<T>["data"]>;
  index: number;
}

type Column<T extends {} = { [key: string]: any }> = Record<
  "numeric" | "centered" | "sortable" | "visible",
  boolean
> &
  Partial<Record<"label" | "field", string>> & {
    width?: number;
    "custom-sort"?: Function;
    "custom-key": string;
    slot?: (props: DefaultSlotProps<T>) => VNode;
    header?: (col: Column<T>, idx: number) => VNode;
    subheading?: (col: Column<T>, idx: number) => VNode;
  };

interface Action {
  label?: string;
  icon?: string;
  iconPack?: string;
  action: (props: DefaultSlotProps) => void;
}

interface ScopedSlots {
  default: DefaultSlotProps;
}

interface EventsWithOn {
  onAsyncDataLoaded(pagedResponse: PagedResponse): void
}

const DataTable = tsx
  .componentFactoryOf<EventsWithOn, ScopedSlots>()
  .mixin(Schema)
  .mixin(Generic)
  .create({
    props: {
      columns: {
        type: Array as () => Column[],
        default: () => []
      },
      selected: {
        type: Array as () => string[],
        default: () => []
      },
      rowAction: {
        type: Object as () => {
          header?: () => VNode;
          subheading?: () => VNode;
          actions?: Action[];
          slot?: (props: DefaultSlotProps) => VNode;
        }
      },
      op: {
        type: Object as () => SchemaReq extends infer U
          ? U extends string
          ? never
          : U
          : never
      },
      param: {
        type: [Object, String, Number, Array]
      },
      narrowed: {
        type: Boolean,
        default: false
      },
      stickyHeader: {
        type: Boolean
      },
      height: {
        type: Number
      },
      where: {
        type: Array as () => NonNullable<Request["where"]>,
        default: () => []
      },
      orderBy: {
        type: Array as () => NonNullable<Request["orderBy"]>,
        default: () => []
      },
      checkable: {
        type: Boolean,
        default: false
      },
      detailed: {
        type: Boolean,
        default: false
      },
      paginated: {
        type: Boolean,
        default: false
      },
      filterable: {
        type: Boolean,
        default: false
      },
      selectColumns: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        schemaColumns: [] as Column[],
        actionsColumns: [] as Column[],
        newSelected: [...this.selected],
        pagedResponse: {
          data: [],
          links: {
            self: "",
            first: "",
            prev: "",
            next: "",
            last: ""
          },
          meta: {
            pageNumber:
              chassis.settings.opt.defaultPagination["data-table"].page,
            pageSize: chassis.settings.opt.defaultPagination["data-table"].size,
            lastPageNumber:
              chassis.settings.opt.defaultPagination["data-table"].page,
            totalCount: 0
          }
        } as PagedResponse,
        showLoading: false,
        newWhere: [] as NonNullable<Request["where"]>,
        newOrderBy: [...this.orderBy],
        checkedRows: [] as { [key: string]: any }[]
      };
    },
    computed: {
      computedColumns(): Column[] {
        let cols = [
          ...this.columns,
          ...this.actionsColumns,
          ...this.schemaColumns
        ];
        if (this.newSelected.length > 0) {
          cols.forEach(col => {
            col.visible =
              this.newSelected.findIndex(s => s === col["custom-key"]) !== -1;
          });
          cols = cols.sort(
            (a, b) =>
              this.newSelected.indexOf(a["custom-key"]) -
              this.newSelected.indexOf(b["custom-key"])
          );
        }
        return cols;
      }
    },
    watch: {
      op: {
        immediate: true,
        async handler(val: SchemaReq) {
          if (val)
            this.newSchema = ((await chassis.api.schema(
              val
            )) as any).returnType.properties.data.element;
        }
      },
      // param: {
      //     immediate: true,
      //     async handler(val) {
      //         if (val) {
      //             if (Object.keys(this.newSchema).length > 0) {
      //                 // this.loadAsyncData()
      //             }
      //         }
      //     }
      // },
      where: {
        immediate: true,
        handler() {
          this.loadAsyncData();
        }
      },
      newWhere: {
        immediate: true,
        handler() {
          this.loadAsyncData();
        }
      },
      orderBy: {
        immediate: true,
        handler() {
          this.loadAsyncData();
        }
      },
      newOrderBy: {
        immediate: true,
        handler() {
          this.loadAsyncData();
        }
      },
      newSchema: {
        immediate: true,
        handler(val: _Schema) {
          if (val.properties) {
            this.schemaColumns = Object.entries(val.properties).map(e => {
              const col: Pick<Column, "custom-key"> &
                Partial<Omit<Column, "custom-key">> = {
                "custom-key": e[0],
                sortable: true,
                numeric: e[1].type === "NUMBER"
              };
              col.slot = props =>
                e[1].type === "COLLECTION" ? (
                  <b-taglist>
                    {(props.row[e[0]] ? [...props.row[e[0]]] : []).map(item => (
                      <b-tag type="is-info">
                        {this.parse(e[1].element!, props.row[e[0]])}
                      </b-tag>
                    ))}
                  </b-taglist>
                ) : (
                    <span>
                      {props.row[e[0]] !== undefined &&
                        this.parse(e[1], props.row[e[0]])}
                    </span>
                  );
              return this.completeColumn(col);
            });
            this.loadAsyncData();
          }
        }
      }
    },
    mounted() {
      chassis.eventhub.onRefresh(this.loadAsyncData);
    },
    beforeDestroy() {
      chassis.eventhub.offRefresh(this.loadAsyncData);
    },
    methods: {
      completeColumn(
        val: Pick<Column, "custom-key"> & Partial<Omit<Column, "custom-key">>
      ): Column {
        return Object.assign(
          {
            label: val["custom-key"],
            numeric: false,
            centered: false,
            sortable: false,
            visible: true,
            field: val["custom-key"]
          },
          val
        );
      },
      parse(schema: _Schema, val: any) {
        if (schema.type === "NUMBER") return numeral(val).format();
        if (schema.type === "BOOLEAN") return val ? "Yes" : "No";
        if (
          schema.type === "OBJECT" ||
          schema.type === "RECURRENT" ||
          schema.type === "SELF"
        )
          return val.display;
        return String(val);
      },
      updatePagedResponse(pagedResponse: PagedResponse) {
        this.pagedResponse = pagedResponse;
        this.loadAsyncData();
      },
      onPagedResponseChanged(pagedResponse: PagedResponse) {
        this.pagedResponse = pagedResponse;
        this.loadAsyncData();
      },
      onWhereChanged(where: NonNullable<Request["where"]>) {
        this.newWhere = where;
        this.pagedResponse = R.assocPath(
          ["meta", "pageNumber"],
          chassis.settings.opt.defaultPagination["data-table"].page,
          this.pagedResponse
        );
        this.loadAsyncData();
      },
      async loadAsyncData() {
        if (!this.newSchema.mdl) return;
        this.showLoading = true;
        try {
          const where = [...this.newWhere, ...this.where];
          const orderBy = [...this.newOrderBy, ...this.orderBy];
          const promise = this.op
            ? chassis.api.rs.of(
              this.op.op,
              ...(typeof this.op.svc === "string"
                ? [this.op.svc]
                : this.op.svc)
            )<PagedResponse, {}>({
              param: this.param,
              where,
              orderBy,
              pageNumber: this.pagedResponse.meta.pageNumber,
              pageSize: this.pagedResponse.meta.pageSize
            })
            : chassis.crud.select({
              mdl: this.newSchema.mdl,
              where,
              orderBy,
              pageNumber: this.pagedResponse.meta.pageNumber,
              pageSize: this.pagedResponse.meta.pageSize
            });
          this.pagedResponse = await promise;
          this.$emit('async-data-loaded', this.pagedResponse)
        } catch (error) {
          this.$buefy.notification.open({
            message: error,
            hasIcon: true,
            position: "is-top-right",
            queue: false,
            type: "is-danger"
          });
        }
        this.showLoading = false;
      }
    },
    render() {
      return (
        <div>
          <TableActions
            schema={this.newSchema}
            value={this.pagedResponse}
            tableColumns={this.columns}
            selected={this.newSelected}
            onInput={this.updatePagedResponse}
            onWhere={(val: NonNullable<Request["where"]>) =>
              (this.newWhere = val)
            }
            onColumns={(val: Column[]) => (this.actionsColumns = val)}
            onSelected={(val: string[]) => (this.newSelected = val)}
            paginated={this.paginated}
            filterable={this.filterable}
            selectColumns={this.selectColumns}
          />
          <b-table
            data={this.pagedResponse.data}
            scrollable={true}
            striped
            narrowed={this.narrowed}
            hoverable
            loading={this.showLoading}
            mobile-cards
            paginated={this.paginated}
            backend-pagination
            total={this.pagedResponse.meta.totalCount}
            per-page={this.pagedResponse.meta.pageSize}
            aria-next-label="Next page"
            aria-previous-label="Previous page"
            aria-page-label="Page"
            aria-current-label="Current page"
            checkable={this.checkable}
            checked-rows={this.checkedRows}
            onCheck={(cl: any) => (this.checkedRows = cl)}
            detailed={this.detailed}
            sticky-header={this.stickyHeader}
            height={this.height}
            backend-sorting
            sort-multiple
            sort-multiple-data={this.newOrderBy.map(ob => ({
              field: ob.column,
              order: ob.desc ? "desc" : "asc"
            }))}
            onSort={(field: string, order: string) => {
              const idx = this.newOrderBy.findIndex(ob => ob.column === field);
              if (idx === -1)
                this.newOrderBy.push({
                  column: field,
                  desc: order === "desc"
                });
            }}
            {...{
              on: {
                "page-change": (page: number) => {
                  this.pagedResponse = R.assocPath(
                    ["meta", "pageNumber"],
                    page,
                    this.pagedResponse
                  );
                  this.loadAsyncData();
                },
                "sorting-priority-removed": (field: string) => {
                  const idx = this.newOrderBy.findIndex(
                    ob => ob.column === field
                  );
                  if (idx !== -1) this.newOrderBy.splice(idx);
                }
              }
            }}
            scopedSlots={{
              default: (props: DefaultSlotProps) => {
                const cols: VNode[] = [];
                if (this.rowAction)
                  cols.push(
                    <b-table-column
                      custom-key="actions"
                      label="actions"
                      centered
                      header-class="is-actions-header"
                      cell-class="is-actions-cell"
                      scopedSlots={{
                        header: this.rowAction.header
                          ? (props: { column: Column; index: number }) =>
                            this.rowAction.header!()
                          : undefined,
                        subheading: this.rowAction.header
                          ? (props: { column: Column; index: number }) =>
                            this.rowAction.subheading!()
                          : undefined
                      }}
                    >
                      {this.rowAction.slot ? (
                        this.rowAction.slot(props)
                      ) : this.rowAction.actions ? (
                        <div class="buttons has-addons is-centered">
                          {this.rowAction.actions.map(ra => (
                            <b-button
                              type="is-primary"
                              outlined
                              icon-right={ra.icon}
                              icon-pack={ra.iconPack}
                              tag="a"
                              onClick={() => ra.action(props)}
                            >
                              {ra.label}
                            </b-button>
                          ))}
                        </div>
                      ) : (
                            undefined
                          )}
                    </b-table-column>
                  );
                this.computedColumns.forEach(col =>
                  cols.push(
                    <b-table-column
                      props={R.omit(["slot"], col)}
                      // header-class='has-background-primary has-text-white'
                      scopedSlots={{
                        header: col.header
                          ? (props: { column: Column; index: number }) =>
                            col.header!(props.column, props.index)
                          : undefined,
                        subheading: col.header
                          ? (props: { column: Column; index: number }) =>
                            col.subheading!(props.column, props.index)
                          : undefined
                      }}
                    >
                      {col.slot
                        ? col.slot(props)
                        : props.row[col["custom-key"]]}
                    </b-table-column>
                  )
                );
                return cols;
              },
              detail: (props: DefaultSlotProps) =>
                this.$scopedSlots.detail ? (
                  this.$scopedSlots.default(props)
                ) : (
                    <div>
                      <p class="has-text-centered heading">Raw Attributes</p>
                      <table class="table is-hoverable is-narrow is-striped">
                        <tbody>
                          {this.schemaColumns.map(col => (
                            <tr>
                              <td>{col.label}</td>
                              <td>{col.slot!(props)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {this.columns.length + this.actionsColumns.length > 0 && [
                        <br />,
                        <p class="has-text-centered heading">
                          Computed Attributes
                      </p>,
                        <table class="table is-hoverable is-narrow is-striped">
                          <tbody>
                            {this.columns.map(col => (
                              <tr>
                                <td>
                                  {col.label || v.titleCase(col["custom-key"])}
                                </td>
                                <td>
                                  {col.slot
                                    ? col.slot(props)
                                    : props.row[col["custom-key"]]}
                                </td>
                              </tr>
                            ))}
                            {this.actionsColumns.map(col => (
                              <tr>
                                <td>
                                  {col.label || v.titleCase(col["custom-key"])}
                                </td>
                                <td>
                                  {col.slot
                                    ? col.slot(props)
                                    : props.row[col["custom-key"]]}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ]}
                    </div>
                  )
            }}
          >
            <b-taglist attached slot="bottom-left">
              <b-tag type="is-primary" size="is-medium">
                Total
              </b-tag>
              <b-tag type="is-light" size="is-medium">
                {numeral(this.pagedResponse.meta.totalCount).format("0,0")}
              </b-tag>
            </b-taglist>
            {this.$slots.empty ? (
              this.$slots.empty
            ) : (
                <section slot="empty" class="section">
                  <div class="content has-text-grey has-text-centered">
                    <p>
                      <b-icon
                        icon={this.showLoading ? "spinner" : "frown-open"}
                        size="is-large"
                      ></b-icon>
                    </p>
                    <p>{this.showLoading ? "Fetching data." : "Nothing here."}</p>
                  </div>
                </section>
              )}
          </b-table>
        </div>
      );
    }
  });

export { DataTable, DefaultSlotProps, Column, Action };
