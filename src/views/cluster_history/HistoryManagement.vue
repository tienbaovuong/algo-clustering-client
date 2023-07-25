<script setup lang="ts">
import axios, { BASE_URL } from '@/plugins/axios'
import { HISTORY_STATUSES } from '@/views/cluster_history/constants'
import { ref } from 'vue'
import { useToast, POSITION } from 'vue-toastification'
import type { VDataTableServer } from 'vuetify/labs/components'
import { formatStringToLocalDateTime } from '@/helper/utility'

interface History {
  _id: string
  name: string
  description: string
  created_at: string
  updated_at: string
  status: string
}
const TemplateArray: History[] = []
const toast = useToast()

// table list related
const historyList = ref([...TemplateArray])
const loading = ref(false)
type Headers = InstanceType<typeof VDataTableServer>['headers']
const historyHeaders: Headers = [
  {
    title: 'Name',
    key: 'name',
    align: 'start'
  },
  {
    title: 'Description',
    key: 'description',
    align: 'start'
  },
  {
    title: 'Status',
    key: 'status',
    align: 'start'
  },
  {
    title: 'Created_at',
    key: 'created_at',
    align: 'start'
  },
  {
    title: 'Updated_at',
    key: 'updated_at',
    align: 'start'
  },
  {
    title: 'Action',
    key: 'action',
    align: 'center',
    sortable: false
  }
]
const searchName = ref('')
const itemsPerPage = ref(10)
const totalItem = ref(0)

interface Pagination {
  page: number
  itemsPerPage: number
}
const getListData = async ({ page, itemsPerPage }: Pagination) => {
  const resp = await axios.get(
    `${BASE_URL}/api/v1/cluster_history/list?name=${searchName.value}&page=${page}&limit=${itemsPerPage}`,
    {
      withCredentials: true
    }
  )
  if (resp.data.error_code === 0) {
    parseHistoryList(resp.data.data.items)
    totalItem.value = resp.data.data.total
  }
}
const parseHistoryList = (items: any) => {
  historyList.value.splice(0)
  for (var history of items) {
    let new_item: History = {
      _id: history._id.toString(),
      name: history.name.toString(),
      description: history.description ? history.description.toString() : 'No description',
      status: history.cluster_job_status.status.toString(),
      created_at: formatStringToLocalDateTime(history.created_at.toString()),
      updated_at: formatStringToLocalDateTime(history.updated_at.toString())
    }
    historyList.value.push(new_item)
  }
}

// Search related
const onSearch = async () => {
  await getListData({ page: 1, itemsPerPage: itemsPerPage.value })
}

//delete dialog
const deleteDialog = ref(false)
const deleteId = ref('0')
const deleteName = ref('No history')
const onDelete = async () => {
  deleteDialog.value = false
  await axios.delete(`${BASE_URL}/api/v1/cluster_history/${deleteId.value}`, {
    withCredentials: true
  })
  toast.success('History deleted', {
    position: POSITION.TOP_CENTER,
    timeout: 2000,
    closeOnClick: true,
    pauseOnHover: true
  })
  await getListData({ page: 1, itemsPerPage: itemsPerPage.value })
}
</script>

<template>
  <div style="width: 100%; min-height: 850px">
    <v-container fluid>
      <v-row>
        <v-col cols="4"><span class="text-h5">History List</span></v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex">
          <h3 class="mt-3">Name:</h3>
          &nbsp; &nbsp;
          <v-text-field
            v-model="searchName"
            style="max-width: 600px"
            placeholder="Search by history name"
          >
          </v-text-field>
          <v-btn class="mt-3 ml-5" color="blue-darken-3" elevation="2" @click.stop="onSearch"
            >Search
          </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div class="d-flex" style="width: 100%">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="historyHeaders"
              :items-length="totalItem"
              :loading="loading"
              :items="historyList"
              item-value="_id"
              class="elevation-1"
              @update:options="getListData"
            >
              <template v-slot:[`item.status`]="{ index }">
                <span :style="{ color: HISTORY_STATUSES[historyList[index].status] }">{{
                  historyList[index].status
                }}</span>
              </template>
              <template v-slot:[`item.action`]="{ index }">
                <v-btn
                  :to="{
                    name: 'cluster-history-detail',
                    params: { id: historyList[index]._id }
                  }"
                  icon
                  color="blue"
                  tooltip="1"
                  ><v-icon>mdi-magnify-expand</v-icon></v-btn
                >
                <v-btn
                  class="ml-2"
                  color="red"
                  icon
                  @click.stop="
                    deleteDialog = true
                    deleteId = historyList[index]._id
                    deleteName = historyList[index].name
                  "
                  ><v-icon>mdi-delete</v-icon></v-btn
                >
              </template>
            </v-data-table-server>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="deleteDialog" width="auto" style="font-size: 20px" persistent>
      <v-card class="pa-3">
        <v-card-title class="text-center"> Are you sure about this? </v-card-title>
        <v-card-text class="text-center" style="width: 500px; word-wrap: break-word">
          Deleting <span class="font-weight-bold">{{ deleteName }}</span>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green-darken-3" @click="deleteDialog = false"
            ><strong style="font-size: 20px">Cancel</strong></v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="red-darken-3" @click="onDelete"
            ><strong style="font-size: 20px">Delete</strong></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
