import axios from "axios";
import {API_URL} from "@/config/settings"

export const BASE_URL = API_URL
const _axios = axios.create({})

export default _axios;