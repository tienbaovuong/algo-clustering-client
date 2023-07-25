<script setup lang="ts">
import axios, { BASE_URL } from '@/plugins/axios'
import { ref, computed, watch } from 'vue'
import type { VDataTableVirtual } from 'vuetify/labs/components'
import { UPLOAD_BATCH_SIZE, UPLOAD_STATUS } from './constants'

const emptyArray: any[] = []
const loading = ref(false)
const showLog = ref(false)
const emit = defineEmits(['on-upload'])

// Data
const files = ref([...emptyArray])
const filesUploadStatus = ref([...emptyArray])
const errorList = ref([...emptyArray])
type Headers = InstanceType<typeof VDataTableVirtual>['headers']
const errorHeader: Headers = [
  {
    title: 'File name',
    key: 'file_name',
    align: 'start'
  },
  {
    title: 'Error',
    key: 'error',
    align: 'start'
  }
]

//Upload function
const uploadThesis = async (file: any, index: number) => {
  let formData = new FormData()
  formData.append('file', file)
  const resp = await axios.post(`${BASE_URL}/api/v1/thesis_data/create`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
  })

  if (resp.data.error_code === 0) {
    filesUploadStatus.value[index] = UPLOAD_STATUS.DONE
  } else {
    filesUploadStatus.value[index] = UPLOAD_STATUS.ERROR
    if (resp.data.error_code === 1) {
      errorList.value.push({
        file_name: file.name,
        error: 'Duplicated'
      })
    } else if (resp.data.error_code === 2) {
      errorList.value.push({
        file_name: file.name,
        error: 'Wrong format/missing data'
      })
    }
  }
}

const uploadAllThesis = async () => {
  loading.value = true
  showLog.value = true
  let numTales = files.value.length
  let batch = []
  for (let i = 0; i < numTales; i++) {
    batch.push(uploadThesis(files.value[i], i))
    if (batch.length >= UPLOAD_BATCH_SIZE) {
      await Promise.all(batch)
      batch = []
    }
  }

  if (batch.length > 0) {
    await Promise.all(batch)
  }
  emit('on-upload')
  loading.value = false
}

//Computed
const disableUpload = computed(() => {
  if (files.value.length == 0) {
    return true
  }
  return false
})
const numSuccess = computed(() => {
  return filesUploadStatus.value.filter((element) => {
    return element == UPLOAD_STATUS.DONE
  }).length
})
const numError = computed(() => {
  return filesUploadStatus.value.filter((element) => {
    return element == UPLOAD_STATUS.ERROR
  }).length
})
const numUploaded = computed(() => {
  return filesUploadStatus.value.filter((element) => {
    return element > 0
  }).length
})

//watch
watch(files, (newFiles) => {
  showLog.value = false
  filesUploadStatus.value = new Array(newFiles.length).fill(UPLOAD_STATUS.WAIT)
  errorList.value = [...emptyArray]
})
</script>
<template>
  <div style="min-width: 800px">
    <v-container>
      <v-row>
        <v-col><h2>Upload files</h2></v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-file-input
            accept=".xlsx"
            label="Pick thesis files"
            filled
            chips
            multiple
            :disabled="loading"
            truncate-length="10"
            prepend-icon="mdi-bookshelf"
            show-size
            v-model="files"
          ></v-file-input>
        </v-col>
      </v-row>
      <v-row v-if="showLog">
        <v-col
          ><h3 style="color: orange">Uploaded: {{ numUploaded }} / {{ files.length }}</h3></v-col
        >
        <v-col
          ><h3 style="color: green">Success: {{ numSuccess }}</h3></v-col
        >
        <v-col
          ><h3 style="color: red">Error: {{ numError }}</h3></v-col
        >
      </v-row>
      <v-row v-if="showLog && errorList.length > 0">
        <v-col>
          <h3>Error list</h3>
          <v-data-table-virtual class="elevation-1" :items="errorList" :headers="errorHeader" height="300"/>
        </v-col>
      </v-row>
      <v-row>
        <v-col class="d-flex justify-end"
          ><v-btn
            color="blue-darken-3"
            elevation="2"
            @click.stop="uploadAllThesis"
            :disabled="loading || disableUpload"
            >Upload
          </v-btn></v-col
        >
      </v-row>
    </v-container>
  </div>
</template>
