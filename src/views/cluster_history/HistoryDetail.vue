<script setup lang="ts">
import axios, { BASE_URL } from '@/plugins/axios'
import { HISTORY_STATUSES } from '@/views/cluster_history/constants'
import MiniThesisCard from '@/components/cluster_history/MiniThesisCard.vue'
import { ref, onBeforeMount, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import draggable from 'vuedraggable'
import { isEqual, cloneDeep } from 'lodash'
import type { VDataTable } from 'vuetify/labs/components'
import { useToast, POSITION } from 'vue-toastification'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const toast = useToast()
const route = useRoute()
const interval = ref(null as any)
const emptyArray: any[] = []
const chartData = ref({} as any)
type Headers = InstanceType<typeof VDataTable>['headers']
const summaryHeader: Headers = [
  {
    title: 'Cluster name',
    key: 'name',
    align: 'start'
  },
  {
    title: 'Cluster size',
    key: 'children',
    align: 'start'
  }
]

// Data ref
const open = ref([...emptyArray])
const choosenLoop = ref(0)
const historyFinishMode = ref(false)
const originalHistoryData = ref(null as any)
const historyData = ref(null as any)
const historyName = ref('')
const historyDescription = ref('')
const historyStatus = ref('')
const nlp_done = ref(0)
const nlp_total = ref(1)

const getHistoryData = async (update_all_mode = true) => {
  const id = route.params.id
  const resp = await axios.get(`${BASE_URL}/api/v1/cluster_history/${id}`, {
    withCredentials: true
  })
  if (resp.data.error_code === 0) {
    originalHistoryData.value = resp.data.data
    historyData.value = cloneDeep(resp.data.data)
    if (update_all_mode) {
      historyName.value = resp.data.data.name
      historyDescription.value = resp.data.data.description
    }
    historyStatus.value = resp.data.data.cluster_job_status.status
    nlp_done.value = resp.data.data.cluster_job_status.total_done_nlp
    nlp_total.value = resp.data.data.cluster_job_status.total_thesis
    const status = resp.data.data.cluster_job_status.status
    if (status === 'FINISHED' || status === 'CLUSTERING') {
      historyFinishMode.value = true
      if (status === 'FINISHED') {
        clearInterval(interval.value)
        choosenLoop.value = resp.data.data.clusters.length
      } else {
        choosenLoop.value = resp.data.data.clusters.length
      }
      if (choosenLoop.value > 0) {
        open.value = [
          ...Array(resp.data.data.clusters[choosenLoop.value - 1].result_cluster.length).keys()
        ]
      }
      chartData.value = {
        labels: loopOptions.value,
        datasets: [
          {
            label: 'Loss Values',
            backgroundColor: 'black',
            data: historyData.value.loss_values
          }
        ]
      }
    } else if (status === 'FAILED') {
      historyFinishMode.value = false
      clearInterval(interval.value)
      toast.error('Clustering failed', {
        position: POSITION.TOP_CENTER,
        timeout: 2000,
        closeOnClick: true,
        pauseOnHover: true
      })
    } else {
      historyFinishMode.value = false
    }
  }
}
const onUpdate = async () => {
  const id = route.params.id
  const body = {
    name: historyName.value,
    description: historyDescription.value,
    clusters: historyData.value.clusters
  }
  const resp = await axios.put(`${BASE_URL}/api/v1/cluster_history/${id}`, body, {
    withCredentials: true
  })
  if (resp.data.error_code === 0) {
    await getHistoryData()
    toast.success('History updated', {
      position: POSITION.TOP_CENTER,
      timeout: 2000,
      closeOnClick: true,
      pauseOnHover: true
    })
  } else {
    toast.error('Something wrong happend', {
      position: POSITION.TOP_CENTER,
      timeout: 3000,
      closeOnClick: true,
      pauseOnHover: true
    })
  }
}
const clusterIndex = ref(0)
const clusterEdiDialog = ref(false)
const clusterEditName = ref('')
const clusterSuggestion = ref([...emptyArray])
const onEditCluster = (index: number) => {
  clusterIndex.value = index
  clusterEditName.value = historyData.value.clusters[index].name
  clusterEdiDialog.value = true
}
const onConfirmEditCluster = () => {
  historyData.value.clusters[clusterIndex.value].name = clusterEditName.value
  onExitEditCluster()
}
const onExitEditCluster = () => {
  clusterSuggestion.value = [...emptyArray]
  clusterEdiDialog.value = false
}
const onGetSuggestion = async () => {
  const thesisList = [...emptyArray]
  for (let thesis of historyData.value.clusters[clusterIndex.value].children) {
    thesisList.push(thesis.thesis_id)
  }
  const resp = await axios.post(
    `${BASE_URL}/api/v1/clustering/suggestions`,
    {
      thesis_list_id: thesisList
    },
    {
      withCredentials: true
    }
  )
  if (resp.data.error_code === 0) {
    clusterSuggestion.value = resp.data.data
  }
}
const collapseAll = () => {
  open.value = [...emptyArray]
}
// before mounted
onBeforeMount(async () => {
  interval.value = setInterval(async () => {
    await getHistoryData(false)
  }, 2000)
  await getHistoryData()
})
// on unmounter
onUnmounted(() => {
  clearInterval(interval.value)
})
// computer
const disableUpdate = computed(() => {
  return (
    (isEqual(historyData.value, originalHistoryData.value) &&
      originalHistoryData.value.name === historyName.value &&
      originalHistoryData.value.description === historyDescription.value) ||
    historyName.value === ''
  )
})
const colorProgress = computed(() => {
  if (historyStatus.value === 'FINISHED') {
    return 'green'
  } else if (historyStatus.value === 'FAILED') {
    return 'red'
  }
  return 'yellow'
})
const valueProgress = computed(() => {
  if (historyStatus.value === 'FINISHED') {
    return 100
  } else if (historyStatus.value === 'CLUSTERING') {
    return 90
  } else if (historyStatus.value === 'FAILED') {
    return 50
  } else if (historyStatus.value === 'PENDING') {
    return 0
  }
  return 10 + (100 * nlp_done.value) / nlp_total.value
})
const loopOptions = computed(() => {
  let opts = Array.from({ length: historyData.value.clusters.length }, (_, i) => i + 1)
  return opts
})
</script>

<template>
  <div v-if="historyData" style="width: 100%; min-height: 850px; padding: 20px">
    <v-container fluid>
      <v-row>
        <v-col>
          <span class="text-h6">Name</span>
          <v-text-field
            v-model="historyName"
            placeholder="Enter name for the result"
            v-bind:rules="[(value) => !!value || 'A name is required.']"
          ></v-text-field>
        </v-col>
        <v-col>
          <span class="text-h6">Description</span>
          <v-text-field
            v-model="historyDescription"
            placeholder="Enter description for the results"
            hide-details
          />
        </v-col>
        <v-col cols="2" class="d-flex justify-center align-center">
          <v-btn :disabled="disableUpdate" color="blue-darken-3" @click.stop="onUpdate"
            >Update</v-btn
          >
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="3" class="d-flex align-center">
          <span class="text-h6">Status: </span>&nbsp; &nbsp;
          <span
            class="text-h6"
            :style="{ color: HISTORY_STATUSES[historyData.cluster_job_status.status] }"
            >{{ historyData.cluster_job_status.status }}</span
          >
          <span v-if="historyStatus === 'WAITING NLP'" class="text-h6" :style="{ color: 'orange' }"
            >({{ nlp_done }}/{{ nlp_total }})</span
          >
          <span v-if="historyStatus === 'CLUSTERING'" class="text-h6" :style="{ color: 'orange' }"
            >(Loop {{ historyData.clusters.length }})</span
          >
        </v-col>
        <v-col
          v-if="historyStatus !== 'FAILED'"
          cols="9"
          class="d-flex justify-center align-center"
        >
          <v-progress-linear
            :model-value="valueProgress"
            :color="colorProgress"
            height="20"
            striped
          ></v-progress-linear>
        </v-col>
      </v-row>
      <v-row
        ><v-col><v-divider /></v-col
      ></v-row>
      <v-row>
        <v-col v-if="historyStatus === 'FINISHED' || historyStatus === 'CLUSTERING'">
          <div class="d-flex justify-space-between">
            <div class="align-center">
              <span class="text-h6">CLUSTER RESULT </span>
              <span>(Drag and drop the card to change their cluster)</span>
            </div>
            <div class="d-flex align-center">
              <span class="text-h6 mr-10">Loop No</span>
              <v-select v-model="choosenLoop" :items="loopOptions" hide-details></v-select>
            </div>
          </div>
          <v-list>
            <v-list-group value="Summary" v-if="historyStatus === 'FINISHED'">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-table"
                  title="Show current loop summary"
                ></v-list-item>
              </template>
              <div class="d-flex justify-center">
                <v-data-table
                  style="width: 50%"
                  :headers="summaryHeader"
                  :items-per-page="-1"
                  :items="historyData.clusters[choosenLoop - 1].result_cluster"
                >
                <template v-slot:[`item.children`]="{ index }">
                    {{ historyData.clusters[choosenLoop - 1].result_cluster[index].children.length }}
                </template>
                <template v-slot:bottom><div></div></template>
                </v-data-table>
              </div>
            </v-list-group>
            <v-list-group value="Loss value">
              <template v-slot:activator="{ props }">
                <v-list-item
                  v-bind="props"
                  prepend-icon="mdi-chart-bell-curve-cumulative"
                  title="Show loss values"
                ></v-list-item>
              </template>
              <div class="d-flex justify-center" style="height: 500px">
                <Line :data="chartData" />
              </div>
            </v-list-group>
          </v-list>
          <div class="mb-5">
            <span class="text-h6">Number of loops: {{ historyData.clusters.length }}</span>
          </div>
          <div class="d-flex mb-3">
            <span class="text-h6"
              >Total number of cluster:
              {{ historyData.clusters[choosenLoop - 1]?.result_cluster.length }}</span
            >
            <v-btn class="ml-4" color="blue-darken-3" @click.stop="collapseAll">Collapse All</v-btn>
          </div>
        </v-col>
        <v-col v-else>
          <span class="text-h6">INPUT THESIS</span>
        </v-col>
      </v-row>
      <v-row v-if="historyStatus === 'FINISHED' || historyStatus === 'CLUSTERING'">
        <v-col>
          <v-list v-model:opened="open" v-if="choosenLoop > 0">
            <v-list-group
              class="pa-1 cluster_group_box mb-3"
              v-for="(item, index) in historyData.clusters[choosenLoop - 1].result_cluster"
              :key="index"
              :value="index"
              on
            >
              <template v-slot:activator="{ props }">
                <div class="d-flex">
                  <v-icon class="ml-3 mt-3" @click.stop="onEditCluster(index)">mdi-pencil</v-icon>
                  <v-list-item
                    v-bind="props"
                    :title="item.name"
                    style="width: calc(100% - 40px)"
                  ></v-list-item>
                </div>
              </template>
              <v-divider />
              <div class="pa-3">
                <draggable
                  class="list-group d-flex"
                  :list="item.children"
                  group="thesis"
                  item-key="thesis_id"
                >
                  <template #item="{ element }">
                    <div class="list-group-item pr-2">
                      <mini-thesis-card
                        :data="historyData.non_clustered_thesis[element]"
                        :hover_mode="false"
                      ></mini-thesis-card>
                    </div>
                  </template>
                </draggable>
              </div>
            </v-list-group>
          </v-list>
        </v-col>
      </v-row>
      <v-row v-else>
        <v-col
          class="pa-2"
          v-for="item in historyData.non_clustered_thesis"
          :key="item.thesis_id"
          cols="12"
          sm="3"
          on
        >
          <mini-thesis-card :data="item" :hover_mode="true"></mini-thesis-card>
        </v-col>
      </v-row>
    </v-container>
    <v-dialog v-model="clusterEdiDialog" width="500px" style="font-size: 20px" persistent>
      <v-card class="pa-3">
        <v-card-title class="text-center"> Edit cluster name </v-card-title>
        <v-card-text>
          <span class="text-h6">Cluster name</span>
          <v-text-field
            v-model="clusterEditName"
            placeholder="Enter name of the cluster"
            v-bind:rules="[(value) => !!value || 'A name is required.']"
          ></v-text-field>
          <div class="d-flex justify-start">
            <span class="text-h6">Suggestions</span>
            <v-icon class="ml-2 mr-2" color="blue" size="small" @click.stop="onGetSuggestion"
              >mdi-reload</v-icon
            >
          </div>
          <ul class="pl-4">
            <li style="font-size: 15px" v-for="item in clusterSuggestion" :key="item">
              {{ item }}
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-btn color="green-darken-3" @click="onExitEditCluster"
            ><strong style="font-size: 20px">Cancel</strong></v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="red-darken-3" @click="onConfirmEditCluster"
            ><strong style="font-size: 20px">Apply</strong></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.cluster_group_box {
  border: 1px solid orange;
  border-radius: 10px;
  overflow-x: auto;
}
.cluster_group_box ::-webkit-scrollbar {
  height: 2px;
}
.edit_cluster_icon {
  position: relative;
}
</style>
