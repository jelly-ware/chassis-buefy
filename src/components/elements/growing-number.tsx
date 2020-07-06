import numeral from "numeral";
import * as tsx from "vue-tsx-support";
import { Generic } from "../layout";

const GrowingNumber = tsx.extendFrom(Generic).create({
  props: {
    prefix: {
      type: String
    },
    suffix: {
      type: String
    },
    value: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 500
    },
    format: {
      type: String,
      default: "0,0"
    }
  },
  data() {
    return {
      newValue: 0,
      step: 0
    };
  },
  watch: {
    value: {
      immediate: true,
      handler() {
        this.growInit();
      }
    }
  },
  methods: {
    growInit() {
      const m = this.value / (this.duration / 25);
      this.grow(m);
    },
    grow(m: number) {
      const v = Math.ceil(this.newValue + m);

      if (v > this.value) {
        this.newValue = this.value;
        return false;
      }

      this.newValue = v;
      setTimeout(() => {
        this.grow(m);
      }, 25);
    }
  },
  render() {
    return (
      <div>
        {this.prefix && this.prefix}
        {numeral(this.newValue).format(this.format)}
        {this.suffix && this.suffix}
      </div>
    );
  }
});

export { GrowingNumber };
