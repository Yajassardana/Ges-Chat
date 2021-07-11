import useStateRef from "react-usestateref";
import React, {useEffect, useState, useRef} from 'react'
import Switch from '@material-ui/core/Switch';
import './Gesture.css'
import GestureModal from "./GestureModal";
import { useStateValue } from './StateProvider';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';

import { Tooltip } from '@material-ui/core';

import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose";
import Webcam from "react-webcam";


import { thumbsDownDescription } from "./Utilities/ThumbsDown";
import {handUpDescription} from "./Utilities/HandUp";
import * as fp from "fingerpose";
// import thumbs_up from "./Assets/thumbs_up.png";
// import thumbs_down from "./Assets/thumbs_down.png"

export default function Gesture({api}) {
    const webcamRef = useRef(null);
    // const canvasRef = useRef(null);
    const [modal, setModal] = useState(false);
    // const [emoji, setEmoji, emoref] = useStateRef(null);
    const [gest, setGest, gestRef] = useStateRef(true);
    // const images = { thumbs_up: thumbs_up, thumbs_down : thumbs_down};
  

  const handleChange = (event) => {
    setGest(event.target.checked);
  };
  const toggleModal = ()=>{
      setModal(true);
  };
    return (
        <div className = "gesture-container">
          <div className = "gesture-switch">
            <Tooltip title= {`${gest?'Disable Gestures':'Enable Gestures'}`} placement="top" arrow>
              <Switch
                checked={gest}
                onChange={handleChange}
                name="gestSwitch"
                inputProps={{ 'aria-label': 'secondary checkbox' }}
              />
            </Tooltip>
            {/* <Tooltip title= {`Show gestures`} placement="top" arrow>
              <IconButton aria-label="Toggle Video" onClick = {toggleModal}>
                    <HelpOutlineIcon color="secondary"/>
                </IconButton>
            </Tooltip> */}
            <GestureModal/>
          </div>
        </div>
    )
}