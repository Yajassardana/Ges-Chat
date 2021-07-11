import { useState, useEffect, memo, useRef } from 'react';
import Sidebar from './Sidebar';
import Meet from './Meet';
import Chat from './Chat';
import Login from './Login';
import setOnlineStatus from "./setOnlineStatus";
import { Route, useLocation, Redirect, BrowserRouter as Router, Switch } from 'react-router-dom';
import { useStateValue } from './StateProvider';
import CircularProgress from '@material-ui/core/CircularProgress';
import db, { auth, provider, createTimestamp, messaging } from './firebase';
import { TransitionGroup, Transition, CSSTransition } from "react-transition-group";
import './App.css';
import useRoomsData from './useRoomsData';
import scalePage from "./scalePage";
import useFetchData from "./useFetchData.js";

const configureNotif = (docID) => {
  messaging.requestPermission()
    .then(() => {
      return messaging.getToken();
    })
    .then((token) => {
      db.collection("users").doc(docID).set({
        token: token
      }, { merge: true })
    })
    .catch(e => {
      db.collection("users").doc(docID).set({
        token: ""
      }, { merge: true });
    });
}

export default function NestedApp() {
    const [{ user, path, pathID, roomsData, page }, dispatch, actionTypes] = useStateValue();
    const [loader, setLoader] = useState(true);
    const [pwaEvent, setPwaEvent] = useState(undefined);
    const [updating, setUpdating] = useState(false);
    const [checkingVersion, setCheckingVerison] = useState(true);
    const [chats, setChats] = useState(null);
    const [chatsFetched, setChatsFetched] = useState();
    const location = useLocation();
    const [setRoomsData] = useRoomsData();
    const b = useRef([]);
    const menus = ["/rooms", "/search", "/users", "/chats"];
  
    const [rooms, fetchRooms] = useFetchData(30, db.collection("rooms").orderBy("timestamp", "desc"), true, snap => {
      return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    }, "rooms");
  
    const [users, fetchUsers] = useFetchData(30, db.collection("users").orderBy("timestamp", "desc"), true, snap => {
      const data = [];
      if (snap.docs.length > 0) {
        snap.docs.forEach((doc) => {
          const id = doc.id > user.uid ? doc.id + user.uid : user.uid + doc.id;
          if (doc.id !== user.uid) {
            data.push({
              ...doc.data(),
              id,
              userID: doc.id,
            });
            setRoomsData(doc.id, id);
          };
        });
      };
      return data;
    }, "users"); 
  
    useEffect(() => {
      auth.onAuthStateChanged(authUser => {
        if (authUser) {
          dispatch({ type: actionTypes.SET_USER, user: authUser });
          setLoader(false)
          if ("serviceWorker" in navigator && "PushManager" in window) {
            configureNotif(authUser.uid);
          }
          db.collection("version").doc("version").get().then(doc => {
            const version = doc.data().version;
            const previousVersion = localStorage.getItem("version");
            if (previousVersion) {
              if (version !== previousVersion) {
                localStorage.setItem("version", version);
                setUpdating(true);
                auth.signOut();
                auth.signInWithRedirect(provider).catch(e => alert(e.message))
              } else {
                setCheckingVerison(false)
              }
            } else {
              localStorage.setItem("version", version);
              setCheckingVerison(false)
            }
          });
          const ref = db.collection("users").doc(authUser.uid);
          ref.get().then(doc => {
            const data = doc.data();
            if (data) {
              if (data.timestamp) {
                return ref.set({
                  name: authUser.displayName,
                  photoURL: authUser.photoURL,
                }, { merge: true })
              }
            }
            return ref.set({
              name: authUser.displayName,
              photoURL: authUser.photoURL,
              timestamp: createTimestamp(),
            }, { merge: true })
          });
        } else {
          dispatch({ type: actionTypes.SET_USER, user: null });
          setLoader(false);
          db.collection("version").doc("version").get().then(doc => {
            const version = doc.data().version;
            const previousVersion = localStorage.getItem("version");
            if (previousVersion) {
              if (version !== previousVersion) {
                localStorage.setItem("version", version);
                setCheckingVerison(false)
              } else {
                setCheckingVerison(false)
              }
            } else {
              localStorage.setItem("version", version);
              setCheckingVerison(false)
            }
          })
        }
      })
    }, [])
  
    useEffect(() => {
      window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent the mini-infobar from appearing on mobile
        e.preventDefault();
        // Stash the event so it can be triggered later.
        setPwaEvent(e);
        // Update UI notify the user they can install the PWA
      });
      window.addEventListener("resize", () => {
        dispatch({ type: "set_scale_page", page: scalePage() });
      })
    }, []);
    // let test = useStateValue();
    useEffect(()=>{
      if(user!=null){
        let betterUrl = user.photoURL.replace('s96-c', 's240-c');
        let userObj = {
          name : user.displayName,
          email : user.email,
          verified : user.emailVerified,
          photoURL : betterUrl,
          uid :  user.uid
        }
        localStorage.setItem('userObj', JSON.stringify(userObj));
      }
    },[user]);
    useEffect(() => {
      if (user) {
        db.collection("users").doc(user.uid).collection("chats").orderBy("timestamp", "desc").onSnapshot({ includeMetadataChanges: true }, snap => {
          if (snap.docs?.length > 0) {
            snap.docChanges().forEach(change => {
              if (change.type === "added") {
                setRoomsData(change.doc.data().userID, change.doc.id);
              };
            });
            if (!snap.metadata.fromCache || (!window.navigator.onLine && snap.metadata.fromCache)) {
              setChats(snap.docs.map(cur => ({
                ...cur.data(),
                id: cur.id
              })));
            };
          } else {
            setChats([]);
          };
        });
        fetchRooms(() => null);
        fetchUsers(() => null);
      };
    }, [user]);
  
    useEffect(() => {
      if (chats?.length > 0) {
        if (chats.every(cur => roomsData[cur.id]?.lastMessage)) {
          setChatsFetched(true);
        };
      } else if (chats?.length === 0) {
        setChatsFetched(true);
      }
    }, [chats, roomsData]);
  
    useEffect(() => {
      var s;
      if (user) {
        setOnlineStatus(user.uid);
      }
      return () => {
        if (s) {
          s();
        };
      };
    }, [user]);
  
    useEffect(() => {
      var id = location.pathname.replace("/room/", "");
      menus.forEach(cur => id = id.replace(cur, ""))
      dispatch({ type: "set_path_id", id });
    }, [location.pathname]);

    
    return (
        <>
        {page.width <= 760 ?
        <Redirect to="/chats" />
        : <Redirect to="/" />}
      {!user && !loader && !checkingVersion && !updating ?
        <Login />
        : user && !updating && chatsFetched ?
          <div className="app__body">
            <Sidebar chats={chats} pwa={pwaEvent} rooms={rooms} fetchRooms={fetchRooms} users={users} fetchUsers={fetchUsers} />
            <TransitionGroup component={null} >
              {page.width <= 760 ?
                <Transition
                  key={location.pathname.replace("/image", "")}
                  timeout={260}
                >
                  {state => (
                    <Route location={location} path={`${path}/room/:roomID`}>
                      <Chat
                        b={b}
                        unreadMessages={chats?.length > 0 ? chats.find(cur => cur.id === pathID)?.unreadMessages : 0}
                        animState={state}
                      />
                    </Route>
                  )}
                </Transition>
                :
                <CSSTransition
                  key={location.pathname.replace("/image", "")}
                  timeout={1010}
                  classNames="page"
                >
                  {state => (
                    <Route location={location} path={`${path}/room/:roomID`}>
                      <Chat
                        b={b}
                        unreadMessages={chats?.length > 0 ? chats.find(cur => cur.id === pathID)?.unreadMessages : 0}
                        animState={state}
                      />
                    </Route>
                  )}
                </CSSTransition>
              }
            </TransitionGroup>
          </div> :
          <div className="loader__container">
            <CircularProgress />
          </div>
      }
        </>
    )
}

