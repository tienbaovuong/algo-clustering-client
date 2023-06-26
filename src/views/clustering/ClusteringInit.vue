<script setup lang="ts">
import axios, { BASE_URL } from "@/plugins/axios";
import { ref } from "vue";
import { useRouter } from "vue-router";
import type { VDataTableServer } from "vuetify/labs/components";
import draggable from "vuedraggable";

interface Thesis {
  _id: string;
  semester: string;
  title: string;
  student_name: string;
  student_id: string;
}
const TemplateArray: Thesis[] = [];
const router = useRouter()

// table list related
const thesisList = ref([...TemplateArray]);
const loading = ref(false);
type Headers = InstanceType<typeof VDataTableServer>['headers']
const thesisHeaders: Headers = [
  {
    title: "Title",
    key: "title",
    align: "start",
  },
  {
    title: "Semester",
    key: "semester",
    align: "start",
  },
  {
    title: "Student name",
    key: "student_name",
    align: "start",
  },
  {
    title: "Student ID",
    key: "student_id",
    align: "start",
  },
  {
    title: "Action",
    key: "action",
    align: "center",
    sortable: false,
  },
];
const searchName = ref("");
const searchSemester = ref("");
const itemsPerPage = ref(10);
const totalItem = ref(0);

interface Pagination {
  page: number;
  itemsPerPage: number;
}
const getListData = async ({ page, itemsPerPage }: Pagination) => {
  const resp = await axios.get(
    `${BASE_URL}/api/v1/thesis_data/list?title=${searchName.value}&semester=${searchSemester.value}&page=${page}&limit=${itemsPerPage}`,
    {
      withCredentials: true,
    }
  );
  if (resp.data.error_code === 0) {
    parseThesisList(resp.data.data.items);
    totalItem.value = resp.data.data.total;
  }
};
const parseThesisList = (items: any) => {
  thesisList.value.splice(0);
  for (var thesis of items) {
    let new_item: Thesis = {
      _id: thesis._id.toString(),
      title: thesis.title.toString(),
      semester: thesis.semester.toString(),
      student_name: thesis.student_data.student_name.toString(),
      student_id: thesis.student_data.student_id.toString(),
    };
    thesisList.value.push(new_item);
  }
};

// Search related
const onSearch = async () => {
  await getListData({ page: 1, itemsPerPage: itemsPerPage.value });
};

// open in new tab
const thesisLink = (id: string) => {
  return "/thesis-data/" + id
}

// cluster config
const orderList = ref([
    {name: "Title", id: 0},
    {name: "Category", id: 1},
    {name: "Expected Result", id: 2},
    {name: "Problem Solved", id: 3}
])
const numCluster = ref(5);
const sizeCluster = ref(20);

// history creation data
const historyId = ref("");
const historyDialog = ref(false);

const onCluster = async () => {
  const orderData = []
  for (var item of orderList.value) {
    orderData.push(item.id)
  }
  const body = {
    config: {
      order: orderData,
      number_of_clusters: numCluster.value,
      max_item_each_cluster: sizeCluster.value
    },
    filter: {
      title: searchName.value,
      semester: searchSemester.value
    }
  }
  const resp = await axios.post(
    `${BASE_URL}/api/v1/clustering/start`,
    body,
    {
      withCredentials: true,
    }
  );
  if (resp.data.error_code === 0) {
    historyId.value = resp.data.data._id;
    router.push({ name: "cluster-history-detail", params: {id : resp.data.data._id}})
  }
}

</script>

<template>
  <div style="width: 100%; min-height: 850px; padding:20px;">
    <span class="text-h4">Clustering Form</span>
    <v-container fluid style="border: 1px solid black; margin-top: 20px; margin-bottom: 20px;">
        <v-row>
            <v-col cols="4"><span class="text-h5">Clustering configuration</span></v-col>
        </v-row>
        <v-row>
            <v-col cols="6">
                <p class="text-h6">Change the order depend on the field's importance</p>
                <draggable
                    tag="ul"
                    :list="orderList"
                    class="list-group"
                    item-key="name"
                >
                  <template #item="{ element, index }">
                      <div class="d-flex pt-1 pb-1" style="border: 1px double black; cursor: grab;">
                          <v-icon size="x-large">mdi-swap-vertical</v-icon>
                          <span class="text-h5 ml-3">{{ index + 1 }}</span>
                          <span class="text-h5 ml-3">{{ element.name }} </span>
                      </div>
                  </template>
                </draggable>
            </v-col>
            <v-col cols="6">
                <span class="text-h6">Desirable cluster number</span>
                <v-text-field
                    v-model="numCluster"
                    type="number"
                >
                </v-text-field>
                <span class="text-h6">Max thesis per cluster</span>
                <v-text-field
                    v-model="sizeCluster"
                    type="number"
                >
                </v-text-field>
            </v-col>
        </v-row>
        <v-row>
            <v-col cols="4"><span class="text-h5">Filter thesis to cluster</span></v-col>
        </v-row>
        <v-row>
            <v-col class="d-flex">
                <h3 class="mt-3">Title:</h3>
                &nbsp; &nbsp;
                <v-text-field
                v-model="searchName"
                style="max-width: 400px"
                placeholder="Search by thesis title"
                >
                </v-text-field>
                &nbsp; &nbsp;
                <h3 class="ml-5 mt-3">Semester:</h3>
                &nbsp; &nbsp;
                <v-text-field
                v-model="searchSemester"
                style="max-width: 400px"
                placeholder="20212 or 20221, etc"
                >
                </v-text-field>
                <v-btn
                class="mt-3 ml-5"
                color="blue-darken-3"
                elevation="2"
                @click.stop="onSearch"
                >Filter
                </v-btn>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-list>
                    <v-list-group value="Preview thesis data">
                        <template v-slot:activator="{ props }">
                            <v-list-item
                                v-bind="props"
                                prepend-icon="mdi-eye-outline"
                                title="Preview thesis data"
                            ></v-list-item>
                        </template>
                        <div class="d-flex" style="width: 100%; padding-left: 30px; padding-right: 30px;">
                            <v-data-table-server
                            v-model:items-per-page="itemsPerPage"
                            :headers="thesisHeaders"
                            :items-length="totalItem"
                            :loading="loading"
                            :items="thesisList"
                            item-value="_id"
                            class="elevation-3"
                            @update:options="getListData"
                            >
                            <template v-slot:[`item.action`]="{ index }">
                                <v-btn
                                :href="thesisLink(thesisList[index]._id)"
                                target="_blank"
                                icon
                                color="blue"
                                tooltip="1"
                                ><v-icon>mdi-open-in-new</v-icon></v-btn
                                >
                            </template>
                            </v-data-table-server>
                        </div>
                    </v-list-group>
                </v-list>
            </v-col>
        </v-row>
    </v-container>
    <div class="d-flex justify-end">
        <v-btn
            @click="historyDialog = true"
            color="blue-darken-3"
            elevation="2"
        >Start</v-btn>
    </div>
    <v-dialog
      v-model="historyDialog"
      width="auto"
      style="font-size: 20px"
      persistent
    >
      <v-card class="pa-3">
        <v-card-title class="text-center"> Begin clustering with this config? </v-card-title>
        <v-card-actions>
          <v-btn color="green-darken-3" @click="historyDialog = false"
            ><strong style="font-size: 20px">Cancel</strong></v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="red-darken-3" @click="onCluster"
            ><strong style="font-size: 20px">Begin</strong></v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>