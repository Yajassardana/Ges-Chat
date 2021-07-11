import { useState, useEffect, memo, useRef } from 'react';
import Meet from './Meet';
import { Route, useLocation, Redirect, HashRouter as Router, Switch } from 'react-router-dom';
import { useStateValue } from './StateProvider';
import './App.css';
import NestedApp from './NestedApp';
import {config} from 'dotenv'

function App() {
  const [{page }] = useStateValue();
  useEffect(()=>{
    console.log = console.warn = console.error = () => {}
    config();
  },[])
  return (
    <Router basename = "/">
    <div className="app" style={{ ...page }} >
      <Switch>
        <Route path = "/:roomName/:roomId/Meet/:meetId"render={(props) => (
    <Meet {...props}/>
  )} 
  />
        <Route path="/">
          <NestedApp/>
        </Route>
      </Switch>
    </div>
    </Router>
  );
}

export default memo(App);
