import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { conversationsAPI, useAddConversationMutation, useUpdateConversationMutation } from "../../features/conversations/conversationsAPI";
import { useGetUserQuery } from "../../features/usersApi/usresApi";
import isValidEmail from "../../utils/isValidEmail";
import Error from "../ui/Error";

export default function Modal({ open, control }) {

    const[to,setTo] = useState('');
    const[message,setMessage] = useState('');
    const[userCheck,setUserCheck] = useState(false)
    const{data : perticipant,isLoading,error} = useGetUserQuery(to,{
        skip: !userCheck
    });
    const{user : loggedinUser} = useSelector(state => state.auth) || {};
    const{email : myEmail} = loggedinUser || {};
    const dispatch = useDispatch();
    const[conversation,setConversation] = useState(undefined);


    const[addConversation,{isSuccess: isAddConversationSuccess}] = useAddConversationMutation();
    const[updateConversation, {isSuccess: isUpdateConversationSuccess}] = useUpdateConversationMutation();

    useEffect(() => {
        if(isAddConversationSuccess || isUpdateConversationSuccess){
            control()
        }
    },[isAddConversationSuccess, isUpdateConversationSuccess])

    useEffect(() => {
        if(perticipant?.length > 0 && perticipant[0]?.email !== myEmail){
            dispatch(conversationsAPI.endpoints.getConversation.initiate({email : myEmail,participantEmail: to}))
            .unwrap()
            .then((data) => {
                setConversation(data)
            })
        }
    },[perticipant,dispatch,myEmail,to]);


    const handleDebounc = (fn,delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(() => {
                fn(...args)
            }, delay);
        }
    }

    const doSearch = (value) => {
        if(isValidEmail(value)){
            setUserCheck(true)
            setTo(value)
        }
    }

    const handleTo = handleDebounc(doSearch,500);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(conversation.length > 0){
            updateConversation({
                id: conversation[0]?.id,
                sender: myEmail,
                data: {
                    participants: `${myEmail}-${perticipant[0].email}`,
                    users: [loggedinUser,perticipant[0]],
                    message,
                    timestamp: new Date().getTime()
                }
            })
        }else{
            addConversation( {
                sender: myEmail,
                data: {
                    participants: `${myEmail}-${perticipant[0].email}`,
                    users: [loggedinUser,perticipant[0]],
                    message,
                    timestamp: new Date().getTime()
                }
            })
        }
    }

    return (
        open && (
            <>
                <div onClick={control} className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"></div>
                <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Send message
                    </h2>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <input type="hidden" name="remember" value="true" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="to" className="sr-only">
                                    To
                                </label>
                                <input
                                    id="to"
                                    name="to"
                                    type="email"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Send to"
                                    onChange={(e) => handleTo(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    type="test"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Message"
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                disabled={(perticipant?.length > 0 && perticipant[0].email === myEmail) 
                                    || perticipant?.length === 0 
                                    || conversation === undefined}
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Send Message
                            </button>
                        </div>

                        { perticipant?.length === 0 && <Error message="The user does not exist"/> }

                        { perticipant?.length > 0 && perticipant[0].email === myEmail && <Error message="You can not send message to yourself!"/> }
                    </form>
                </div>
            </>
        )
    );
}
