let Vue;
class VueRouter {
    constructor(options) {
        this.$options = options;
        this.routeMap = {}; //缓存route 和 path 的映射关系
        this.$options.routes.forEach(route => {
            this.routeMap[route.path] = route
        })
        const initial = window.location.hash.slice(1) || '/';
        //实现current 响应式，发生变化更新所有引用current的渲染
        Vue.util.defineReactive(this, 'current', initial)
            //监听hash变化
        window.addEventListener('hashchange', () => {
            //使用箭头函数，this指向不变
            this.current = window.location.hash.slice(1)
        })
        window.addEventListener('load', () => {
            this.current = window.location.hash.slice(1)
        })
    }
}
VueRouter.install = function(_Vue) {
    Vue = _Vue;
    //使用混入 延迟执行到router创建完毕才执行
    Vue.mixin({
        //每个vue组件实例化都会执行一遍
        beforeCreate() {
            if (this.$options.router) {
                //只有main.js 根组件实例化时才会有router选项
                Vue.prototype.$router = this.$options.router
            }
        }
    })
    Vue.component('router-link', {
        props: {
            to: {
                type: String,
                required: true
            }
        },
        render(h) {
            return h('a', { attrs: { href: '#' + this.to } }, this.$slots.default)
        }
    })
    Vue.component('router-view', {

        render(h) {
            let { routeMap, current } = this.$router;
            let component = routeMap[current] ? routeMap[current].component : null;
            return h(component)
        }
    })
}
export default VueRouter