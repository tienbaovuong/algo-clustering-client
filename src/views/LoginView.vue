<script setup lang="ts">
import axios, { BASE_URL } from '@/plugins/axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const errorMsg = ref('')

const login = async () => {
  if (username.value === '') {
    errorMsg.value = 'Empty username'
    return
  }
  if (password.value === '') {
    errorMsg.value = 'Empty password'
    return
  }
  try {
    const resp = await axios.post(
      `${BASE_URL}/api/v1/login`,
      {
        username: username.value,
        password: password.value
      },
      {
        withCredentials: true
      }
    )
    if (resp.data.error_code === 0) {
      errorMsg.value = ''
      username.value = ''
      password.value = ''
      authStore.logIn(resp.data.data.access_token)
      router.push({ name: 'thesis-management' })
    }
  } catch {
    errorMsg.value = 'Wrong username or password'
    username.value = ''
    password.value = ''
  }
}
onMounted(() => {
  if (authStore.isAuthenticated()) {
    router.push({ name: 'thesis-management' })
  }
})
</script>
<template>
  <div class="d-flex justify-center align-center" style="width: 100%; min-height: 850px">
    <v-card class="pa-10" style="background-color: rgb(240, 240, 240); border: 1px solid blue">
      <div class="d-flex justify-center">
        <v-img
          alt=""
          class="mb-10"
          contain
          src="/default-avatar.png"
          transition="scale-transition"
          style="max-width: 150px; width: 100%"
        />
      </div>
      <h3>Username</h3>
      <v-text-field style="width: 400px" v-model="username" label="Username" />
      <h3>Password</h3>
      <v-text-field style="width: 400px" v-model="password" label="Password" type="password" />
      <div class="d-flex justify-center mb-5" style="width: 100%">
        <v-btn color="blue-darken-3" size="large" @click="login">Login</v-btn>
      </div>
      <div :class="errorMsg === '' ? 'd-none' : ''" style="text-align: center; width: 100%">
        <h3 style="color: red;">{{ errorMsg }}</h3>
      </div>
    </v-card>
  </div>
</template>
