import { createRouter, createWebHashHistory } from 'vue-router'
import ProjectsView from '../views/ProjectsView.vue'
import BoardView from '../views/BoardView.vue'

const routes = [
  {
    path: '/',
    name: 'Projects',
    component: ProjectsView
  },
  {
    path: '/board/:projectId',
    name: 'Board',
    component: BoardView,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(), // Electron works best with HashHistory or WebHistory if configured right, but Hash is safest.
  routes
})

export default router
