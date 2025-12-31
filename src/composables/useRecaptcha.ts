import { ref } from 'vue'

// 从环境变量读取配置
const VERSION = import.meta.env.VITE_RECAPTCHA_VERSION || 'v3'
const V2_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY
const V3_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY

/**
 * Google reCAPTCHA Composable
 * 支持 v2 (有交互验证框) 和 v3 (后台无感知)
 * 
 * 使用方法:
 * const { version, executeRecaptcha, renderV2 } = useRecaptcha()
 * 
 * // v3: 直接获取 token
 * const token = await executeRecaptcha('login')
 * 
 * // v2: 先渲染验证框，再获取 token
 * await renderV2('recaptcha-container')
 * const token = await executeRecaptcha('login')
 */
export function useRecaptcha() {
    const loaded = ref(false)
    const loading = ref(false)
    const version = VERSION
    const v2WidgetId = ref<number | null>(null)

    /**
     * 加载对应版本的 reCAPTCHA 脚本
     */
    const loadRecaptcha = (): Promise<void> => {
        if (loaded.value) return Promise.resolve()
        if (loading.value) {
            // 如果正在加载，等待加载完成
            return new Promise((resolve) => {
                const checkLoaded = setInterval(() => {
                    if (loaded.value) {
                        clearInterval(checkLoaded)
                        resolve()
                    }
                }, 100)
            })
        }

        loading.value = true

        return new Promise((resolve, reject) => {
            // 检查是否已存在 grecaptcha 对象
            if (window.grecaptcha) {
                loaded.value = true
                loading.value = false
                resolve()
                return
            }

            // 创建并加载脚本
            const script = document.createElement('script')

            // 根据版本加载不同的脚本
            if (version === 'v2') {
                // v2 加载基础脚本 (hl=zh-CN 设置为中文)
                script.src = 'https://www.google.com/recaptcha/api.js?onload=onRecaptchaLoad&render=explicit&hl=zh-CN'
                // 设置全局回调
                window.onRecaptchaLoad = () => {
                    loaded.value = true
                    loading.value = false
                    resolve()
                }
            } else {
                // v3 加载渲染脚本 (hl=zh-CN 设置为中文)
                script.src = `https://www.google.com/recaptcha/api.js?render=${V3_SITE_KEY}&hl=zh-CN`
                script.onload = () => {
                    loaded.value = true
                    loading.value = false
                    resolve()
                }
            }

            script.async = true
            script.defer = true

            script.onerror = (_error) => {
                loading.value = false
                reject(new Error('Failed to load reCAPTCHA script'))
            }

            document.head.appendChild(script)
        })
    }

    /**
   * v2: 渲染验证框到指定容器
   * @param containerId 容器元素 ID
   * @param callback 验证成功后的回调函数
   * @returns Promise<number> Widget ID
   */
    const renderV2 = async (containerId: string, callback?: (token: string) => void): Promise<number> => {
        if (version !== 'v2') {
            throw new Error('renderV2 只能在 v2 模式下使用')
        }

        // 检查 V2 Site Key 是否已配置
        if (!V2_SITE_KEY) {
            const errorMsg = 'reCAPTCHA v2 Site Key 未配置！请在 .env 文件中添加 VITE_RECAPTCHA_V2_SITE_KEY'
            console.error(errorMsg)
            throw new Error(errorMsg)
        }

        await loadRecaptcha()

        return new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
                try {
                    const widgetId = window.grecaptcha.render(containerId, {
                        sitekey: V2_SITE_KEY,
                        theme: 'light',
                        size: 'normal',
                        callback: callback,
                    })
                    // console.log('reCAPTCHA v2 渲染成功, Widget ID:', widgetId)
                    v2WidgetId.value = widgetId
                    resolve(widgetId)
                } catch (error) {
                    // console.error('reCAPTCHA v2 render error:', error)
                    reject(new Error('验证框渲染失败: ' + (error instanceof Error ? error.message : String(error))))
                }
            })
        })
    }

    /**
     * v2: 获取验证响应
     * @param widgetId Widget ID (可选)
     * @returns 验证响应字符串
     */
    const getV2Response = (widgetId?: number): string => {
        if (version !== 'v2') {
            throw new Error('getV2Response 只能在 v2 模式下使用')
        }
        return window.grecaptcha.getResponse(widgetId ?? v2WidgetId.value ?? undefined)
    }

    /**
     * v2: 重置验证
     * @param widgetId Widget ID (可选)
     */
    const resetV2 = (widgetId?: number): void => {
        if (version !== 'v2') {
            return
        }
        window.grecaptcha.reset(widgetId ?? v2WidgetId.value ?? undefined)
    }

    /**
     * v3: 执行验证并获取 token
     * @param action 操作类型，如 'login', 'register' 等
     * @returns Promise<string> reCAPTCHA token
     */
    const executeV3 = async (action: string): Promise<string> => {
        if (version !== 'v3') {
            throw new Error('executeV3 只能在 v3 模式下使用')
        }

        await loadRecaptcha()

        return new Promise((resolve, reject) => {
            window.grecaptcha.ready(() => {
                window.grecaptcha
                    .execute(V3_SITE_KEY, { action })
                    .then(resolve)
                    .catch((error) => {
                        console.error('reCAPTCHA v3 execution error:', error)
                        reject(new Error('验证码执行失败'))
                    })
            })
        })
    }

    /**
     * 统一接口：根据版本执行验证并获取 token
     * @param action 操作类型(v3 使用) 或 留空(v2 使用)
     * @returns Promise<string> reCAPTCHA token
     */
    const executeRecaptcha = async (action: string = 'login'): Promise<string> => {
        try {
            if (version === 'v2') {
                // v2: 检查配置
                if (!V2_SITE_KEY) {
                    throw new Error('reCAPTCHA v2 Site Key 未配置！请在 .env 文件中添加 VITE_RECAPTCHA_V2_SITE_KEY')
                }
                // v2: 获取用户完成验证后的响应
                const response = getV2Response()
                if (!response) {
                    throw new Error('请完成人机验证')
                }
                return response
            } else {
                // v3: 自动执行后台验证
                return await executeV3(action)
            }
        } catch (error) {
            console.error('reCAPTCHA error:', error)
            throw error instanceof Error ? error : new Error('验证码执行失败')
        }
    }

    return {
        version,
        loaded,
        loadRecaptcha,
        // v2 专用方法
        renderV2,
        getV2Response,
        resetV2,
        // v3 专用方法
        executeV3,
        // 统一接口
        executeRecaptcha,
    }
}

// 全局回调声明
declare global {
    interface Window {
        onRecaptchaLoad?: () => void
    }
}
