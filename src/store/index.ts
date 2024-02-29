import {createStore} from "vuex";

const store = createStore({
    state() {
        return {
            config: {},
            i18n: {},
            user: {}
        }
    },
    mutations: {
        clearState: (state) => {

        },
        updateConfig: (state, val) => {
            state.config = val
        },
        updateI18N: (state, val) => {
            state.i18n = val
        },
        updateUser: (state, val) => {
            state.user = val
        },
    },
    actions: {
    }
})

export {store}