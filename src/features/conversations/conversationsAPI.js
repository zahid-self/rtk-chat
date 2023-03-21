import { apiSlice } from "../api/apiSlice"
import { messagesAPI } from "../messages/messagesAPI"

export const conversationsAPI = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getConversations: build.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_LIMIT}`
        }),
        getConversation: build.query({
            query: ({email,participantEmail}) => `/conversations?participants_like=${email}-${participantEmail}&&participants_like=${participantEmail}-${email}&_limit=1`
        }),
        addConversation: build.mutation({
            query:({ sender, data}) => ({
                url: `/conversations`,
                method: 'POST',
                body: data
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){
                const conversation = await queryFulfilled;
                if(conversation?.data?.id){

                    const senderUser = arg?.data?.users.find(user => user.email === arg?.sender);
                    const receiverUser = arg?.data?.users.find(user => user.email !== arg?.sender);

                    dispatch(messagesAPI.endpoints.addMessage.initiate({
                        conversationId: conversation?.data?.id,
                        sender: senderUser,
                        receiver: receiverUser,
                        message: arg?.data?.message,
                        timestamp: arg?.data?.timestamp
                    }))
                }
            }
        }),
        updateConversation: build.mutation({
            query:({id,sender,data}) => ({
                url: `/conversations/${id}`,
                method: 'PATCH',
                body: data
            }),
            async onQueryStarted(arg,{queryFulfilled,dispatch}){

                const conversation = await queryFulfilled;
                if(conversation?.data?.id){
                    const senderUser = arg?.data?.users.find(user => user.email === arg?.sender);
                    const receiverUser = arg?.data?.users.find(user => user.email !== arg?.sender);
                    dispatch(messagesAPI.endpoints.addMessage.initiate({
                        conversationId: conversation?.data?.id,
                        sender: senderUser,
                        receiver: receiverUser,
                        message: arg?.data?.message,
                        timestamp: arg?.data?.timestamp
                    }))
                }
            }
        })
    })
})

export const { useGetConversationsQuery,useGetConversationQuery,useAddConversationMutation,useUpdateConversationMutation } = conversationsAPI;