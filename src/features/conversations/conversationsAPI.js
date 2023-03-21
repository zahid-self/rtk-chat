import { apiSlice } from "../api/apiSlice"

export const conversationsAPI = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getConversations: build.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_LIMIT}`
        }),
        getConversation: build.query({
            query: ({email,participantEmail}) => `/conversations?participants_like=${email}-${participantEmail}&&participants_like=${participantEmail}-${email}&_limit=1`
        }),
        addConversation: build.mutation({
            query:(data) => ({
                url: `/conversations`,
                method: 'POST',
                body: data
            })
        }),
        updateConversation: build.mutation({
            query:({id,data}) => ({
                url: `/conversations/${id}`,
                method: 'PATCH',
                body: data
            })
        })
    })
})

export const { useGetConversationsQuery,useGetConversationQuery,useAddConversationMutation,useUpdateConversationMutation } = conversationsAPI;