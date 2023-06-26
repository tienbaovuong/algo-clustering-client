<script setup lang="ts">
import { ref, onMounted } from "vue";

interface ThesisData {
    thesis_id: String
    student_id: String
    thesis_title: String
    student_name: String
}
const props = defineProps<{
    data: ThesisData,
    hover_mode: boolean
}>()
const thesisLink = (id: String) => {
  return "/thesis-data/" + id
}
</script>
<template>
    <div ref="box">
        <v-menu :open-on-hover="hover_mode" location="top" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
                <v-card
                    :class="hover_mode? 'hoverColor': ''"
                    v-bind="props"
                    min-height="110px" 
                    style="border-radius: 20px; border: 1px solid green;">
                    <v-card-title>{{ data.student_name }}
                    </v-card-title>
                    <v-card-text>
                        <span v-if="data.thesis_title.length<70">{{ data.thesis_title }}</span>
                        <span v-else>{{ data.thesis_title.substring(0,67) + "..." }}</span>
                    </v-card-text>
                </v-card>
            </template>
            <v-card
                max-width="420px"
                style="border-radius: 10px;"
            >
                <v-card-title>
                    <span>{{ data.student_name }} - {{ data.student_id }}</span>
                    <v-btn
                        :href="thesisLink(data.thesis_id)"
                        target="_blank"
                        variant="plain"
                    >
                        <v-icon
                            color="blue"
                            tooltip="1"
                        >mdi-open-in-new</v-icon>
                    </v-btn>
                </v-card-title>
                <v-card-text>
                    <span>{{ data.thesis_title }}</span>
                </v-card-text>
            </v-card>
        </v-menu>
    </div>
</template>
<style scoped>
.hoverColor:hover{
    background-color: rgb(94, 94, 243);
}
</style>