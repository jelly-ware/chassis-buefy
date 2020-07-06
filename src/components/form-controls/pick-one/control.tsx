import v from "voca";
import { VNode } from "vue";
import * as tsx from "vue-tsx-support";
import { chassis } from "../../..";
import { SchemaReq } from "../../../libs/api";
import {
  Entity,
  Enum,
  Meta,
  PagedResponse,
  Predicate
} from "../../../libs/crud";
import { random } from "../../../toolkit";
import { FormControl } from "../../mixins";

interface EventsWithOn {
  onInput: (val: Entity | string) => void;
}

const PickOne = tsx
  .componentFactoryOf<
    EventsWithOn,
    { default: { option: Entity; index: number } }
  >()
  .mixin(FormControl)
  .create({
    props: {
      value: {
        type: [Object as () => Entity, String]
      },
      where: {
        type: Array as () => Predicate[],
        default: () => []
      },
      radio: {
        type: Boolean,
        default: false
      },
      op: {
        type: Object as () => SchemaReq extends infer U
          ? U extends string
            ? never
            : U
          : never
      },
      param: {
        type: [Number, String, Object, Array]
      }
    },
    data() {
      return {
        showLoading: false,
        search: "",
        options: [] as (Enum | Entity)[],
        optionsMeta: {
          lastPageNumber:
            chassis.settings.opt.defaultPagination["form-element"].page,
          pageNumber:
            chassis.settings.opt.defaultPagination["form-element"].page,
          pageSize: chassis.settings.opt.defaultPagination["form-element"].size,
          totalCount: 0
        } as Meta
      };
    },
    computed: {
      computedOptions(): Array<Entity | Enum> {
        if (this.newSchema.type == "ENUM" && this.search)
          return this.options.filter(opt =>
            v.includes(
              opt.display!.toUpperCase(),
              String(this.search.toUpperCase())
            )
          );
        return [...this.options];
      },
      computedWhere(): Predicate[] {
        const where = [...this.where];
        if (this.search)
          where.push({
            type: "OR",
            restrictions: Object.keys(this.newSchema.properties).map(x => ({
              type: "LIKE",
              params: {
                x,
                y: this.search
              }
            }))
          });
        return where;
      }
    },
    watch: {
      op: {
        immediate: true,
        async handler(val: SchemaReq) {
          if (val)
            if (this.param)
              this.newSchema = (
                await chassis.api.schema(this.op)
              ).returnType.properties.data.element!;
        }
      },
      newSchema: {
        immediate: true,
        handler(val) {
          if (val)
            if (!["OBJECT", "SELF", "RECURRENT"].includes(val.type))
              this.loadOptions();
        }
      },
      param: {
        immediate: true,
        async handler(val) {
          if (val)
            if (this.op)
              this.newSchema = (
                await chassis.api.schema(this.op)
              ).returnType.properties.data.element!;
        }
      },
      where: {
        handler(val) {
          if (val)
            if (["OBJECT", "SELF", "RECURRENT"].includes(this.newSchema.type))
              this.loadOptions();
        }
      },
      search: {
        handler(val) {
          if (val)
            if (
              ["OBJECT", "SELF", "RECURRENT"].includes(this.newSchema.type) &&
              val !== (this.value as any)?.display
            )
              this.loadOptions();
        }
      },
      value: {
        handler(val) {
          if (val) this.search = "";
        }
      }
    },
    methods: {
      updateValue(val: Entity | string) {
        this.$emit("input", val);
      },
      async loadOptions() {
        this.showLoading = true;
        try {
          if (this.newSchema.type == "ENUM")
            this.options = await chassis.crud.enumerate(this.newSchema.mdl);
          else {
            const promise = this.op
              ? chassis.api.rs.of(
                  this.op.op,
                  ...(typeof this.op.svc === "string"
                    ? [this.op.svc]
                    : this.op.svc)
                )<PagedResponse, {}>({
                  param: this.param,
                  where: this.computedWhere,
                  pageSize: this.optionsMeta.pageSize,
                  pageNumber: this.optionsMeta.pageNumber
                })
              : chassis.crud.select({
                  mdl: this.newSchema.mdl,
                  where: this.computedWhere,
                  pageSize: this.optionsMeta.pageSize,
                  pageNumber: this.optionsMeta.pageNumber
                });
            const pr = await promise;
            this.optionsMeta = pr.meta;
            this.options = pr.data;
          }
        } catch (error) {
          // continue regardless of error
        }
        this.showLoading = false;
      },
      advanceOptions() {
        let pageSize =
          chassis.settings.opt.defaultPagination["form-element"].size;
        if (this.optionsMeta.pageSize)
          pageSize = pageSize + this.optionsMeta.pageSize;
        this.optionsMeta = Object.assign({}, this.optionsMeta, {
          pageSize
        });
        this.loadOptions();
      },
      renderEnum(): VNode[] | VNode {
        const name = random.string;
        return this.radio ? (
          this.computedOptions.map(opt => (
            <b-radio
              value={this.value}
              onInput={this.updateValue}
              name={name}
              native-value={opt.name}
              type={this.type}
              size={this.size}
            >
              {opt.display}
            </b-radio>
          ))
        ) : (
          <b-select
            value={this.value}
            onInput={this.updateValue}
            placeholder={this.placeholder}
            loading={this.showLoading}
            size={this.size}
            expanded={this.expanded}
            icon={this.icon}
            icon-pack={this.iconPack}
            rounded={this.rounded}
            type={this.type}
          >
            {this.computedOptions.map(opt => (
              <option value={opt.name}>{opt.display}</option>
            ))}
          </b-select>
        );
      },
      renderEntity(): VNode {
        return (
          <b-autocomplete
            data={this.computedOptions}
            placeholder={this.placeholder}
            open-on-focus
            keep-first
            clearable
            icon={this.icon}
            icon-pack={this.iconPack}
            loading={this.showLoading}
            check-infinite-scroll={true}
            value={this.search || (this.value as any)?.display}
            onInput={(val: string) => {
              if ((this.$options as any).timer) {
                clearTimeout((this.$options as any).timer);
                (this.$options as any).timer = null;
              }
              (this.$options as any).timer = setTimeout(() => {
                this.search = val;
              }, 800);
            }}
            onFocus={() => {
              if (this.options.length === 0) this.loadOptions();
            }}
            onSelect={this.updateValue}
            {...{
              on: {
                "infinite-scroll": this.advanceOptions
              }
            }}
            scopedSlots={{
              default: (props: any) =>
                this.$scopedSlots.default
                  ? this.$scopedSlots.default(props)
                  : props.option.display
            }}
          >
            <template slot="empty">No options for {this.search}</template>
            {this.$slots.header && (
              <template slot="header">{this.$slots.header}</template>
            )}
            {this.$slots.footer && (
              <template slot="footer">{this.$slots.footer}</template>
            )}
          </b-autocomplete>
        );
      }
    },
    render() {
      return (
        <div
          class={{
            control: true,
            block: this.radio
          }}
        >
          {["OBJECT", "SELF", "RECURRENT"].includes(this.newSchema.type) &&
            this.renderEntity()}
          {this.newSchema.type == "ENUM" && this.renderEnum()}
        </div>
      );
    }
  });

export { PickOne };
