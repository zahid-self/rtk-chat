import { apiSlice } from "../api/apiSlice"
import { messagesAPI } from "../messages/messagesAPI"
import {io} from "socket.io-client"

export const conversationsAPI = apiSlice.injectEndpoints({
    endpoints: (build) => ({
        getConversations: build.query({
            query: (email) => `/conversations?participants_like=${email}&_sort=timestamp&&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_LIMIT}`,
            transformResponse(apiResponse,meta){
                const totalCount = meta.response.headers.get('X-Total-Count');
                return {
                    data: apiResponse,
                    totalCount
                };
            },
            async onCacheEntryAdded(arg,{updateCachedData,cacheDataLoaded, cacheEntryRemoved}){

                const socket = io('http://localhost:9000',{
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttemps: 10,
                    transports: ["websocket"],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false,
                });

                try {
                    await cacheDataLoaded

                    socket.on("conversations",(body) => {
                        updateCachedData((draft) => {
                            const conversation = draft.find((c) => c.id == body?.body?.id);
                            
                            if(conversation?.id){
                                conversation.message = body?.body?.message;
                                conversation.timestamp = body?.body?.timestamp;
                            }
                        })
                    })


                } catch (error) {}

                await cacheEntryRemoved
                socket.close()
                
            }
        }),
        getMoreConversations: build.query({
            query: ({email,page}) => `/conversations?participants_like=${email}&_sort=timestamp&&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATIONS_LIMIT}`,
            async onQueryStarted({email},{queryFulfilled,dispatch}){
           
                //entry to the message table
                try {
                    const conversations = await queryFulfilled;

                    if(conversations?.data?.length){

                        //update conversations cache passimystically
                        dispatch(
                            apiSlice.util.updateQueryData('getConversations',email,(draft) => {
                                return {
                                    data: [...draft.data,...conversations.data],
                                    totalCount: draft.totalCount
                                }
                            })
                        )

                    }
                } catch (error) {}
            }
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

                //optimistic cache update
                const addConversationCacheUpdate = dispatch(

                    apiSlice.util.updateQueryData('getConversations',arg?.sender,(draft) => {
                        draft.data.push(arg?.data)
                    })
                )

                try {
                    //entry message table
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
                } catch (error) {
                    addConversationCacheUpdate.undo()
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

                //optimistic cache update
                const updateConversationCacheUpdate = dispatch(
                    apiSlice.util.updateQueryData('getConversations',arg?.sender,(draft) => {
                        const draftConversation = draft.data.find(c => c.id == arg?.id);
                        draftConversation.message = arg.data.message
                        draftConversation.timestamp = arg.data.timestamp
                    })
                )

                //entry to the message table
                try {
                    const conversation = await queryFulfilled;

                    if(conversation?.data?.id){
                        const senderUser = arg?.data?.users.find(user => user.email === arg?.sender);
                        const receiverUser = arg?.data?.users.find(user => user.email !== arg?.sender);

                        const res = await dispatch(messagesAPI.endpoints.addMessage.initiate({
                            conversationId: conversation?.data?.id,
                            sender: senderUser,
                            receiver: receiverUser,
                            message: arg?.data?.message,
                            timestamp: arg?.data?.timestamp
                        })).unwrap()

                        //update cache passimystically
                        dispatch(
                            apiSlice.util.updateQueryData('getMessages',res?.conversationId.toString(),(draft) => {
                                draft.push(res)
                            })
                        )

                    }
                } catch (error) {
                    updateConversationCacheUpdate.undo()
                }
            }
        })
    })
})

export const { useGetConversationsQuery,useGetConversationQuery,useAddConversationMutation,useUpdateConversationMutation } = conversationsAPI;