import React, { useRef, useState, useEffect } from 'react';  
import './InMeetChat.css'
import { IconButton, Tooltip } from '@material-ui/core';
import SendIcon from '@material-ui/icons/Send';
import db, { createTimestamp, fieldIncrement, storage, audioStorage } from "./firebase";
import { useStateValue } from './StateProvider';
import InMeetChatMessage from './InMeetChatMessage';
import ScrollToBottom, { useScrollToBottom, useSticky } from 'react-scroll-to-bottom';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import CloseIcon from '@material-ui/icons/Close';
import Filter from 'bad-words';

        //   name : user.displayName,
        //   email : user.email,
        //   verified : user.emailVerified,
        //   photoURL : betterUrl,
        //   uid :  user.uid
export default function InMeetChat({roomID, roomName, user, b, chatToggle, setChatToggle, page}) {
    const dummy = useRef();
    const [{ dispatchMessages, dispMessSafe}, dispatch, actionTypes] = useStateValue();
    const filter = new Filter();
    filter.addWords('Loser');
    const [formValue, setFormValue] = useState('');
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([]);
    const limit = useRef(50);
    const stb = useScrollToBottom();
    const [sticky] = useSticky();
    const sendMessage = async event => {
        event.preventDefault();
        // if (focus) {
        //     document.querySelector('.chat__footer > form > input').focus();
        // }
        if(input!=="" && filter.isProfane(input)){
            let c = window.confirm(`Dear user, the message : "${filter.clean(input)} ", which you're trying to send might be really offensive to the recipient(s). \nAre you sure you want to send that?`);
            if(c==false){setInput("");return;};
        }
        if (input !== "") {
            const inputText = input;
            setInput("");
            const roomInfo = {
                lastMessage: inputText,
                seen: false,
            }
            db.collection("rooms").doc(roomID).set(roomInfo, { merge: true });
            const messageToSend ={
                name: user.name,
                message: input,
                uid: user.uid,
                timestamp: createTimestamp(),
                time: new Date().toUTCString(),
            }
                db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                    timestamp: createTimestamp(),
                    // photoURL: user.photoURL ? user.photoURL : null,
                    name: roomName,
                }, { merge: true });
            const doc = await db.collection("rooms").doc(roomID).collection("messages").add(messageToSend);
        };

    };
  
    function fetchMessages(update) {
        const ref = db.collection("rooms").doc(roomID).collection("messages").orderBy("timestamp", "desc");
        if (update) {
            
             b.current[roomID] =  ref.limit(5).onSnapshot(snapshot => {
                const newMessages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    const time = data.time ? data.time : new Date(data.timestamp?.toDate()).toUTCString()
                    return {
                        ...data,
                        timestamp: time,
                        id: doc.id,
                    }
                });
                newMessages.reverse();
                dispatch({
                    type: actionTypes.SET_MESSAGES,
                    id: roomID,
                    messages: newMessages,
                    update
                });
            });
        } else {
            ref.limit(limit.current).get().then(docs => {
                const newMessages = [];
                docs.forEach(doc => {
                    const data = doc.data();
                    const time = data.time ? data.time : new Date(data.timestamp?.toDate()).toUTCString()
                    newMessages.push({
                        ...data,
                        timestamp: time,
                        id: doc.id,
                    });
                });
                if(newMessages.length>0){
                newMessages.reverse();
                dispatch({
                    type: actionTypes.SET_MESSAGES,
                    id: roomID,
                    messages: newMessages,
                    update
                });}
            });
        };
    }
    useEffect(()=>{
    },[messages])
    useEffect(() => {
        if (dispatchMessages[roomID]?.messages) {
            setMessages(dispatchMessages[roomID].messages);

        };
    }, [dispatchMessages[roomID]]);
    useEffect(() => {
        if (roomID) {
            if (b.current[roomID]) {
                b.current[roomID]();
            }
            if (dispatchMessages[roomID]?.firstMessageID) {
                fetchMessages(true);
            } else {
                db.collection("rooms").doc(roomID).collection("messages").orderBy("timestamp", "asc").limit(1).get().then(docs => {
                        if (docs.empty) {
                            dispatch({
                                type: "set_firstMessage",
                                id: roomID,
                                firstMessageID: "no id",
                            }); 
                        } else {
                            docs.forEach(doc => {
                                dispatch({
                                    type: "set_firstMessage",
                                    id: roomID,
                                    firstMessageID: doc.id,
                                });
                            });       
                        };
                    fetchMessages(false);
                    fetchMessages(true);
                });
            };
        };
    }, [roomID]);
    useEffect(()=>{
        let texts = document.querySelectorAll('.message-sent-text');
        if(texts.length>0){
            // let text = texts[0].children[1];
            texts.forEach((text,index)=>{
                if(text.innerHTML!="" && text.children.length<1){
                    let expression = /(https?:\/\/)?[\w\-~]+(\.[\w\-~]+)+(\/[\w\-~@:%]*)*(#[\w\-]*)?(\?[^\s]*)?/gi;
                    let regex = new RegExp(expression);
                    let match = ''; let splitText = []; let startIndex = 0;
                    let textToCheck = text.innerHTML;
                    while ((match = regex.exec(textToCheck)) != null) {
                            
                    splitText.push({text: textToCheck.substr(startIndex, (match.index - startIndex)), type: 'text'});
                                
                    let cleanedLink = textToCheck.substr(match.index, (match[0].length));
                    cleanedLink = cleanedLink.replace(/^https?:\/\//,'');
                    splitText.push({text: cleanedLink, type: 'link'});
                                    
                    startIndex = match.index + (match[0].length);               
                    }
                    if (startIndex < textToCheck.length) splitText.push({text: textToCheck.substr(startIndex), type: 'text'});
                    let ans = '';
                    let link = false;
                    splitText.forEach((st, index)=>{
                        if(st.type=='text')ans = ans + st.text + ' ';
                        else if(st.type=='link') {ans = ans + '<a href="https://' + st.text + '" target = "_blank" >' + st.text + '</a>' + ' ';link = true;}
                    });
                    if(link){
                        texts[index].innerHTML = ans;
                        texts[index].style.textDecoration = 'underline';
                        texts[index].style.color = 'white';
                    }
                    else texts[index].innerHTML = ans;
                    // }
                }
            });
        }
            
    },[messages]);
    return (
    <>
    <div className="messages-container">
      <ScrollToBottom className="messages" followButtonClassName= "triangle">
        <IconButton style = {{position:'absolute', top:'5px', right:'5px', backgroundColor:'#242136', color:'white' , display:page.width<=760?'inline':'none'}} onClick = {()=>setChatToggle(false)}>
                <CloseIcon/>          
        </IconButton>
            {messages.map((message, i) => {
                if(typeof(message.imageUrl)=="undefined"&&typeof(message.audioUrl=="undefined")){return <div key={i}><InMeetChatMessage message={message} user = {user}/></div>;}})}
                {!sticky && <button onClick={stb}>Click</button>}
        </ScrollToBottom>
    </div>
    <div className = "input-container">
      <input
          className = "input-text-field"
          type="text"
          placeholder="Type a message"
          label="Type your message"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={event => event.key === 'Enter' ? sendMessage(event) : null}
        />
        <IconButton onClick = {sendMessage} disabled={!input} className = "input-send-button" style = {{ borderRadius:'0px', backgroundColor:(input)?'#242136':'#333357'}}>
            <SendIcon/>            
        </IconButton>
        </div>
    </>)
  }
  