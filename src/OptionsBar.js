import React, {useEffect, useState, useRef} from 'react';
import useStateRef from "react-usestateref";

import { useHistory } from 'react-router';
import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import PanToolIcon from '@material-ui/icons/PanTool';
import ChatIcon from '@material-ui/icons/Chat';
import CallEndIcon from '@material-ui/icons/CallEnd';
import SettingsIcon from '@material-ui/icons/Settings';
import { Tooltip } from '@material-ui/core';
import './OptionsBar.css'

//Gesture

import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";


import { thumbsDownDescription } from "./Utilities/ThumbsDown";
import {handUpDescription} from "./Utilities/HandUp";
import * as fp from "fingerpose";


export default function OptionsBar({api, gest, page, chatToggle, setChatToggle}) {

  const webcamRef = useRef(null);
  // const canvasRef = useRef(null);
  const [modal, setModal] = useState(false);
  const [emoji, setEmoji, emoref] = useStateRef(null);
  const [localGest, setLocalGest, localGestRef] = useStateRef(true);
  // const images = { thumbs_up: thumbs_up, thumbs_down : thumbs_down};
const useStyles = makeStyles((theme) => ({
    container:{
        '&>button':{
          padding:page?.width<=760?'9px':'12px',
          margin:page?.width<=760?'0.5rem':'1rem',
          backgroundColor:'#FBFAFF',
          '&>span>svg':{
              color:'#12101f'
          }
        }
  
    }
  }));

const runHandpose = async () => {
  const net = await handpose.load();
  //  Loop and detect hands
  setInterval(() => {
    if(localGestRef.current==true)detect(net);
  }, 500);
};
useEffect(()=>{
  setLocalGest(gest);
}, [gest]);
const detect = async (net) => {
  // Check data is available
  if (
    typeof webcamRef.current !== "undefined" &&
    webcamRef.current !== null &&
    webcamRef.current.video.readyState === 4
  ) {
    // Get Video Properties
    const video = webcamRef.current.video;
    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    // Set video width
    webcamRef.current.video.width = videoWidth;
    webcamRef.current.video.height = videoHeight;

    // Set canvas height and width
  //   canvasRef.current.width = videoWidth;
  //   canvasRef.current.height = videoHeight;

    const hand = await net.estimateHands(video);
    if (hand.length > 0) {
      const GE = new fp.GestureEstimator([
        fp.Gestures.VictoryGesture,
        fp.Gestures.ThumbsUpGesture,
        // loveYouGesture,
        thumbsDownDescription,
        handUpDescription,
        // handDownDescription
      ]);
      const gesture = await GE.estimate(hand[0].landmarks, 4);
      if (gesture.gestures !== undefined && gesture.gestures.length > 0) {

        const confidence = gesture.gestures.map(
          (prediction) => prediction.confidence
        );
        const maxConfidence = confidence.indexOf(
          Math.max.apply(null, confidence)
        );
        if(gesture.gestures[maxConfidence].confidence>=6&&api!=null){
          setEmoji(gesture.gestures[maxConfidence].name);
          switch(gesture.gestures[maxConfidence].name){
            case 'hand_up': {
              if(handRaisedRef.current==false){
                api.executeCommand('toggleRaiseHand');
                setHandRaised(true);
              }
              break;
            }
            case 'victory':{
              if(handRaisedRef.current==true){
                api.executeCommand('toggleRaiseHand');
                setHandRaised(false);
              }
              break;
            }
            case 'thumbs_up':{
              if(videoOnRef.current==false){
                api.executeCommand('toggleVideo');
              }
              break;
            }
            case 'thumbs_down':{
              if(videoOnRef.current==true){
                api.executeCommand('toggleVideo');
              }
              break;
            }
          }
        }
      }
    }
  }
};
useEffect(()=>{if(api!=null)runHandpose();},[api]);
  const classes = useStyles();
  const [videoOn, setVideoOn, videoOnRef] = useStateRef(false);
  const [audioOn, setAudioOn] = useState(false);
  const [ssOn, setSsOn] = useState(false);
  const [handRaised, setHandRaised, handRaisedRef] = useStateRef(false);
  const history = useHistory();
  useEffect(()=>{
  },[api]);

  api?.addEventListeners({
    readyToClose: function () {
      
  },  
    videoMuteStatusChanged: function (data) {
        if(data.muted)
            setVideoOn(false);
        else
            setVideoOn(true);
    },
    audioMuteStatusChanged: function (data) {
      if(data.muted)
          setAudioOn(false);
      else
          setAudioOn(true);
  },
  screenSharingStatusChanged: function (data) {
    if(data.on)
        setSsOn(true);
    else
        setSsOn(false);
  },
  });
  const toggleVideo = (event)=>{
    api.executeCommand('toggleVideo');
  };
  const toggleAudio = (event)=>{
    api.executeCommand('toggleAudio');
  };
  const toggleSS = (event)=>{
    if(ssOn){
      let c = window.confirm('Stop presenting screen?');
      if(c==true)api.executeCommand('toggleShareScreen');
    }
    else api.executeCommand('toggleShareScreen');
  };
  const toggleRaiseHand = (event)=>{
    api.executeCommand('toggleRaiseHand');
    setHandRaised(!handRaisedRef.current);

  };
  const hangUp = () =>{
    let c = window.confirm('Do you want to leave the meeting?');
    if(c==true){
      api.executeCommand('hangup');
      history.push('/');
    }
  };
  return (
    <div>
        <div className = "optionsbar-container">
            <div className = {classes.container}>
            <Tooltip title= {`Turn ${videoOn?'off':'on'} camera`} placement="top" arrow>
              <IconButton aria-label="Toggle Video" onClick = {toggleVideo} style = {{backgroundColor:videoOn?'#FBFAFF':'#DD3849'}}>
                    {videoOn?<VideocamIcon />:<VideocamOffIcon style = {{color:'#FBFFF1'}}/>}
                </IconButton>
            </Tooltip>
            <Tooltip title= {`Turn ${audioOn?'off':'on'} microphone`} placement="top" arrow>
              <IconButton aria-label="Toggle Mic"  onClick = {toggleAudio} style = {{backgroundColor:audioOn?'#FBFAFF':'#DD3849'}}>
                  {audioOn?<MicIcon />:<MicOffIcon style = {{color:'#FBFFF1'}}/>}
              </IconButton>
            </Tooltip>            
            <Tooltip title= {`${ssOn?'Stop presenting':'Present screen'}`} placement="top" arrow>
              <IconButton  aria-label="Share Screen" onClick = {toggleSS} style = {{backgroundColor:ssOn?'#8AB4F8':'#FBFAFF'}}>
                  {ssOn?<StopScreenShareIcon style = {{color:'#FBFFF1'}}/>:<ScreenShareIcon />}
              </IconButton>
            </Tooltip>            
            <Tooltip title= {`${handRaised?'Lower hand':'Raise hand'}`} placement="top" arrow>
              <IconButton aria-label="Raise hand" onClick = {toggleRaiseHand} style = {{backgroundColor:handRaised?'#12101f':'#FBFAFF'}}>
                  <PanToolIcon style = {{color:handRaised?'#F2BA34':'#12101f'}} />
              </IconButton>
            </Tooltip>            
            <Tooltip title= {`${'Toggle Chat'}`} placement="top" arrow>        
            <IconButton aria-label="Chat" onClick = {()=>setChatToggle(true)} style = {{display:page?.width<=760?'inline':'none', backgroundColor:'#FBFAFF'}}>
                <ChatIcon />
            </IconButton>
            </Tooltip>
            <Tooltip title= {`${'Hang-up'}`} placement="top" arrow>
              <IconButton className = {classes.callEnd} style ={{backgroundColor: '#DD3849'}}aria-label="Call end" onClick = {hangUp} >
                  <CallEndIcon  style = {{color:'#FBFAFF'}}/>
              </IconButton>
            </Tooltip>
            {/* <IconButton  aria-label="Settings">
            <SettingsIcon/>
            </IconButton> */}
            <Webcam
          ref={webcamRef}
          style={{
            position: "absolute",
            visibility:"hidden",
            marginLeft: "0",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 0,
            width: '4px',
            height: '3px',
            display:'inline'
          }}
        />
        </div>
        </div>
    </div>
  );
}
