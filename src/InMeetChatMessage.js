import React, {  } from 'react';  
import './InMeetChatMessage.css'
export default function InMeetChatMessage({key, message, user}) {  
    return (
      <>
        {(message.message!=""&&typeof(message.message)!="undefined")
        ?
        (<>{user.uid==message.uid?(<div className = "message-sent-container">
          <div className = "message-sent-sender">You</div>
          <div className = "message-sent-text" >{message.message}</div>
        </div>):(<>
          <div className = "message-rec-container">
          <div className = "message-rec-sender">{message.name}</div>
          <div className = "message-rec-text" >{message.message}</div>
        </div>
        </>)}</>
        )
        :( <></>)
      }
      </>

    )
  }
  