// import Blank from "./Blank";
import ChatHead from "./ChatHead";
import Messages from "./Messages";
import Options from "./Options";
import { useGetMessagesQuery } from "../../../features/messages/messagesAPI"
import { useParams } from "react-router-dom";
import Error from "../../ui/Error";

export default function ChatBody() {

    const{id} = useParams()
    const{ data : messages, isLoading,isError, error } = useGetMessagesQuery(id);

    let content = null;

    if(isLoading){
        content = <div>Loading...</div>
    }else if(!isLoading && isError){
        content = <Error message={error?.data}/>
    }else if (!isLoading && !isError && messages.length === 0) {
        content = <div className="relative flex items-center p-3 border-b border-gray-300">No messages found!</div>
    }else if (!isLoading && !isError && messages.length > 0) {
        content = <>
                    <ChatHead message={messages[0]}/>
                    <Messages messages={messages}/>
                    <Options />
                    {/* <Blank /> */}
                </>
    }

    return (
        <div className="w-full lg:col-span-2 lg:block">
            <div className="w-full grid conversation-row-grid">
                {content}
            </div>
        </div>
    );
}
