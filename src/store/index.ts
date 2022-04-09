import { defineStore } from 'pinia'

export const useCountStore = defineStore('count',{
    state: ()=>({  
        count: 0
    }),
    mutations: {
        increment(state) {
            state.count++
        }
    }
})
