/**
 * Vue插件：
 *  function 
 *  要求必须有一个install方法，将来会被Vue.use调用
 */
let Vue; //保存Vue构造函数，插件中要使用
class VueRouter {
    constructor(options) {
        this.$options = options
            // 缓存path和route 映射关系
        this.routeMap = {}
        this.$options.routes.forEach(route => {
                this.routeMap[route.path] = route
            })
            // 响应式数据！，发生变化会自动更新
        const initial = window.location.hash.slice('1') || '/'
        Vue.util.defineReactive(this, 'current', initial)
        window.addEventListener('hash', () => {
            this.current = window.location.hash.slice(1)
        })
        window.addEventListener('hashchange', () => {
            this.current = window.location.hash.slice(1)
        })
    }

}
VueRouter.install = function(_Vue) {
    Vue = _Vue;

    // 1.挂载$router属性
    // this.$router.push()
    // 全局混入 目的：延迟下面逻辑到router创建完毕并且附加到选项上时才执行
    Vue.mixin({
            beforeCreate() {
                // 此钩子在每个组件创建实例时都会调用
                // 判断是不是根实例
                if (this.$options.router) {
                    Vue.prototype.$router = this.$options.router
                }
            }
        })
        // 2.注册实现 router-link & router-view
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
            // 标记当前router-view深度
            this.$vnode.data.routerView = true;
            let depth = 0;
            let parent = this.$parent;
            while (parent) {

                parent = this.$parent
            }
            // 获取当前路由所对应的组件
            const { routeMap, current } = this.$router
            let component = routeMap[current] ? routeMap[current].component : null;
            // const route = this.$router.$options.routes.find(route => route.path == this.$router.current)
            // if (route) component = route.component
            return h(component)
        }
    })
}
export default VueRouter