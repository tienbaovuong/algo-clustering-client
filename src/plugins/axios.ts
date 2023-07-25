import axios, { AxiosError }  from "axios";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import { useAuthStore } from "@/stores/auth";
import {API_URL} from "@/config/settings"

export const BASE_URL = API_URL
const _axios = axios.create({})
const authStore = useAuthStore();

_axios.interceptors.request.use(
    async (cfg) => {
      if (!isEmpty(authStore.state.token)) {
        cfg.headers["Authorization"] = `Bearer ${authStore.state.token}`;
      }
      return cfg;
    },
    (err: AxiosError) => {
      // Do something with request error
      return Promise.reject(err);
    }
  );
  
  // Add a response interceptor
  _axios.interceptors.response.use(
    (res) => {
      // Do something with response data
      return res;
    },
    async (err: AxiosError) => {
      // Do something with response error
      const status = get(err, "response.status");
      if ([401, 403].includes(status as number)) {
        await authStore.logOut();
      }
      return Promise.reject(err);
    }
  );

export default _axios;