// utils/DialogService.js
import { createApp, h, ref } from 'vue'
import { ElDialog, ElButton } from 'element-plus'
// ✅ 导入主应用的 appContext
import { appContext } from '@/main'
import ProButton from '@/components/ProButton.vue'
// 通用弹窗组件
const UniversalDialog = {
    props: {
        visible: Boolean,
        title: { type: String, default: '提示' },
        width: { type: String, default: '50%' },
        height: { type: String, default: 'auto' },
        props: { type: Object, default: () => ({}) },
        component: { type: Object, required: true },
        destroyOnClose: { type: Boolean, default: true },
        onConfirm: { type: Function }
    },
    emits: ['update:visible', 'close'],
    setup(props, { emit }) {
        const componentRef = ref() // 👈 用来引用传入的组件（如 Perm.vue）

        const handleClose = () => {
            emit('update:visible', false)
            emit('close')
        }

        return () => (
            <ElDialog
                modelValue={props.visible}
                onUpdate:modelValue={handleClose}
                title={props.title}
                width={props.width}
                destroyOnClose={props.destroyOnClose}
                // ✅ 添加自定义类名，用于控制高度和滚动
                customClass="universal-dialog-custom"
                style={{
                    'height': props.height, 'overflow-y': 'auto'
                }}

                v-slots={{
                    default: () =>
                        props.component && h(props.component, {
                            ...props.props,
                            ref: componentRef 
                        }),
                    footer: () => {
                        // 从 props 中解构 onConfirm（通过 options 传进来）
                        const onConfirm = props.onConfirm

                        if (!onConfirm) {
                            // 没有 onConfirm，只显示关闭按钮
                            return (
                                <ProButton type="primary" onClick={handleClose}>
                                    关闭
                                </ProButton>
                            )
                        }

                        // 如果有 onConfirm，显示“取消”和“确定”按钮
                        return [
                            <ProButton
                                type="default"
                                onClick={handleClose}
                            >
                                取消
                            </ProButton>,
                            <ProButton
                                type="primary"
                                style="margin-left: 8px;"
                                onClick={async () => {

                                    try {
                                        const shouldClose = await onConfirm(componentRef)
                                        // 如果 onConfirm 返回 false，不关闭；否则默认关闭
                                        if (shouldClose !== false) {
                                            handleClose()
                                        }
                                    } catch (err) {
                                        console.error('确认操作失败:', err)
                                        // 可在此提示用户
                                    }
                                }}
                            >
                                确定
                            </ProButton>
                        ]
                    }
                }}
            />
        )
    }
}

/**
 * 显示通用弹窗
 * @param {Component} component - 要渲染的组件
 * @param {Object} options - 配置项
 * @returns {{ close: () => void }}
 */
export const showDialog = (component, options = {}) => {
    const {
        title = '提示',
        width = '50%',
        height = 'auto',
        props = {},
        destroyOnClose = true,
        onClose = () => { },
        onConfirm = null
    } = options

    const visible = ref(true)

    const app = createApp(UniversalDialog, {
        component,
        title,
        width,
        height,
        props,
        destroyOnClose,
        visible: visible.value,
        onConfirm,
        'onUpdate:visible': (v) => {
            visible.value = v
            if (!v) {
                onClose()
                setTimeout(() => {
                    try {
                        app.unmount()
                        const container = app._container
                        if (container && container.parentNode) {
                            container.parentNode.removeChild(container)
                        }
                    } catch (err) {
                        console.warn('Dialog cleanup error:', err)
                    }
                }, 300)
            }
        }
    })

    // ✅ 1. 继承插件
    if (appContext.plugins) {
        appContext.plugins.forEach(({ plugin, options }) => {
            try {
                app.use(plugin, options)
            } catch (err) {
                console.warn('Failed to use plugin:', err)
            }
        })
    }

    // ✅ 2. 继承指令
    if (appContext.directives) {
        Object.entries(appContext.directives).forEach(([name, directive]) => {
            app.directive(name, directive)
        })
    }

    // ✅ 3. 继承组件
    if (appContext.components) {
        Object.entries(appContext.components).forEach(([name, component]) => {
            app.component(name, component)
        })
    }

    // ✅ 4. 其他配置（如 Element Plus 语言包）
    // 如果你有 i18n，也可以在这里继承

    const container = document.createElement('div')
    document.body.appendChild(container)

    try {
        app.mount(container)
    } catch (err) {
        console.error('Dialog mount failed:', err)
        container.parentNode.removeChild(container)
        throw err
    }

    return {
        close: () => {
            visible.value = false
        }
    }
}