import { useDispatch, useSelector } from "react-redux";
import { conversationsAPI, useGetConversationsQuery } from "../../features/conversations/conversationsAPI";
import ChatItem from "./ChatItem";
import Error from "../ui/Error"
import moment from 'moment';
import { getPartnerInfo } from "../../utils/getPartnerInfo";
import gravatar from "gravatar"
import { Link } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { useEffect, useState } from "react";

export default function ChatItems() {

    const{user} = useSelector(state => state.auth) || {};
    const{email} = user || {}
    const{data,isLoading,isError,error} = useGetConversationsQuery(email) || {};
    const {data: conversations, totalCount} = data || {}
    const[page,setPage] = useState(1);
    const[hasMore,setHarMore] = useState(true);
    const dispatch = useDispatch()

    const fetchNext = () => {
        setPage(prevPage => prevPage + 1)
    }

    useEffect(() => {
        if (page > 1) {
            dispatch(conversationsAPI.endpoints.getMoreConversations.initiate({email,page}))
        }
    },[page,dispatch,email])

    useEffect(() => {
        if(totalCount > 0){
            const more = Math.ceil(totalCount / Number(process.env.REACT_APP_CONVERSATIONS_LIMIT)) > page
            setHarMore(more)
        }
    },[totalCount,page])



    //decide what to render
    let content = null;

    if (isLoading) {
        content = <li className="text-center">Loading...</li>
    } else if(!isLoading && isError) {
        content = <Error message={error?.data}/>
    }else if(!isLoading && !isError && conversations.length === 0) {
        content = <li className="text-center">No conversation found!</li>
    }else if(!isLoading && !isError && conversations.length > 0) {
        content = 
                <InfiniteScroll
                    dataLength={conversations.length} //This is important field to render the next data
                    next={fetchNext}
                    hasMore={hasMore}
                    loader={<h4>Loading...</h4>}
                    height={window.innerHeight - 129}
                >
                {
                conversations.map((conversation) => {
                    const partner = getPartnerInfo(conversation.users,email);
                    const{name,email: partnerEmail} = partner || {}
                    const{id,message,timestamp} = conversation;
        
                    return(
                        <li key={conversation.id}>
                            <Link to={`/inbox/${id}`}>
                                <ChatItem
                                    avatar={gravatar.url(partnerEmail, {
                                        size: 80
                                    })}
                                    name={name}
                                    lastMessage={message}
                                    lastTime={moment(timestamp).fromNow()}
                                />
                            </Link>
                        </li>
                    )
                })
            }
        </InfiniteScroll>
    }


    return (
        <ul>{content}</ul>
    );
}
