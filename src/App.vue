<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ref } from "vue";

const drawer = ref(true);
const rail = ref(true);
</script>

<template>
  <v-layout>
    <v-app-bar
      app
      color="blue-darken-4"
      dark
    >
      <v-col cols="8" style="min-width: 411px">
        <div class="d-flex align-center">
          <v-img
            alt="Cluster App"
            class="shrink ml-4 mr-2"
            contain
            src="/logo.png"
            transition="scale-transition"
            style="max-width: 160px; width: 100%"
          />

          <h3 class="ml-8 text-uppercase" style="font-weight: 500">
            {{ $route.meta?.description || $route.name }}
          </h3>
        </div>
      </v-col>

      <v-spacer></v-spacer>

      <v-btn icon title="Log out">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      color="#ffffff"
      :rail="rail"
      permanent
      id="side-menu"
      class="side-menu"
      @click="rail = false"
    >
      <v-list-item
        class="user-info pl-1"
        nav
      >
        <template v-slot:append>
          <v-btn
            v-if="rail"
            variant="text"
            icon="mdi-menu"
            @click.stop="rail = !rail"
          ></v-btn>
          <v-btn
            v-else
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
        <span class="text-h5 ml-3">Navigation</span>
      </v-list-item>

      <v-divider></v-divider>

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-bookshelf"
          class="d-flex pl-2"
          title="Thesis"
          value="thesis"
          exact
          link
          :to="{ name: 'thesis-management' }"
        >
        </v-list-item>
      </v-list>
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-history"
          class="d-flex pl-2"
          title="History"
          value="history"
          exact
          link
          :to="{ name: 'cluster-history-management' }"
        >
        </v-list-item>
      </v-list>
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-robot-outline"
          class="d-flex pl-2"
          title="Clustering"
          value="clustering"
          exact
          link
          :to="{ name: 'clustering' }"
        >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-main style="min-height: 250px; min-width: 800px; background-color: white;">
      <RouterView />
    </v-main>
  </v-layout>
</template>

<style>
.side-menu:not(.v-navigation-drawer--rail) {
  min-width: 256px;
}
.side-menu:not(.v-navigation-drawer--rail) .user-info div.v-list-item-title {
  white-space: initial;
}
</style>
