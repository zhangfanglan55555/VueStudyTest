import Vue from 'vue'
// import Router from './kvue-router'
import Router from './krouter'
import HelloWorld from '@/components/HelloWorld'
import About from '@/components/About'
Vue.use(Router)

const routes = [{
        path: '/',
        name: 'HelloWorld',
        component: HelloWorld
    },
    {
        path: '/about',
        component: About,
        children: [{
            path: '/about/info',
            component: { render(h) { return h('div', 'info page') } }
        }]
    }
]

export default new Router({
    mode: 'hash',
    base: process.env.BASE_URL,
    routes
})