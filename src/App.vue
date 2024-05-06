<script setup lang="ts">
import {RouterLink, RouterView} from 'vue-router'
import 'element-plus/dist/index.css'
import Header from '@/components/basic/Header.vue'
import {onBeforeMount} from "vue";
import {useGlobalStore} from "@/store/pinia";
import {request} from "@/utils/axios";

function getToken() :string {
  const store = useGlobalStore()
  return store["user"].token ?? ""
}

onBeforeMount(() => {
  request.defaults.headers.token = getToken()
})
</script>

<template>
  <div class="home">
    <Header/>
    <RouterView/>
  </div>
</template>

<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background: $theme-background;
  @include flex(column, start, center);
}

header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
