<template>
  <div>
    <formast :schema="getJson" :props="props" :onLoad="onLoad">
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
import formJson from './form.json'
import { Formast } from '../../src/vue'

export default {
  components: {
    Formast,
  },
  data() {
    return {
      data: null,
      errors: [],
      model: null,
      props: {
        random: Math.random(),
        onSubmit: this.handleSubmit,
      },
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
        setTimeout(() => r(formJson), 2000)
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
