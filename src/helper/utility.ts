import { format } from "fecha";

export function formatDate(val: Date) {
    return format(new Date(val), "DD/MM/YYYY");
  }
  
  export function formatDateTime(val: any) {
    return format(new Date(val), "DD/MM/YYYY hh:mm A");
  }
  export function formatStringToLocalDateTime(val: String) {
    val = val + "Z"
    return formatDateTime(val)
  }