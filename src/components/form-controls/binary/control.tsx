import * as tsx from "vue-tsx-support";
import { FormControl } from "../../mixins/form-control";

type Kind = "switch" | "checkbox" | "checkbox-button";

interface EventsWithOn {
  onInput(val: boolean): void;
}

const Binary = tsx
  .componentFactoryOf<EventsWithOn>()
  .mixin(FormControl)
  .create({
    props: {
      value: {
        type: Boolean
      },
      kind: {
        type: String as () => Kind
      },
      labelWhenTrue: {
        type: String
      },
      labelWhenFalse: {
        type: String
      }
    },
    render() {
      let Tag = "b-switch";
      if (this.kind == "checkbox") Tag = "b-checkbox";
      if (this.kind == "checkbox-button") Tag = "b-checkbox-button";
      return (
        <Tag
          value={this.value}
          onInput={(val: boolean) => this.$emit("input", val)}
          type={this.type}
          size={this.size}
          rounded={this.rounded}
          expanded={this.expanded}
        >
          {this.value
            ? this.labelWhenTrue || "Yes"
            : this.labelWhenFalse || "No"}
        </Tag>
      );
    }
  });

export { Binary };
