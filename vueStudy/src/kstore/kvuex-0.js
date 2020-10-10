let Vue;
class Store {
    constructor(options) {
        // 暗号：天王盖地虎
        // data响应式处理
        // this.$store.state.xx 访问
        this._vm = new Vue({
            data: {
                $$state: options.state
            },

        })

        this._mutations = options.mutations;
        this._actions = options.actions;
        this._getters = options.getters
        this.commit = this.commit.bind(this)
        this.dispatch = this.dispatch.bind(this)

        this._wrappedGetters = options.getters;
        const computed = Object.create(null)
        const store = this;
        this.getters = Object.create(null);
        this.forEachValue(this._wrappedGetters, (fn, key) => {
            computed[key] = () => fn(store.state)
            Object.defineProperty(store.getters, key, {
                get: () => store._vm[key],
                enumerable: true
            })
        })
        this._vm = new Vue({
            data: {
                $$state: options.state
            },
            computed
        })
    }
    forEachValue(obj, fn) {
        Object.keys(obj).forEach(key => fn(obj[key], key))
    }
    get state() {
        return this._vm._data.$$state
            // _data 可以直接访问到data
    }
    set state(v) {
        console.error('place use replaceState to reset state')

    }
    commit(type, payload) {
        const entry = this._mutations[type]
        if (!entry) {
            console.error('unknow mutation type')
            return
        }
        entry(this.state, payload)
    }
    dispatch(type, payload) {
        const entry = this._actions[type]
        if (!entry) {
            console.error('unknow actions type')
            return
        }
        entry(this, payload)
    }

}

function install(_Vue) {
    Vue = _Vue
    Vue.mixin({
        beforeCreate() {
            if (this.$options.store) {
                Vue.prototype.$store = this.$options.store
            }
        },
    })
}

export default { Store, install }