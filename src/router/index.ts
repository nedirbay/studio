import { createRouter, createWebHashHistory } from "vue-router";
import SidebarLayout from "../components/SidebarLayout.vue";
import Dashboard from "../views/Dashboard.vue";
import Clients from "../views/Clients.vue";

// Placeholders for future views
const Placeholder = {
  template: '<div style="padding: 20px;"><h2>Coming Soon</h2></div>',
};

const routes = [
  {
    path: "/",
    component: SidebarLayout,
    children: [
      {
        path: "",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "clients",
        name: "Clients",
        component: Clients,
      },
      {
        path: "calendar",
        name: "Calendar",
        component: Placeholder,
      },
      {
        path: "production",
        name: "Production",
        component: Placeholder,
      },
      {
        path: "inventory",
        name: "Inventory",
        component: Placeholder,
      },
      {
        path: "finance",
        name: "Finance",
        component: Placeholder,
      },
      {
        path: "team",
        name: "Team",
        component: Placeholder,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
