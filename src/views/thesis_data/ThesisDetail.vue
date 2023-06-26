<script setup lang="ts">
import axios, { BASE_URL } from "@/plugins/axios";
import { formatStringToLocalDateTime } from "@/helper/utility";
import { ref, onBeforeMount } from "vue";
import { useRoute } from "vue-router";

const route = useRoute()
const thesisData = ref(null as any)

const getThesisData = async() => {
    const id = route.params.id
    const resp = await axios.get(
        `${BASE_URL}/api/v1/thesis_data/${id}`,
        {
        withCredentials: true,
        }
    );
    if (resp.data.error_code === 0) {
        thesisData.value = resp.data.data
    }
}

// before mounted
onBeforeMount(async () => {
    await getThesisData();
});
</script>

<template>
    <div v-if="thesisData" style="width: 100%; min-height: 850px; padding:20px;">
        <v-container fluid>
            <v-row>
                <v-col>
                    <span class="text-h5">THESIS DATA</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <span class="text-h6">Thesis title:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.title }}</span>
                </v-col>
                <v-col>
                    <span class="text-h6">Thesis categories:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.category }}</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <span class="text-h6">Expected result:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.expected_result }}</span>
                </v-col>
                <v-col>
                    <span class="text-h6">Problem solve:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.problem_solve }}</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <span class="text-h6">Semester:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.semester }}</span>
                </v-col>
                <v-col>
                    <span class="text-h6">Created at:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ formatStringToLocalDateTime(thesisData.created_at) }}</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <v-divider/>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <span class="text-h5">STUDENT DATA</span>
                </v-col>
            </v-row>
            <v-row>
                <v-col>
                    <span class="text-h6">Student name:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.student_data.student_name }}</span>
                </v-col>
                <v-col>
                    <span class="text-h6">Student ID:</span>&nbsp; &nbsp;
                    <span style="font-size: 18px;">{{ thesisData.student_data.student_id }}</span>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>