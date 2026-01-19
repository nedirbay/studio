import { createRouter, createWebHashHistory } from "vue-router";
import SidebarLayout from "../components/SidebarLayout.vue";
import Dashboard from "../views/Dashboard.vue";
import Clients from "../views/Clients.vue";
import Calendar from "../views/Calendar.vue";
import Production from "../views/Production.vue";
import Inventory from "../views/Inventory.vue";
import Finance from "../views/Finance.vue";
import Team from "../views/Team.vue";

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
        component: Calendar,
      },
      {
        path: "production",
        name: "Production",
        component: Production,
      },
      {
        path: "inventory",
        name: "Inventory",
        component: Inventory,
      },
      {
        path: "finance",
        name: "Finance",
        component: Finance,
      },
      {
        path: "team",
        name: "Team",
        component: Team,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
