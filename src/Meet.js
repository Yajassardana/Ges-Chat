import React, {useEffect, useState, useRef} from 'react'
import Jitsi from 'react-jitsi'
import useStateRef from "react-usestateref";
import { useStateValue } from './StateProvider';
import { Redirect } from 'react-router';
import OptionsBar from './OptionsBar';
import GestureInfo from "./GestureInfo";
import Switch from '@material-ui/core/Switch';
import { Tooltip } from '@material-ui/core';
import scalePage from "./scalePage";


//UI and componenets
import './Meet.css'
import CircularProgress from '@material-ui/core/CircularProgress';
import InMeetChat from './InMeetChat';
export default function Meet({match, history}) {
    
  const [displayName, setDisplayName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [password, setPassword] = useState('')
  const [onCall, setOnCall] = useState(false)
  const [api, setAPI] = useState(null);
  const [meetId, setMeetId] = useState('');
  const [loader, setLoader] = useState(true);
  const [gest, setGest, gestRef] = useStateRef(true);
  const[userObj, setUserObj] = useState(null);
  const [page, setPage] = useState(scalePage());
  const b = useRef([]);
  const [chatToggle, setChatToggle] = useState(false);

  // const [{user}] = useStateValue();
  // let test = useStateValue();
  useEffect(()=>{
    if(api!=null){
      api.executeCommand('avatarUrl', userObj?.photoURL);
    }
  }, [api]);
  useEffect(() => {
    if(localStorage.getItem("userObj") == null){
      history.push('/');
    }
    else {
      let currUser = JSON.parse(localStorage.getItem('userObj'));
      if(currUser.verified==false)history.push('/');
      setUserObj(currUser);
    }
    }, []);
  useEffect(()=>{
    if(match.params.meetId&&match.params.meetId.length<12||!match.params.roomName){
      history.push('/');
    }
    else{
      setMeetId(match.params.meetId)
      setDisplayName('PlaceHolder');
      setRoomName(match.params.roomName);
      setRoomId(match.params.roomId)
      setOnCall(true);
      setLoader(false);
    }
  }, []);
  let test = useStateValue();

  const handleChange = (event) => {
    setGest(event.target.checked);

  };

    return (
        <div className = "back-container">
       
        {
          onCall
          ? (
            <div className = "meet-chat-container">
            <div className = "meet-container" style = {{width:page.width<=760?'100%':'75%', display:(chatToggle&&page.width<=760)?'none':'flex', transition:'display 1s'}}>
            <div className = "gesture-container">
              <div className = "switch-container">
                <Tooltip title= {`${gest?'Disable Gestures':'Enable Gestures'}`} placement="top" arrow>
                  <Switch
                    checked={gest}
                    onChange={handleChange}
                    name="gestSwitch"
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                  />
                </Tooltip>
              </div>
                <GestureInfo/>
            </div>
                <Jitsi
                domain = {'yajassardana.tech'}
                interfaceConfig = {{ SHOW_JITSI_WATERMARK:false,TOOLBAR_BUTTONS:[], DEFAULT_BACKGROUND: '#333357'}}
                roomName={roomName}
                displayName={userObj?.name}
                config={{enableInsecureRoomNameWarning: false, prejoinPageEnabled: false, disableDeepLinking: true}}
                loadingComponent = {CircularProgress}
                onAPILoad={JitsiMeetAPI =>{ setAPI(JitsiMeetAPI)}}
                userInfo = {{name : userObj?.name, email : userObj?.email, photoURL : userObj?.photoURL}}
              />
              <OptionsBar api = {api} gest = {gest} page = {page} chatToggle = {chatToggle} setChatToggle = {setChatToggle}/>
            </div>
            <div className = "chat-container" style = {{width:page.width<=760?'100%':'25%', display:(chatToggle&&page.width<=760)?'flex':(page.width<=760?'none':'flex'), transition:'display 1s'}}>
              <InMeetChat roomID = {roomId} user = {userObj}  b ={b} roomName = {roomName} chatToggle = {chatToggle} setChatToggle = {setChatToggle} page = {page}/>
            </div>
            </div>
            )
          : (
            <div style={{
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
                <CircularProgress />
            </div>
          )
        }
      </div>
    )
}
