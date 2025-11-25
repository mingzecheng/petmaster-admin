/**
 * Google reCAPTCHA 类型声明
 * 支持 v2 和 v3
 */

interface Window {
    grecaptcha: {
        ready: (callback: () => void) => void

        // reCAPTCHA v3 方法
        execute: (siteKey: string, options: { action: string }) => Promise<string>

        // reCAPTCHA v2 方法
        render: (
            container: string | HTMLElement,
            parameters: {
                sitekey: string
                callback?: (response: string) => void
                'error-callback'?: () => void
                'expired-callback'?: () => void
                theme?: 'light' | 'dark'
                size?: 'normal' | 'compact' | 'invisible'
            }
        ) => number
        getResponse: (widgetId?: number) => string
        reset: (widgetId?: number) => void
    }
}
