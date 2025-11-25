import { ref } from 'vue'

const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

/**
 * Google reCAPTCHA v3 Composable
 * 
 * 使用方法:
 * const { executeRecaptcha } = useRecaptcha()
 * const token = await executeRecaptcha('login')
 */
export function useRecaptcha() {
    const loaded = ref(false)
    const loading = ref(false)

    /**
     * 加载 reCAPTCHA 脚本
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
            script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
            script.async = true
            script.defer = true

            script.onload = () => {
                loaded.value = true
                loading.value = false
                resolve()
            }

            script.onerror = (_error) => {
                loading.value = false
                reject(new Error('Failed to load reCAPTCHA script'))
            }

            document.head.appendChild(script)
        })
    }

    /**
     * 执行 reCAPTCHA 验证并获取 token
     * @param action 操作类型，如 'login', 'register' 等
     * @returns Promise<string> reCAPTCHA token
     */
    const executeRecaptcha = async (action: string): Promise<string> => {
        try {
            await loadRecaptcha()

            return new Promise((resolve, reject) => {
                window.grecaptcha.ready(() => {
                    window.grecaptcha
                        .execute(SITE_KEY, { action })
                        .then(resolve)
                        .catch((error) => {
                            console.error('reCAPTCHA execution error:', error)
                            reject(new Error('验证码执行失败'))
                        })
                })
            })
        } catch (error) {
            console.error('reCAPTCHA error:', error)
            throw new Error('验证码加载失败，请刷新页面重试')
        }
    }

    return {
        loaded,
        loadRecaptcha,
        executeRecaptcha,
    }
}
