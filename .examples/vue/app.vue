<template>
  <div>
    <formast :schema="getJson" :props="props" :onLoad="onLoad" :options="options">
      <span>正在加载...</span>
    </formast>
    <div>
      <div v-for="err,i in errors" :key="i" style="color:red">{{err.message}}</div>
    </div>
    <pre>{{data}}</pre>
    <button type="button" @click="handleRadom">Random</button>
  </div>
</template>

<script>
import schemaJson from '../_shared/form.json';
import { Formast } from '../../src/vue';
import * as Options from '../../src/vue-d/index.js';

export default {
  data() {
    return {
      data: null,
      errors: [],
      model: null,
      props: {
        random: Math.random(),
        onSubmit: this.handleSubmit,
      },
      options: Options,
    }
  },
  methods: {
    handleSubmit(e) {
      e.preventDefault();

      const errors = this.model.validate();
      if (errors.length) {
        this.errors = errors;
        this.data = null;
        return;
      }

      this.errors = [];
      const data = this.model.toData();
      this.data = data;
    },
    handleRadom() {
      this.props.random = Math.random()
    },
    getJson() {
      return new Promise((r) => {
        setTimeout(() => r(schemaJson), 2000)
      })
    },
    onLoad({ model }) {
      this.model = model;
    },
  },
  components: {
    Formast,
  },
}
</script>
