import { apiSlice } from "../api/apiSlice";
import { userLoggedIn } from "./authSlice";


const authAPI = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        register: build.mutation({
            query: (data) => ({
                url: '/register',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                try {
                    const result = await queryFulfilled;
                    localStorage.setItem('auth',JSON.stringify({
                        accessToken : result.data.accessToken,
                        user: result.data.user
                    }))

                    dispatch(userLoggedIn({
                        accessToken : result.data.accessToken,
                        user: result.data.user
                    }))
                } catch (error) {
                    //nothing do here
                }
            }
        }),
        login: build.mutation({
            query: (data) => ({
                url: '/login',
                method: 'POST',
                body: data
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                try {
                    const result = await queryFulfilled;
                    localStorage.setItem('auth',JSON.stringify({
                        accessToken : result.data.accessToken,
                        user: result.data.user
                    }))

                    dispatch(userLoggedIn({
                        accessToken : result.data.accessToken,
                        user: result.data.user
                    }))
                } catch (error) {
                    //nothing do here
                }
            }
        })
    })
})

export const { useLoginMutation, useRegisterMutation } = authAPI;