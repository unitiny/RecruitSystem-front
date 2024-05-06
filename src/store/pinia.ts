import {defineStore} from "pinia";

export const useGlobalStore = defineStore('main', {
    state: () => ({
        user: {},
    }),
    persist: true,
    actions: {
        updateUser(user) {
            this.user = user
        }
    },
})
