import { webVitals } from './util'
export default () => {
    if (typeof document !== 'undefined' && !WEB_VITALS_OPTIONS.debug) {
        webVitals(WEB_VITALS_OPTIONS)
    }
}