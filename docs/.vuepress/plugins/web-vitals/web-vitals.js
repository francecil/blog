import { webVitals } from './util'
export default () => {
    if (!WEB_VITALS_OPTIONS.debug) {
        webVitals(WEB_VITALS_OPTIONS)
    }
}