import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/thesis-data',
      name: 'thesis-management',
      meta: {
        description: 'THESIS LIST'
      },
      component: () => import('@/views/thesis_data/ThesisManagement.vue')
    },
    {
      path: '/thesis-data/:id',
      name: 'thesis-detail',
      meta: {
        description: 'THESIS DETAIL'
      },
      component: () => import('@/views/thesis_data/ThesisDetail.vue')
    },
    {
      path: '/clustering',
      name: 'clustering',
      meta: {
        description: 'CLUSTERING'
      },
      component: () => import('@/views/clustering/ClusteringInit.vue')
    },
    {
      path: '/history',
      name: 'cluster-history-management',
      meta: {
        description: 'HISTORY LIST'
      },
      component: () => import('@/views/cluster_history/HistoryManagement.vue')
    },
    {
      path: '/history/:id',
      name: 'cluster-history-detail',
      meta: {
        description: 'HISTORY DETAIL'
      },
      component: () => import('@/views/cluster_history/HistoryDetail.vue')
    },
  ]
})

export default router
