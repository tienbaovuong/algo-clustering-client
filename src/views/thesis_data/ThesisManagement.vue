<script setup lang="ts">
import axios, { BASE_URL } from "@/plugins/axios";
import { ref } from "vue";
import type { VDataTableServer } from "vuetify/labs/components";
import UploadThesis from "@/components/thesis/UploadThesis.vue"

interface Thesis {
  _id: string;
  semester: string;
  title: string;
  student_name: string;
  student_id: string;
}
const TemplateArray: Thesis[] = [];
const drawer = ref(false);

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

// upload
const onUpload = async () => {
  await getListData({ page: 1, itemsPerPage: itemsPerPage.value });
}

//delete dialog
const deleteDialog = ref(false);
const deleteId = ref("0");
const deleteName = ref("No thesis");
const onDelete = async () => {
  deleteDialog.value = false;
  await axios.delete(
    `${BASE_URL}/api/v1/thesis_data/${deleteId.value}`,
    {
      withCredentials: true,
    }
  );
  await getListData({ page: 1, itemsPerPage: itemsPerPage.value });
};
</script>

<template>
  <div style="width: 100%; min-height: 850px;">
    <v-container fluid>
      <v-row>
        <v-col cols="4"><span class="text-h5">Thesis List</span></v-col>
        <v-col class="d-flex align-center justify-end" cols="8">
          <v-btn
            color="blue-darken-3"
            elevation="2"
            @click.stop="drawer = !drawer"
            >Upload
          </v-btn>
        </v-col>
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
              placeholder="2022.1 or 2022.2, etc"
            >
            </v-text-field>
            <v-btn
              class="mt-3 ml-5"
              color="blue-darken-3"
              elevation="2"
              @click.stop="onSearch"
              >Search
            </v-btn>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <div class="d-flex" style="width: 100%">
            <v-data-table-server
              v-model:items-per-page="itemsPerPage"
              :headers="thesisHeaders"
              :items-length="totalItem"
              :loading="loading"
              :items="thesisList"
              item-value="_id"
              class="elevation-1"
              @update:options="getListData"
            >
              <template v-slot:[`item.action`]="{ index }">
                <v-btn
                  :to="{
                    name: 'thesis-detail',
                    params: { id: thesisList[index]._id },
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
                    deleteDialog = true;
                    deleteId = thesisList[index]._id;
                    deleteName = thesisList[index].title;
                  "
                  ><v-icon>mdi-delete</v-icon></v-btn
                >
              </template>
            </v-data-table-server>
          </div>
        </v-col>
      </v-row>
    </v-container>
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      width="800px"
    >
      <v-list>
        <UploadThesis @on-upload="onUpload" />
      </v-list>
    </v-navigation-drawer>
    <v-dialog
      v-model="deleteDialog"
      width="auto"
      style="font-size: 20px"
      persistent
    >
      <v-card class="pa-3">
        <v-card-title class="text-center"> Are you sure about this? </v-card-title>
        <v-card-text class="text-center" style="width: 500px; word-wrap: break-word;"> Deleting <span class="font-weight-bold">{{ deleteName }}</span> </v-card-text>
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