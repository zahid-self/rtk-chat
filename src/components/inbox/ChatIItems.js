import { useSelector } from "react-redux";
import { useGetConversationsQuery } from "../../features/conversations/conversationsAPI";
import ChatItem from "./ChatItem";
import Error from "../ui/Error"
import moment from 'moment';
import { getPartnerInfo } from "../../utils/getPartnerInfo";
import gravatar from "gravatar"
import { Link } from "react-router-dom";

export default function ChatItems() {

    const{user} = useSelector(state => state.auth) || {};
    const{email} = user || {}
    const{data : conversations,isLoading,isError,error} = useGetConversationsQuery(email);


    //decide what to render
    let content = null;

    if (isLoading) {
        content = <li className="text-center">Loading...</li>
    } else if(!isLoading && isError) {
        content = <Error message={error?.data}/>
    }else if(!isLoading && !isError && conversations.length === 0) {
        content = <li className="text-center">No conversation found!</li>
    }else if(!isLoading && !isError && conversations.length > 0) {
        content = conversations.map((conversation) => {

            const partner = getPartnerInfo(conversation.users,email);
            const{name,email: partnerEmail} = partner || {}
            const{id,message,timestamp} = conversation;

            return(
                <li key={conversation.id}>
                    <Link to={`/inbox/${id}`}>
                        <ChatItem
                            key={id}
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


    return (
        <ul>{content}</ul>
    );
}
