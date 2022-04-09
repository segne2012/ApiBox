<template>
  <h1>{{ msg }}</h1>
  <button @click="count++">count is: {{ count }}</button>
  <p>Edit <code>components/HelloWorld.vue</code> to test hot module replacement.</p>
</template>

<script setup>
import { ref } from 'vue';
import { useCountStore } from '../store/index'

const pinia = useCountStore();
console.log(pinia);
let count = ref(0);
let msg = ref("Hello Vue 3.0 + Vite");
</script>
