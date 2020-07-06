import * as tsx from "vue-tsx-support";
import { FormControl } from "../../mixins/form-control";
import moment from "moment";

type Kind = "date" | "date-time";

interface EventsWithOn {
  onInput(val: string): void;
}

const DateTime = tsx
  .componentFactoryOf<EventsWithOn>()
  .mixin(FormControl)
  .create({
    props: {
      value: {
        type: String
      },
      kind: {
        type: String as () => Kind
      }
    },
    methods: {
      updateValue(val: Date | string) {
        const dt = moment(val);
        if (dt.isValid()) {
          this.$emit("input", this.format(dt.toDate()));
        }
      },
      parse(date: string) {
        if (!date) return undefined;
        const dt = moment(date);
        return dt.isValid() ? dt.toDate() : undefined;
      },
      format(date: Date) {
        return moment(date).format(
          (this.kind || "date") === "date"
            ? "YYYY-MM-DD"
            : "YYYY-MM-DDTHH:mm:ss.SSSSSSSSS"
        );
      }
    },
    render() {
      let Tag = "b-datepicker";
      if (this.kind == "date-time") Tag = "b-datetimepicker";
      return (
        <Tag
          value={this.parse(this.value)}
          onInput={this.updateValue}
          placeholder={this.placeholder}
          icon={this.icon}
          iconPack={this.iconPack}
          type={this.type}
          size={this.size}
          rounded={this.rounded}
          expanded={this.expanded}
        />
      );
    }
  });

export { DateTime };
