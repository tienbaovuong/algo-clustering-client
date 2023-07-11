<script setup lang="ts">
import axios, { BASE_URL } from "@/plugins/axios";
import { HISTORY_STATUSES } from "@/views/cluster_history/constants"
import MiniThesisCard from "@/components/cluster_history/MiniThesisCard.vue"
import { ref, onBeforeMount, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import draggable from "vuedraggable";
import { isEqual, cloneDeep } from "lodash";
import { useToast, POSITION } from "vue-toastification";

const toast = useToast()
const route = useRoute()
const interval = ref(null as any)
const emptyArray: any[] = [];

// Data ref
const historyFinishMode = ref(false);
const originalHistoryData = ref(null as any);
const historyData = ref(null as any);
const historyName = ref("");
const historyDescription = ref("");
const historyStatus = ref("");
const nlp_done = ref(0);
const nlp_total = ref(1);

const getHistoryData = async(update_all_mode = true) => {
    const id = route.params.id
    const resp = await axios.get(
        `${BASE_URL}/api/v1/cluster_history/${id}`,
        {
        withCredentials: true,
        }
    );
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
        if (status === "FINISHED") {
            historyFinishMode.value = true
            clearInterval(interval.value)
        }
        else if (status === "FAILED") {
            historyFinishMode.value = false
            clearInterval(interval.value)
            toast.error("Clustering failed", {
                position: POSITION.TOP_CENTER,
                timeout: 2000,
                closeOnClick: true,
                pauseOnHover: true,
            })
        }
        else {
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
    const resp = await axios.put(
        `${BASE_URL}/api/v1/cluster_history/${id}`,
        body,
        {
        withCredentials: true,
        }
    );
    if (resp.data.error_code === 0) {
        await getHistoryData()
        toast.success("History updated", {
            position: POSITION.TOP_CENTER,
            timeout: 2000,
            closeOnClick: true,
            pauseOnHover: true,
        })
    }
    else {
        toast.error("Something wrong happend", {
            position: POSITION.TOP_CENTER,
            timeout: 3000,
            closeOnClick: true,
            pauseOnHover: true,
        })
    }
}
const clusterIndex = ref(0);
const clusterEdiDialog = ref(false);
const clusterEditName = ref("");
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
    for(let thesis of historyData.value.clusters[clusterIndex.value].children) {
        thesisList.push(thesis.thesis_id)
    }
    const resp = await axios.post(
        `${BASE_URL}/api/v1/clustering/suggestions`,
        {
            thesis_list_id: thesisList
        },
        {
            withCredentials: true,
        }
    );
    if (resp.data.error_code === 0) {
        clusterSuggestion.value = resp.data.data
    }
}
// before mounted
onBeforeMount(async () => {
    interval.value = setInterval( async() => {
        await getHistoryData(false);
    }, 2000)
    await getHistoryData();
});
// on unmounter
onUnmounted(() => {
    clearInterval(interval.value);
});
// computer
const disableUpdate = computed(() => {
    return (isEqual(historyData.value, originalHistoryData.value) 
            && originalHistoryData.value.name === historyName.value
            && originalHistoryData.value.description === historyDescription.value) 
            || historyName.value === ""
})
const colorProgress = computed(() => {
    if (historyStatus.value === "FINISHED") {
        return 'green'
    }
    else if (historyStatus.value === "FAILED"){
        return 'red'
    }
    return "yellow"
})
const valueProgress = computed(() => {
    if (historyStatus.value === "FINISHED") {
        return 100
    }
    else if (historyStatus.value === "CLUSTERING") {
        return 90
    }
    else if (historyStatus.value === "FAILED") {
        return 50
    }
    else if (historyStatus.value === "PENDING") {
        return 0
    }
    return 10 + 100 * nlp_done.value / nlp_total.value;
})
</script>

<template>
    <div v-if="historyData" style="width: 100%; min-height: 850px; padding:20px;">
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
                    <v-btn :disabled="disableUpdate" color="blue-darken-3" @click.stop="onUpdate">Update</v-btn>
                </v-col>
            </v-row>
            <v-row>
                <v-col cols="3" class="d-flex align-center">
                    <span class="text-h6">Status: </span>&nbsp; &nbsp;
                    <span class="text-h6" :style="{color: HISTORY_STATUSES[historyData.cluster_job_status.status] }">{{ historyData.cluster_job_status.status }}</span>
                    <span v-if="historyStatus==='WAITING NLP'" class="text-h6" :style="{color: 'orange'}">({{ nlp_done }}/{{ nlp_total }})</span>
                </v-col>
                <v-col v-if="historyStatus !== 'FAILED'" cols="9" class="d-flex justify-center align-center">
                    <v-progress-linear
                        :model-value="valueProgress"
                        :color="colorProgress"
                        height="20"
                        striped
                    ></v-progress-linear>
                </v-col>
            </v-row>
            <v-row><v-col><v-divider/></v-col></v-row>
            <v-row>
                <v-col v-if="historyStatus==='FINISHED'">
                    <span class="text-h6">CLUSTER RESULT </span>
                    <span>(Drag and drop the card to change their cluster)</span>
                    <p class="text-h6">Total number of cluster: {{ historyData.clusters.length }}</p>
                </v-col>
                <v-col v-else>
                    <span class="text-h6">INPUT THESIS</span>
                </v-col>
            </v-row>
            <v-row v-if="historyStatus==='FINISHED'">
                <v-col 
                    class="pa-1"
                    v-for="(item, index) in historyData.clusters"
                    :key="index"
                    cols="12"
                    sm="2"
                    on
                >
                    <div style="border: 1px solid orange; border-radius: 10px;" class="pa-3">
                        <div class="d-flex justify-space-between">
                            <span class="text-h6" style="max-width: 223px;">{{ item.name }}</span>
                            <v-icon @click.stop="onEditCluster(index)">mdi-pencil</v-icon>
                        </div>
                        <draggable
                            class="list-group mt-3"
                            :list="item.children"
                            group="thesis"
                            item-key="thesis_id"
                        >
                            <template #item="{ element }">
                                <div class="list-group-item pb-2">
                                    <mini-thesis-card :data="element" :hover_mode="false"></mini-thesis-card>
                                </div>
                            </template>
                        </draggable>
                    </div>
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
        <v-dialog
            v-model="clusterEdiDialog"
            width="500px"
            style="font-size: 20px"
            persistent
        >
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
                    <v-icon
                        class="ml-2 mr-2"
                        color="blue"
                        size="small"
                        @click.stop="onGetSuggestion"
                    >mdi-reload</v-icon>
                </div>
                <ul class="pl-4">
                    <li
                        style="font-size: 15px"
                        v-for="item in clusterSuggestion"
                        :key="item"
                    >{{ item }}</li>
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