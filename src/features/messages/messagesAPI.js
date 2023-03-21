import {apiSlice} from "../api/apiSlice"

export const messagesAPI = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getMessages: build.query({
            query: (id) => `/messages?conversationId_like=${id}&_sort=timestamp&_page=1&_limit=${process.env.REACT_APP_MESSAGES_LIMIT}`
        })
    })
})

export const { useGetMessagesQuery } = messagesAPI