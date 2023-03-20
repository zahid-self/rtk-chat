import { apiSlice } from "../api/apiSlice"

export const conversationsAPI = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getConversations: build.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_LIMIT}`
        })
    })
})

export const { useGetConversationsQuery } = conversationsAPI;