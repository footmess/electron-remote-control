import Vue from "vue";
import VueRouter from "vue-router";
import Puppet from "../views/Puppet.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/puppet",
    name: "Puppet",
    component: Puppet
  },
  {
    path: "/control",
    name: "Control",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "control" */ "../views/Control.vue")
  }
];

const router = new VueRouter({
  mode: "history",
  routes
});

export default router;
