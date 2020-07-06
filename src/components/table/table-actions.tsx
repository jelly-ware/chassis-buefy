import * as R from "ramda";
import v from "voca";
import * as tsx from "vue-tsx-support";
import { PagedResponse, Request } from "../../libs/crud";
import { Unpacked } from "../../toolkit";
import { Generic } from "../layout";
import { Schema } from "../mixins";
import { Column } from "./data-table";
import { chassis } from "../..";

const all = "all";

interface CheckableWhere {
  checked: boolean;
  predicate: Unpacked<NonNullable<Request["where"]>>;
}

interface EventsWithOn {
  onInput(val: PagedResponse): void;
  onWhere(val: CheckableWhere["predicate"][]): void;
  onColumns(val: Column[]): void;
  onSelected(val: string[]): void;
}

const TableActions = tsx
  .componentFactoryOf<EventsWithOn>()
  .mixin(Schema)
  .mixin(Generic)
  .create({
    props: {
      value: {
        type: Object as () => PagedResponse,
        required: true
      },
      tableColumns: {
        type: Array as () => Column[],
        required: true
      },
      selected: {
        type: Array as () => string[],
        required: true
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
        checkableWhere: [] as CheckableWhere[],
        searchKey: "",
        searchValue: "",
        columns: [] as Column[],
        detailed: false
      };
    },
    watch: {
      value: {
        immediate: true,
        handler(val: PagedResponse) {
          // if (!this.paginated && val.meta.pageSize !== val.meta.totalCount)
          //   this.updateValue(R.assocPath(['meta', 'pageSize'], val.meta.totalCount, this.value))
          const sizes = chassis.settings.opt.pageSizes.sort((a, b) => a - b);
          const index = sizes.filter(s => s <= val.meta.pageSize).length - 1;
          if (
            val.meta.pageSize !== sizes[index] &&
            val.meta.pageSize !== val.meta.totalCount
          )
            this.updateValue(
              R.assocPath(["meta", "pageSize"], sizes[index + 1], this.value)
            );
        }
      },
      checkableWhere: {
        handler(val: CheckableWhere[]) {
          this.$emit(
            "where",
            val.filter(cw => cw.checked).map(cw => cw.predicate)
          );
        }
      }
    },
    computed: {
      computedSizes() {
        const css = chassis.settings.opt.pageSizes
          .filter(s => s <= this.value.meta.totalCount)
          .sort((a, b) => a - b)
          .reduce((prev, curr) => {
            prev[String(curr)] = Number(curr);
            return prev;
          }, {} as { [key: string]: number });
        css["All"] = this.value.meta.totalCount;
        return css;
      },
      computedColumns(): Record<"key" | "label", string>[] {
        return [
          ...[...this.columns, ...this.tableColumns].map(col => ({
            label: col.label || v.titleCase(col["custom-key"]),
            key: col["custom-key"]
          })),
          ...Object.keys(this.newSchema.properties).map(col => ({
            key: col,
            label: v.titleCase(col)
          }))
        ];
      },
      computedSelected(): Record<"key" | "label", string>[] {
        return this.computedColumns
          .filter(({ key }) => this.selected.indexOf(key) !== -1)
          .sort(
            (a, b) =>
              this.selected.indexOf(a.key) - this.selected.indexOf(b.key)
          );
      },
      consoleLabel() {
        const briefFeedBack: string[] = [];
        // filters
        this.checkableWhere.filter(cw => cw.checked);
        if (this.checkableWhere.filter(e => e.checked).length > 0) {
          briefFeedBack.push(
            `Filters: ${this.checkableWhere
              .filter(e => e.checked)
              .map(
                e =>
                  `${v.titleCase(
                    e.predicate.type !== "OR" ? e.predicate.params!.x : "All"
                  )} (${
                    e.predicate.type !== "OR"
                      ? e.predicate.params!.y
                      : e.predicate.restrictions![0].params!.y
                  })`
              )
              .join(", ")}`
          );
        }
        return briefFeedBack;
      }
    },
    methods: {
      updateValue(val: PagedResponse) {
        this.$emit("input", val);
      },
      updateColumns(val: Column[]) {
        this.$emit("columns", val);
      },
      updatSelected(val: string[]) {
        this.$emit("selected", val);
      },
      updateSearch() {
        if (this.searchKey === all) {
          this.checkableWhere.push({
            checked: true,
            predicate: {
              type: "OR",
              restrictions: Object.keys(this.newSchema).map(col => ({
                type: "LIKE",
                params: {
                  x: col,
                  y: this.searchValue
                }
              }))
            }
          });
        } else {
          this.checkableWhere.push({
            checked: true,
            predicate: {
              type: "LIKE",
              params: {
                x: this.searchKey,
                y: this.searchValue
              }
            }
          });
        }
      },
      onSelectColumns() {
        let pickup: number;
        this.openModal({
          data: undefined,
          content: () => (
            <b-message title="Columns" type="is-primary" closable={false}>
              <div class="columns">
                <div class="column">
                  <h1 class="title is-4">Select</h1>
                  <b-table
                    data={this.computedColumns}
                    checked-rows={this.computedColumns.filter(
                      col => this.selected.indexOf(col.key) !== -1
                    )}
                    columns={[
                      {
                        field: "label",
                        label: "Column"
                      }
                    ]}
                    checkable
                    onCheck={(cl: any) => {
                      this.updatSelected(cl.map((row: any) => row.key));
                    }}
                  ></b-table>
                </div>
                <div class="column">
                  <h1 class="title is-4">Arrange</h1>
                  <b-table
                    data={this.computedSelected}
                    draggable
                    onDragstart={(payload: any) => {
                      pickup = payload.index;
                      payload.event.dataTransfer.effectAllowed = "copy";
                    }}
                    onDragover={(payload: any) => {
                      payload.event.dataTransfer.dropEffect = "copy";
                      payload.event.target
                        .closest("tr")
                        .classList.add("is-selected");
                      payload.event.preventDefault();
                    }}
                    onDragleave={(payload: any) => {
                      payload.event.target
                        .closest("tr")
                        .classList.remove("is-selected");
                      payload.event.preventDefault();
                    }}
                    onDrop={(payload: any) => {
                      payload.event.target
                        .closest("tr")
                        .classList.remove("is-selected");
                      const selected = this.computedSelected.map(
                        val => val.key
                      );
                      selected[pickup] = payload.row.key;
                      selected[payload.index] = this.computedSelected[
                        pickup
                      ].key;
                      this.updatSelected(selected);
                    }}
                    scopedSlots={{
                      default: (props: {
                        row: Record<"key" | "label", string>;
                        index: number;
                      }) => [
                        <b-table-column label="#" numeric>
                          {props.index}
                        </b-table-column>,
                        <b-table-column label="Column">
                          {props.row.label}
                        </b-table-column>
                      ]
                    }}
                  />
                </div>
              </div>
            </b-message>
          )
        });
      }
    },
    render() {
      return (
        <div>
          <b-field grouped>
            {this.selectColumns && (
              <b-field>
                <b-dropdown
                  aria-role="list"
                  scopedSlots={{
                    trigger: (props: { active: boolean }) => (
                      <button class="button is-primary">
                        <span>Actions</span>
                        <b-icon
                          icon={props.active ? "caret-up" : "caret-down"}
                        ></b-icon>
                      </button>
                    )
                  }}
                >
                  {this.selectColumns && (
                    <b-dropdown-item
                      aria-role="listitem"
                      onClick={this.onSelectColumns}
                    >
                      <b-icon icon="columns" />
                      Select Columns
                    </b-dropdown-item>
                  )}
                </b-dropdown>
              </b-field>
            )}
            {this.filterable && (
              <b-field>
                <b-select
                  icon="search"
                  icon-pack="fas"
                  value={this.searchKey}
                  onInput={(val: string) => (this.searchKey = val)}
                >
                  {this.newSchema.properties &&
                    Object.keys(this.newSchema.properties).map(k => (
                      <option value={k}>{v.titleCase(k)}</option>
                    ))}
                  <option value={all}>All</option>
                </b-select>
                <b-input
                  placeholder="Search"
                  type="text"
                  value={this.searchValue}
                  onInput={(val: string) => (this.searchValue = val)}
                  {...{
                    nativeOn: {
                      keyup: (e: KeyboardEvent) => {
                        if (e.key === "Enter") {
                          this.updateSearch();
                        }
                      }
                    }
                  }}
                />
                <p class="control" onClick={this.updateSearch}>
                  <button class="button is-primary">Search</button>
                </p>
              </b-field>
            )}
            {this.paginated && (
              <b-field label="Rows" horizontal>
                <b-select
                  value={this.value.meta.pageSize}
                  onInput={(val: number) =>
                    this.updateValue(
                      R.assocPath(["meta", "pageSize"], val, this.value)
                    )
                  }
                >
                  {Object.entries(this.computedSizes).map(e => (
                    <option value={e[1]}>{e[0]}</option>
                  ))}
                </b-select>
              </b-field>
            )}
          </b-field>
          {this.checkableWhere.length > 0 && (
            <b-collapse
              class="message is-primary"
              open={this.detailed}
              aria-id="aria-id"
              onOpen={() => (this.detailed = true)}
              onClose={() => (this.detailed = false)}
            >
              <div slot="trigger" class="message-header">
                <p>{this.consoleLabel}</p>
              </div>
              <div class="message-body">
                <nav class="level">
                  <div class="level-left">
                    <div class="level-item">
                      <div>
                        <p class="heading">filters</p>
                        {this.checkableWhere.map((e, idx) => (
                          <b-field>
                            <b-checkbox
                              value={e.checked}
                              size="is-small"
                              type="is-dark"
                              onInput={(val: boolean) => {
                                this.$set(
                                  this.checkableWhere,
                                  idx,
                                  R.assoc("checked", val, e)
                                );
                              }}
                            />
                            <p class="control">
                              <span class="button is-static is-small">
                                {v.titleCase(
                                  e.predicate.type !== "OR"
                                    ? e.predicate.params!.x
                                    : "All"
                                )}
                              </span>
                              <span class="button is-static is-small">
                                {e.predicate.type !== "OR"
                                  ? e.predicate.params!.y
                                  : e.predicate.restrictions![0].params!.y}
                              </span>
                            </p>
                            <p class="control">
                              <b-button
                                type="is-dark"
                                icon-left="times"
                                size="is-small"
                                onClick={() => {
                                  this.$delete(this.checkableWhere, idx);
                                }}
                              />
                            </p>
                          </b-field>
                        ))}
                      </div>
                    </div>
                  </div>
                </nav>
              </div>
            </b-collapse>
          )}
        </div>
      );
    }
  });

export { TableActions };
