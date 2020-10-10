// 数据响应式

function defineReact(obj, key, val) {
    // 递归
    observe(val)
    Object.defineProperty(obj, key, {
        get() {
            console.log('get', key)
            return val; //将内部变量暴露给外界，形成了闭包
        },
        set(newVal) {
            console.log('set', key)
            if (newVal !== val) {
                // 如果值是对象，再次对数据做响应式
                observe(newVal)
                val = newVal
            }
        }
    })
}
// 遍历Obj,对所有属性做响应式
function observe(obj) {
    if (typeof obj != 'object' || obj === null) {
        return
    }
    // 遍历obj所有key,做响应式处理
    Object.keys(obj).forEach(key => {
        defineReact(obj, key, obj[key])
    })
}

function set(obj, key, val) {
    defineReact(obj, key, val)
}
const obj = {
    foo: "foo",
    bar: 'bar',
    baz: {
        a: 1
    }
}
observe(obj)
    // obj.foo
    // obj.foo = '0000'
    // obj.bar = 'bbbb'
    // obj.baz.a = 222
    // obj.baz = {
    //     a: 1
    // }
    // obj.baz.a
    // 不可以这样新增属性
    // obj.dong = 'dong'
    // obj.dong
    // 动态新增属性没有进行数据响应，Vue里面用的是set 方法，这里也效仿
    // set(obj, 'dong', 'dong')
    // obj.dong
    // obj.dong = 'ddd'
    //思考题  数组问题