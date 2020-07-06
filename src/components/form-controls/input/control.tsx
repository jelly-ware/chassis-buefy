import Cleave from "cleave.js";
import { CleaveOptions } from "cleave.js/options";
import Vue from "vue";
import * as tsx from "vue-tsx-support";
import { FormControl } from "../../mixins/form-control";

type Kind = "text" | "textarea" | "number";

interface EventsWithOn {
  onInput(val: number | string): void;
  onCleave(cleave: Cleave): void;
}

const Input = tsx
  .componentFactoryOf<EventsWithOn>()
  .mixin(FormControl)
  .create({
    props: {
      value: {
        type: [Number, String]
      },
      cleave: {
        type: Object as () => CleaveOptions
      },
      kind: {
        type: String as () => Kind
      },
      password: {
        type: Boolean
      },
      maxlength: {
        type: Number
      },
      min: {
        type: Number
      },
      max: {
        type: Number
      },
      step: {
        type: Number
      }
    },
    data() {
      return {
        newCleave: null as Cleave | null
      };
    },
    computed: {
      computedKind() {
        if (this.kind) return this.kind;
        if (this.newSchema.type === "NUMBER") return "number";
        return "text";
      },
      computedProps() {
        const props: { [key: string]: any } = {};
        if (this.computedKind == "number") {
          props["controls-rounded"] = this.rounded;
          props["controls-position"] = "compact";
          if (this.min) props.min = this.min;
          if (this.max) props.max = this.max;
          if (this.step) props.step = this.step;
        } else {
          props.icon = this.icon;
          props["icon-pack"] = this.iconPack;
          props.type = this.computedKind;
          if (this.password) {
            props["password-reveal"] = this.password;
            props.type = "password";
          }
          if (this.maxlength) props.maxlength = this.maxlength;
        }
        return props;
      }
    },
    watch: {
      cleave() {
        this.updateCleave();
      }
    },
    mounted() {
      this.updateCleave();
    },
    beforeDestroy() {
      if (this.newCleave) {
        this.newCleave.destroy();
      }
    },
    methods: {
      updateCleave() {
        if (this.newCleave) {
          this.newCleave.destroy();
        }
        if (this.cleave && (this.$refs.inputControl as Vue).$refs.input) {
          this.newCleave = new Cleave(
            (this.$refs.inputControl as Vue).$refs.input as HTMLElement,
            this.cleave
          );
          this.$emit("cleave", this.newCleave);
        }
      },
      updateValue(val: number | string) {
        // if (val) {
        this.$emit(
          "input",
          this.computedKind === "number" ? Number(val) : String(val)
        );
        // }
      }
    },
    render() {
      let Tag = "b-input";
      if (this.computedKind == "number") Tag = "b-numberinput";
      return (
        <Tag
          ref="inputControl"
          value={this.value}
          onInput={(val: string | number) =>
            this.updateValue(
              this.newCleave ? this.newCleave.getRawValue() : val
            )
          }
          placeholder={this.placeholder}
          type={this.type}
          size={this.size}
          rounded={this.rounded}
          expanded={this.expanded}
          props={this.computedProps}
        />
      );
    }
  });

export { Input };
