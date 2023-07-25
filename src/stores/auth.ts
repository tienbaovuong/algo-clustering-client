import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import jwtDecode from 'jwt-decode'
import type { JwtPayload } from 'jwt-decode'
import get from 'lodash/get'
import moment from 'moment'

interface AuthState {
  decodedToken: JwtPayload | null
  token: string | null
}

const authState: AuthState = {
  decodedToken: null,
  token: null
}

export const useAuthStore = defineStore("auth", () => {
    const state = ref(authState);
  
    function isAuthenticated(): boolean {
      const exp = state.value.decodedToken?.exp
      if (!exp) {
        return false
      }
      return (
        moment.unix(exp).isAfter()
      );
    };
  
    function decodeToken(token: string) {
      state.value.decodedToken = jwtDecode(token);
    }
  
    function reset() {
      state.value.decodedToken = null;
      state.value.token = null;
    }
  
    function setToken(token: string) {
      state.value.token = token;
    }
  
    function saveTokenToStorage(token: string) {
      localStorage.setItem("token", token);
    }
  
    function logIn(token?: string | null) {
      if (!token) return;
      decodeToken(token);
      setToken(token);
      saveTokenToStorage(token);
    }
  
    function logOut() {
      reset();
      localStorage.removeItem('token');
    }
  
    return {
      state,
      isAuthenticated,
      logIn,
      logOut,
    };
  });
