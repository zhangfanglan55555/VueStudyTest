// KVue
/**
 * 1.对data 选项做响应式处理
 * 2.编译模板
 *  冬瓜冬瓜我是西瓜
 */
class KVue {
    constructor(options) {
        this.$options = options; //接收参数
        this.$data = options.data;
        this.$methods = options.methods
        // 数据响应式处理
        observe(this.$data)

        // 代理
        proxy(this)

        // 编译
        new Compile(options.el, this)

    }
}

function proxy(vm) {
    Object.keys(vm.$data).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm.$data[key]
            },
            set(v) {
                vm.$data[key] = v;
            }
        })
    })



}
function defineReact(obj, key, val) {
    observe(val)

    // 创建Dep实例
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get() {
            Dep.target && dep.addDep(Dep.target)
            return val;
        },
        set(newVal) {
            if (newVal !== val) {
                observe(newVal)
                val = newVal;
                dep.notify()
            }
        }
    })
}

function observe(obj) {
    if (typeof obj != 'object' || obj === null) return;
    new Observer(obj)

}
// 根据传入value的类型做相应的响应式处理
class Observer {
    constructor(value) {
        this.value = value;
        if (Array.isArray(value)) {

        } else {
            // 对象
            this.walk(value)
        }
    }
    // 对象响应式处理
    walk(obj) {
        Object.keys(obj).forEach(key => defineReact(obj, key, obj[key]))
    }
}

//  解析模板
/**
 * 1.处理插值
 * 2.处理指令和时间
 * 3.以上两者初始化和更新
 */
class Compile {
    constructor(el, vm) {
        this.$vm = vm;
        this.$el = document.querySelector(el);
        this.$methods = vm.$methods
        if (this.$el) {
            this.compile(this.$el)
        }
    }
    compile(el) {
        // 当前节点
        // 遍历el的子节点，判断类型做相应的处理
        const childNodes = el.childNodes;
        childNodes.forEach(node => {
            if (node.nodeType === 1) {
                // 元素
                // console.log('元素')
                // 处理指令和事件
                // 拿到所有特性
                const attrs = node.attributes;
                Array.from(attrs).forEach(attr => {
                    //k-xxx = 'abc',要拿出 xxx 和 abc 部分，abc部分是表达式
                    const { name: attrName, value: exp } = attr;
                    if (attrName.startsWith('k-')) {
                        const dir = attrName.substring(2);
                        this[dir] && this[dir](node, exp);
                    }
                    if (/\@.?/.test(attrName)) {
                        const dir = attrName.substring(1);
                        // dir : click exp : clickFn
                        this[dir] && this[dir](node, exp)
                    }
                })
            } else if (this.isInter(node)) {
                // 文本
                console.log('插值')
                this.compileText(node)
            }
            if (node.childNodes) {
                this.compile(node)
            }
        })
    }

    update(node, exp, dir) {
        // 1.初始化
        const fn = this[dir + 'Updater']
        fn && fn(node, this.$vm[exp])
        // 2.更新
        new Watcher(this.$vm, exp, function (val) {
            fn && fn(node, val)
        })
    }
    model(node, exp) {
        this.update(node, exp, 'model')
        this.input(node, exp)
    }
    input(node, exp) {
        node.oninput = function (e) {
            this.$vm[exp] = e.target.value
        }.bind(this)
    }
    modelUpdater(node, value) {
        node.value = value
    }
    click(node, fn) {
        node.onclick = this.$methods[fn].bind(this.$vm)
    }
    text(node, exp) {
        this.update(node, exp, 'text')
    }
    textUpdater(node, value) {
        node.textContent = value
    }
    html(node, exp) {
        this.update(node, exp, 'html')
    }
    htmlUpdater(node, value) {
        node.innerHTML = value
    }
    compileText(node) {
        // 编译文本
        // node.textContent = this.$vm[RegExp.$1];
        this.update(node, RegExp.$1, 'text')
    }
    isInter(node) {
        // 是否插值表达式
        return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent);
        // . 匹配除换行符 \n 之外的任何单字
        // * 匹配前面的子表达式零次或多次。要匹配 * 字符，请使用 \*。
    }
}
// 监听器：负责依赖更新
class Watcher {
    constructor(vm, key, updateFn) {
        this.vm = vm;
        this.key = key;
        this.updateFn = updateFn;

        // 触发依赖收集
        Dep.target = this;
        this.vm[key]; // 触发上面的get
        Dep.target = null;
    }

    // 未来被Dep调用
    update() {
        //执行实际的更新操作
        this.updateFn.call(this.vm, this.vm[this.key])
    }
}

class Dep {
    constructor() {
        this.deps = []
    }
    addDep(dep) {
        this.deps.push(dep)
    }
    notify() {
        this.deps.forEach(dep => dep.update())
    }
}