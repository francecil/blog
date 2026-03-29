import { inject } from '@vercel/analytics'
export default () => {
    if (typeof document !== 'undefined') {
        inject()
    }
}