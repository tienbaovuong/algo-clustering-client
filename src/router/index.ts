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
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue')
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
router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('token');

  // trying to access a restricted page + not logged in
  // redirect to login page
  if (authRequired && !loggedIn) {
    next('/login');
  } else {
    next();
  }
});

export default router
