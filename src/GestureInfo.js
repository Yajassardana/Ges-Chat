import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';

import { Tooltip } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: 'rgba(51, 51, 87, 1)',
    color: 'rgba(255, 255, 255, 0.88)',
    width: '230px',
    fontSize: theme.typography.pxToRem(14),
    border: '1px solid #F50057',
    // fontFamily:'Open Sans, sans-serif'
  },
}))(Tooltip);

export const useStyles = makeStyles((theme) => ({
   gestureList:{
      listStyle:'none', 
      fontSize:'2rem',
      '&>li':{
        margin:'1.2rem 0',
        textAlign:'left',
        // fontWeight:400,
        '&>span':{
          fontSize:'1rem'
        }
      }
   },
   gestureContainer:{
     textAlign:'center'
   }
}));

export default function GestureInfo() {
  const classes = useStyles();
  return (
    <div>
      <HtmlTooltip
          title={
            <React.Fragment>
              <div className = {classes.gestureContainer}>
              <Typography style = {{color:'#fff', fontSize:'1.5rem'}}>In Meet Gestures</Typography>
              <ul className = {classes.gestureList}>
                <li>&#x270B; <span> - &nbsp;Raise Hand</span></li>
                <li>&#x270C; <span> - &nbsp;Lower Hand</span></li>
                <li>&#x1F44D; <span> - &nbsp;Switch On camera</span></li>
                <li>&#x1F44E; <span> - &nbsp;Switch Off camera</span></li>
              </ul>
              </div>
            </React.Fragment>
          }
        >
          <IconButton>
                <HelpOutlineIcon color="secondary"/>
            </IconButton>
        </HtmlTooltip>
    </div>
  );
}