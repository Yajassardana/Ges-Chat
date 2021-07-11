import { useState, useEffect, useLayoutEffect, useRef, memo } from 'react';
import { Avatar, IconButton, Tooltip } from '@material-ui/core';
import { TransitionGroup, Transition, CSSTransition } from "react-transition-group";
import { AddPhotoAlternate, MoreVert, DoneAllRounded, ArrowDownward, ArrowBack } from '@material-ui/icons';
import VideocamIcon from '@material-ui/icons/Videocam'; 
import { useParams, useRouteMatch, useLocation, Link, Route, useHistory } from 'react-router-dom';
import db, { createTimestamp, fieldIncrement, storage, audioStorage } from "./firebase";
import { useStateValue } from './StateProvider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import MediaPreview from "./MediaPreview";
import ImagePreview from "./ImagePreview";
import ChatFooter from "./ChatFooter";
import Compressor from 'compressorjs';
import anime from 'animejs/lib/anime.es.js';
import { v4 as uuidv4 } from 'uuid';
import AudioPlayer from "./AudioPlayer.js"
import './Chat.css';
import audio2 from "./message_sent.mp3";
import audio1 from "./message_received.mp3";
import { set } from 'animejs';
import {URLs} from './Utilities/Constants'
import Randomstring from 'randomstring';
import Snackbar from '@material-ui/core/Snackbar';
import Filter from 'bad-words';
function Chat({ animState, unreadMessages, b }) {
    const filter = new Filter();
    filter.addWords('Loser');
    const [input, setInput] = useState('');
    const { roomID } = useParams();
    const location = useLocation()
    const match = useRouteMatch();
    const [{ dispatchMessages, user, roomsData, page }, dispatch, actionTypes] = useStateValue();
    const [imagePreview, setImagePreview] = useState({})
    const [messages, setMessages] = useState([]);
    const [openMenu, setOpenMenu] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [focus, setFocus] = useState(false);
    const [token, setToken] = useState('');
    const [state, setState] = useState(location.state ? location.state : {});
    const [seen, setSeen] = useState(false);
    const [typing, setTyping] = useState(false);
    const [src, setSRC] = useState('');
    const [image, setImage] = useState(null);
    const [writeState, setWriteState] = useState(0);
    const [ratio, setRatio] = useState(false);
    const [scrollArrow, setScrollArrow] = useState(false);
    const [clientWidth, setClientWidth] = useState(null);
    const [firstRender, setFirstRender] = useState(false);
    const [sendAnim, setSendAnim] = useState(false);
    const [limitReached, setLimitReached] = useState(Boolean(dispatchMessages[roomID]?.limitReached));
    const history = useHistory();
    const chatBodyRef = useRef();
    const lastMessageRef = useRef();
    const chatBodyContainer = useRef();
    const chatAnim = useRef();
    const mediaPreview = useRef();
    const prevMessages = useRef([])
    const limit = useRef(50);
    const prevScrollHeight = useRef(null);
    const [audioID, setAudioID] = useState(null);
    const paginating = useRef(null);
    const paginating2 = useRef(null);
    const [paginateLoader, setPaginateLoader] = useState(false);
    const messageSentAudio = new Audio(audio2);
    const messageReceivedAudio = new Audio(audio1);
    const mediaSnap = useRef([]);
    const mediaChecked = useRef(false);
    const [meetE, setMeetE] = useState(null);
    const [meetButton, setMeetButton] = useState(false);
    const [snackOpen, setSnackOpen] = useState(false);
    useEffect(()=>{
        if(meetE!=null&&meetButton){
            setMeetButton(false);
            sendMessage(meetE);
        }
    },[input])
    const createMeet = (e) => {
        setMeetButton(true);
        setMeetE(e);
        let roomNameNoSpace = state?.name.split(" ").join("%20");
        let meetLink = `${URLs.APP_URL}${roomNameNoSpace}/${roomID}/meet/${Randomstring.generate({
            length: 18,
            charset: 'alphanumeric'
          })}`;
        setInput(meetLink);
       let input = document.body.appendChild(document.createElement("input"));
        input.value = meetLink;
        input.focus();
        input.select();
        document.execCommand('copy');
        setSnackOpen(true);
        input.parentNode.removeChild(input);
        
    }
    const change = (e) => {
        clearTimeout(writeState);
        setInput(e.target.value);
        if (state?.userID) {
            db.collection("rooms").doc(roomID).set({
                [user.uid]: true,
            }, { merge: true }).then(() => {
                setWriteState(setTimeout(() => {
                    db.collection("rooms").doc(roomID).set({
                        [user.uid]: false,
                    }, { merge: true });
                }, 1000));
            });
        }; 
    };
    

    const clickImagePreview = (event, src, ratio) => {
        const target = event.target;
        const node = target.parentNode.parentNode;
        const obj = node.getBoundingClientRect();
        setImagePreview({
    		ratio: ratio,
            top: page.transform === "scale(1)" ? obj.top :  obj.top / (window.innerHeight / page.height),
            left: page.transform === "scale(1)" ? obj.left : obj.left / (window.innerWidth / page.width),
            width: node.offsetWidth,
            height: node.offsetHeight,
            imgW: target.offsetWidth,
            imgH: target.offsetHeight,
            src,
        })
    }

    const close = () => {
        mediaPreview.current.style.animation = "opacity-out 300ms ease forwards";
        setTimeout(() => {
            setImage(null);
            setSRC("");
        }, 310);
    };

    const handleFile = event => {
        if (window.navigator.onLine) {
            if (event.target.files[0]) {
                var reader = new FileReader();
                reader.onload = function () {
                    setSRC(reader.result)
                }
                reader.readAsDataURL(event.target.files[0]);
                setImage(event.target.files[0])
            };
        } else {
            alert("No access to internet !!!");
        };
    };
    //window
    const scrollChatBody = () => {
        const nodeArr = Array.from(document.querySelectorAll('.chat__message'));
        const height =  outerHeight(nodeArr[nodeArr.length - 2]) + outerHeight(nodeArr[nodeArr.length - 3]) + outerHeight(nodeArr[nodeArr.length - 4]);
        const lastMHeight = height < page.height / 2 ? height : page.height / 2;
        if (chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight === 0) {
            setTimeout(() => {
                if (chatBodyRef.current) {
                	chatBodyRef.current.style.opacity = "1";
                }
                setFirstRender(true)
            }, animState === "entering" ? 350 : 50);
            setTimeout(() => {
                const node = document.querySelector(".chat .chat__lastMessage");
                if (node) {
                    node.style.animation = "none";
                    node.style.opacity = "1";
                }
            }, 50)
        } else if (chatBodyContainer.current.scrollTop + outerHeight(nodeArr[nodeArr.length - 1]) >=
            (chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight - lastMHeight)
            && messages[messages.length - 1].uid !== user.uid) {
            if (chatBodyContainer.current.scrollTop !== chatBodyContainer.current.scrollHeight) {
                setSendAnim(true);
                anime({
                    targets: chatBodyContainer.current,
                    scrollTop: chatBodyContainer.current.scrollHeight,
                    duration: 800,
                    easing: "linear",
                    complete: function() {
                        setSendAnim(false);
                    }
                });   
            };
        } else if (messages[messages.length - 1].uid === user.uid) {
            if (chatBodyContainer.current.scrollTop !== chatBodyContainer.current.scrollHeight) {
                setSendAnim(true);
                anime({
                    targets: chatBodyContainer.current,
                    scrollTop: chatBodyContainer.current.scrollHeight,
                    duration: 800,
                    easing: "linear",
                    complete: function() {
                        setSendAnim(false);
                    }
                });
            }

        } else {
            setScrollArrow(true);
        }
    }

    function outerHeight(el) {
      if (el) {
        var height = el.offsetHeight;
          var style = getComputedStyle(el);

          height += parseInt(style.marginTop) + parseInt(style.marginBottom);
          return height;
      }
      return null;
    }

    const sendMessage = async event => {
        event.preventDefault();
        if (focus) {
            document.querySelector('.chat__footer > form > input').focus();
        }
        if(input!=="" && filter.isProfane(input)){
            let c = window.confirm(`Dear user, the message : ${filter.clean(input)} which you're trying to send might be really offensive to the recipient(s). \nDo you really want to send that?`);
            if(c==false){setInput("");return;};
        }
        if (input !== "" || (input === "" && image)) {
            const inputText = input;
            const imageToUpload = image
            if (imageToUpload) {
                close();
            }
            setInput("");
            const roomInfo = {
                lastMessage: imageToUpload ? {
                    message: inputText,
                    audio: false,
                } : inputText,
                seen: false,
            }
            db.collection("rooms").doc(roomID).set(roomInfo, { merge: true });
            var split, imageName;
            if (imageToUpload) {
                split = imageToUpload.name.split(".");
                imageName = split[0] + uuidv4() + "." + split[1];
            }
            const messageToSend = imageToUpload ? {
                name: user.displayName,
                message: input,
                uid: user.uid,
                timestamp: createTimestamp(),
                time: new Date().toUTCString(),
                imageUrl: "uploading",
                imageName: imageName,
                ratio: ratio
            } : {
                name: user.displayName,
                message: input,
                uid: user.uid,
                timestamp: createTimestamp(),
                time: new Date().toUTCString(),
            }
            if (state.userID) {
                db.collection("users").doc(state.userID).collection("chats").doc(roomID).set({
                    timestamp: createTimestamp(),
                    photoURL: user.photoURL ? user.photoURL : null,
                    name: user.displayName,
                    userID: user.uid,
                    unreadMessages: fieldIncrement(1),
                }, { merge: true });
                db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                    timestamp: createTimestamp(),
                    photoURL: state.photoURL ? state.photoURL : null,
                    name: state.name,
                    userID: state.userID
                }, { merge: true });
                if (token !== "" && !imageToUpload) {
                    db.collection("notifications").add({
                        userID: user.uid,
                        title: user.displayName,
                        body: inputText,
                        photoURL: user.photoURL,
                        token: token,
                    });
                };
            } else {
                db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                    timestamp: createTimestamp(),
                    photoURL: state.photoURL ? state.photoURL : null,
                    name: state.name,
                });
            };
            const doc = await db.collection("rooms").doc(roomID).collection("messages").add(messageToSend);
            if (imageToUpload) {
                new Compressor(imageToUpload, { quality: 0.8, maxWidth: 1920, async success(result) {
                    setSRC("");
                    setImage(null);
                    await storage.child(imageName).put(result);
                    const url = await storage.child(imageName).getDownloadURL();
                    db.collection("rooms").doc(roomID).collection("messages").doc(doc.id).update({
                        imageUrl: url
                    });
                    if (state.userID && token !== "") db.collection("notifications").add({
                        userID: user.uid,
                        title: user.displayName,
                        body: inputText,
                        photoURL: user.photoURL,
                        token: token,
                        image: url
                    });
                }});
            };
        };
    };

    const deleteRoom = async () => {
	if (window.navigator.onLine) {
            setOpenMenu(false);
            setDeleting(true);
            try {
                const room = db.collection("rooms").doc(roomID);
                const fetchedMessages = await room.collection("messages").get();
                const fetchedAudios = [];
                const fecthedImages = [];
                fetchedMessages.docs.forEach(doc => {
                    if (doc.data().audioName) {
                        fetchedAudios.push(doc.data().audioName);
                    } else if (doc.data().imageName) {
                        fecthedImages.push(doc.data().imageName);
                    }
                });
                var usersChats = [];
                if (state.userID) {
                    usersChats = [state.userID, user.uid];
                } else {
                    usersChats = [...new Set(fetchedMessages.docs.map(cur => cur.data().uid))];
                };
                await Promise.all([
                    ...fetchedMessages.docs.map(doc => doc.ref.delete()),
                    ...fecthedImages.map(img => storage.child(img).delete()),
                    ...fetchedAudios.map(aud => audioStorage.child(aud).delete()),
                    ...usersChats.map(userChat => db.collection("users").doc(userChat).collection("chats").doc(roomID).delete()),
                    room.delete()
                ]);
                page.width <= 760 ? history.goBack() : history.replace("/chats");
            } catch(e) {
                page.width <= 760 ? history.goBack() : history.replace("/chats");
            };
        } else {
            alert("No access to internet !!!");
        };
    };

    const handleFocus = () => {
        if (chatBodyContainer.current.scrollTop > chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight - 120) {
            chatBodyContainer.current.scrollTop = chatBodyContainer.current.scrollHeight;
        };
    };

    function fetchMessages(update) {
        const ref = db.collection("rooms").doc(roomID).collection("messages").orderBy("timestamp", "desc");
        if (update) {
            b.current[roomID] = ref.limit(5).onSnapshot(snapshot => {
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
                newMessages.reverse();
                dispatch({
                    type: actionTypes.SET_MESSAGES,
                    id: roomID,
                    messages: newMessages,
                    update
                });
            });
        };
    }

    function paginate() {
        if (chatBodyContainer.current?.scrollTop === 0 && !limitReached && !paginating.current) {
            setPaginateLoader(true);
            prevScrollHeight.current = chatBodyContainer.current.scrollHeight;
            paginating.current = true;
            paginating2.current = true;
            limit.current = messages.length + limit.current;
            fetchMessages(false);
        } else if (paginating2.current) {
        	prevScrollHeight.current = chatBodyContainer.current.scrollHeight - chatBodyContainer.current.scrollTop;
        };
    };

    useEffect(() => {
        if (messages.length > 0 && !deleting) {
            if (messages[messages.length - 1].id !== prevMessages.current[prevMessages.current?.length - 1]?.id && dispatchMessages[roomID]?.audio) {
                if (messages[messages.length - 1].uid !== user.uid && !paginating2.current && (messages[messages.length - 1].imageUrl === "uploading" || !messages[messages.length - 1].imageUrl)) {
                    messageReceivedAudio.play();
                } else if (messages[messages.length - 1].uid === user.uid && !paginating2.current && (messages[messages.length - 1].imageUrl === "uploading" || !messages[messages.length - 1].imageUrl) && (messages[messages.length - 1].audioUrl === "uploading" || !messages[messages.length - 1].audioUrl)) {
                    messageSentAudio.play();
                };
            };

        };
    }, [messages, deleting, dispatchMessages[roomID]]);

    useEffect(() => {
        if (firstRender && !limitReached) {
            chatBodyContainer.current.addEventListener("scroll", paginate);
        };
        const clean = chatBodyContainer.current;
        return () => {
            clean.removeEventListener("scroll", paginate);  
        };
    }, [firstRender, limitReached]);


    useEffect(() => {
        if (limitReached !== dispatchMessages[roomID]?.limitReached) {
            setLimitReached(Boolean(dispatchMessages[roomID]?.limitReached));
        } 
    }, [dispatchMessages[roomID]], limitReached);

    useLayoutEffect(() => {
        if (messages.length > 0 && paginating.current) {
            if (paginating.current && messages.length > prevMessages.current?.length) {
                chatBodyContainer.current.scrollTop = chatBodyContainer.current.scrollHeight - prevScrollHeight.current;
                paginating.current = false;
                setPaginateLoader(false);
            };
        };
    }, [messages]);

    useEffect(() => {
        if (messages.length > 0) {
            if (!firstRender && chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight !== 0) {
                chatBodyContainer.current.scrollTop = chatBodyContainer.current.scrollHeight;
                setTimeout(() => {
                    const node = document.querySelector(".chat .chat__lastMessage");
                    if (node) {
                        node.style.animation = "none";
                        node.style.opacity = "1";
                    };
                    setTimeout(() => {
                        setFirstRender(true);
                    }, 200);
                }, 50); 
            } else {
                if (!paginating2.current) {
                    scrollChatBody();
                };
            };
        }
    }, [messages]);

    function listenToImg(docID) {
        return db.collection("rooms").doc(roomID).collection("messages").doc(docID).onSnapshot(doc => {
            const {imageUrl} = doc.data();
            if (imageUrl !== "uploading") {
                dispatch({
                    type: "update_media",
                    roomID: roomID,
                    id: docID,
                    data: {imageUrl}
                });
                mediaSnap.current = mediaSnap.current.filter(cur => {
                    if (cur.id !== docID) {
                        return true;
                    }
                    cur.snap();
                    return false;
                });
            };
        });
    };

    function listenToAudio(docID) {
        const s = db.collection("rooms").doc(roomID).collection("messages").doc(docID).onSnapshot(doc => {
            const {audioUrl, audioPlayed} = doc.data();
            if (audioUrl !== "uploading" || audioPlayed === true) {
                dispatch({
                    type: "update_media",
                    roomID: roomID,
                    id: docID,
                    data: {
                        audioUrl,
                        audioPlayed
                    }
                });
            };
            if (audioUrl !== "uploading" && audioPlayed === true) {
                mediaSnap.current = mediaSnap.current.filter(cur => {
                    if (cur.id !== docID) {
                        return true;
                    };
                    cur.snap();
                    return false;
                });
            }
        });
        return s;
    };

    useEffect(() => {
        return () => {
            dispatch({type: "set_audio_false", id: roomID});
        };
    }, [roomID]);

    useEffect(() => {
        if (messages.length > 0 && firstRender && !mediaChecked.current) {
            messages.forEach(cur => {
                if (cur.imageUrl === "uploading") {
                    const x = listenToImg(cur.id);
                    mediaSnap.current.push({
                        snap: x,
                        id: cur.id,
                    });
                } else if (cur.audioUrl === "uploading" || cur.audioPlayed === false) {
                    const x = listenToAudio(cur.id);
                    mediaSnap.current.push({
                        snap: x,
                        id: cur.id,
                    });
                };
            });
            mediaChecked.current = true;
        } else if (messages.length > prevMessages.current.length && firstRender && mediaChecked.current) {
            let init = 0;
            let stop = messages.length - prevMessages.length;
            if (prevMessages.current[0]?.id === messages[0].id) {
	            init = prevMessages.current.length;
	            stop = messages.length;
            }
            for (var i = init; i < stop; i++) {
                if (messages[i].imageUrl === "uploading") {
                    const x = listenToImg(messages[i].id);
                    mediaSnap.current.push({
                        snap: x,
                        id: messages[i].id,
                    });
                } else if (messages[i].audioUrl === "uploading" || messages[i].audioPlayed === false) {
                    const x = listenToAudio(messages[i].id);
                    mediaSnap.current.push({
                        snap: x,
                        id: messages[i].id,
                    });
                }; 
            };
        };
    }, [messages, firstRender]);

    useEffect(() => {
        return () => {
            mediaSnap.current.forEach(cur => cur.snap());
            setFirstRender(false)
        };
    }, [roomID]);

    useEffect(() => {
        paginating2.current = paginating.current;
        prevMessages.current = [...messages];
    }, [messages]);

    useEffect(() => {
        if (roomID && !deleting) {
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
    }, [roomID, deleting]);

    useEffect(() => {
        if (src !== "") {
            const width = document.querySelector('.mediaPreview img').clientWidth;
            const height = document.querySelector('.mediaPreview img').clientHeight;
            setRatio(height / width);
        }
    }, [src])

    useEffect(() => {
        setClientWidth(document.querySelector('.chat__body--container').clientWidth)
    }, []);
    //window
    useEffect(() => {
        if (animState === "entering" && page.width <= 760) {
            setTimeout(() => {
                document.querySelector(".chat").classList.add('chat-animate');
            }, 0)
        } else if (animState === "entered" && state?.name && page.width <= 760) {
            setTimeout(() => {
                document.querySelector('.sidebar').classList.remove('side');
            }, 50)
        } else if (animState === "exiting" && page.width <= 760 ) {
            setTimeout(() => {
                document.querySelector(".chat").classList.remove('chat-animate');
                setTimeout(() => {
                    document.querySelector('.sidebar').classList.add('side');
                }, 10)
            }, 0)
        }
    }, [animState])

    useEffect(() => {
        if (!location.state && roomID) {
            const userID = roomID?.replace(user.uid, "");
            db.collection("users").doc(userID).get().then(doc => {
                const data = doc.data();
                setState(data?.name ? {
                    name: data.name,
                    photoURL: data.photoURL,
                    userID,
                } : {
                        userID,
                    })
            })
        } else {
            setState(location.state)
        }
    }, [location.state, roomID])

    useEffect(() => {
        if (state?.userID) {
            db.collection("users").doc(state.userID).onSnapshot(doc => {
                if (doc.data()?.token) {
                    setToken(doc.data().token);
                };
            });
        };
    }, [state]);

    useEffect(() => {
        if (roomID && state?.userID) {
            var h = db.collection("rooms").doc(roomID).onSnapshot(snap => {
                if (snap.data()) {
                    setTyping(snap.data()[state.userID]);
                }
            })
        }

        return () => {
            if (h) h();
        }
    }, [roomID, state])

    useEffect(() => {
        if (roomID) {
            var z = db.collection("rooms").doc(roomID).onSnapshot(snap => {
                setSeen(snap.data()?.seen);
            })
        }

        return () => {
            if (z) {
                z();
            }
        }
    }, [roomID])

    //setSender
    //window
    useEffect(() => {
        var a = () => {
            const nodeArr = Array.from(document.querySelectorAll('.chat__message'));
            const height = outerHeight(nodeArr[nodeArr.length - 1]) + outerHeight(nodeArr[nodeArr.length - 2]) + outerHeight(nodeArr[nodeArr.length - 3]) + outerHeight(nodeArr[nodeArr.length - 4]);
            const lastMHeight = height < page.height / 2 ? height : page.height / 2;
            if (chatBodyContainer.current?.scrollTop <= (chatBodyContainer.current?.scrollHeight - chatBodyContainer.current?.offsetHeight - lastMHeight)) {
                setScrollArrow(true)
            } else {
                setScrollArrow(false)
            }
            const scrollTop = Math.round(chatBodyContainer.current.scrollTop);
            const scrollHeight = chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight;
            if ((scrollTop === scrollHeight || scrollTop + 1 === scrollHeight || scrollTop - 1 === scrollHeight) && (chatBodyRef.current.style.opacity === "0" || chatBodyRef.current.style.opacity === "")) {
                setTimeout(() => {
                	if (chatBodyRef.current) {
                		chatBodyRef.current.style.opacity = "1";
                	}
                }, animState === "entering" ? 350 : 50)
            }
            if (messages.length > 0) {
                if (chatBodyContainer.current.scrollTop > chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight - 180
                    && state.userID && !seen && messages[messages.length - 1].uid !== user.uid) {
                    db.collection("rooms").doc(roomID).set({
                        seen: true,
                    }, { merge: true });
                }
                if (chatBodyContainer.current.scrollTop > chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight - 180
                    && state.userID) {
                    db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                        unreadMessages: 0,
                    }, { merge: true });
                };
            };
        };
        chatBodyContainer.current.addEventListener('scroll', a);
        const ref = chatBodyContainer.current;

        return () => {
            ref.removeEventListener("scroll", a)
        }
    }, [messages, state, user.uid, roomID, seen]);


    //setting seen and unreadMessages when chat is unscrollable
    useEffect(() => {
        if (messages.length > 0) {
            if (chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight === 0 && messages[messages.length - 1].uid !== user.uid) {
                db.collection("rooms").doc(roomID).set({
                    seen: true,
                }, { merge: true });
            };
        };
    },[messages]);

    useEffect(() => {
		if (messages.length > 0) {
            if (chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight === 0
                && state.userID) {
                db.collection("users").doc(user.uid).collection("chats").doc(roomID).set({
                    unreadMessages: 0,
                }, { merge: true });
            }
        }
    }, [messages, state]);

    useEffect(() => {
        if (dispatchMessages[roomID]?.messages) {
            setMessages(dispatchMessages[roomID].messages);
        };
    }, [dispatchMessages[roomID]]);

    useEffect(()=>{
        let texts = document.querySelectorAll('.chat__message--message');
        if(texts.length>0){
            // let text = texts[0].children[1];
            texts.forEach((text,index)=>{
                if(text.innerHTML!="" && text.children.length<1){
                    let expression = /(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?/gi;
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
                        // texts[index].style.color = 'white';
                    }
                    else texts[index].innerHTML = ans;
                        if (chatBodyContainer.current.scrollTop > chatBodyContainer.current.scrollHeight - chatBodyContainer.current.offsetHeight - 120) {
                            chatBodyContainer.current.scrollTop = chatBodyContainer.current.scrollHeight;
                        };
                    // }
                }
            });
        }
            
    },[messages]);
    //window
    const widthRatio = 0.7;
    
    return (
        <>
        <div style={!roomID ? { display: "none"} : {}} ref={chatAnim} className="chat">
            <div style={{
                height: page.height,
            }} className="chat__background">

            </div>
            <div className="chat__header">
                {page.width <= 760 ?
                    <IconButton onClick={() => setTimeout(() => history.goBack(), 150)}>
                        <ArrowBack />
                        <div className="avatar__container">
                            <Avatar src={state?.photoURL} />
                            {roomsData[roomID]?.onlineState === "online" ? <div className="online"></div> : null}  
                        </div>
                        
                    </IconButton>
                : 
                    <div className="avatar__container">
                        <Avatar src={state?.photoURL} />
                        {roomsData[roomID]?.onlineState === "online" ? <div className="online"></div> : null} 
                    </div>
                }
                <div className="chat__header--info">
                    <h3 style={page.width <= 760 ? {width: page.width - 165 } : {}}>{state?.name} </h3>
                    <p style={page.width <= 760 ? {width: page.width - 165 } : {}}>{typing === "recording" ? "Recording ..." : typing ? "Typing ..." : messages?.length > 0 ? "Seen at " + messages[messages.length - 1]?.timestamp : ""} </p>
                </div>

                <div className="chat__header--right">
                <Snackbar
                    anchorOrigin={{ vertical:'top', horizontal:'right' }}
                    open={snackOpen}
                    onClose={()=>setSnackOpen(false)}
                    style = {{zIndex:999}}
                    message="Meet link copied to clipboard!"
                    // key={vertical + horizontal}
                    autoHideDuration={2000}
                />
                    <Tooltip title = "Start video conference" placement = "bottom" arrow>
                        <IconButton onClick = {createMeet}>
                            <VideocamIcon/>
                        </IconButton>
                    </Tooltip>
                    <input id="attach-media" style={{ display: "none" }} accept="image/*" type="file" onChange={handleFile} />
                    <Tooltip title = "Attach media" placement = "bottom" arrow>
                    <IconButton>
                        <label style={{ cursor: "pointer", height: 24 }} htmlFor="attach-media">
                            <AddPhotoAlternate />
                        </label>
                    </IconButton>
                    </Tooltip>
                    {/* <Tooltip title = "Options" placement="bottom" arrow>
                        <IconButton aria-controls="menu" aria-haspopup="true" onClick={event => setOpenMenu(event.currentTarget)}>
                            <MoreVert />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={openMenu}
                        id={"menu"}
                        open={Boolean(openMenu)}
                        onClose={() => setOpenMenu(null)}
                        keepMounted
                    >
                        <MenuItem onClick={deleteRoom}>Delete Room</MenuItem>
                    </Menu> */}
                </div>
            </div>

            <div className="chat__body--container" ref={chatBodyContainer}>
                <div className="chat__body" ref={chatBodyRef}>
                    <div 
                        className="loader__container paginateLoader"
                        style={{
                            height: !limitReached ? 70 : 30,
                        }}
                    >
                        {paginateLoader && !limitReached ? <CircularProgress /> : null}
                    </div>
                    {messages.map((message, i, messageArr) => {
                        const style = message.imageUrl ? {
                            marginBottom: !messageArr[i + 1] ? 0 : message.uid !== messageArr[i + 1].uid ? 30 : 8,
                            width: clientWidth * widthRatio + 20,
                            maxWidth: 320,
                        } : {
                                marginBottom: !messageArr[i + 1] ? 0 : message.uid !== messageArr[i + 1].uid ? 30 : 8,
                                width: clientWidth * widthRatio + 20,
                                maxWidth: 320,
                            }  
                        return (
                            <div style={style} ref={i === messages.length - 1 && !(seen && messages[messages.length - 1].uid === user.uid) ? lastMessageRef : null} key={message.id} className={`chat__message ${message.uid === user.uid && "chat__reciever"} ${i === messages.length - 1 ? "chat__lastMessage" : ""}`}>
                                <span className="chat__name">
                                    {message.name}
                                </span>
                                {message.imageUrl === "uploading" ?
                                    <div
                                        style={{
                                            width: clientWidth * widthRatio,
                                            height: message.ratio <= 1 ?
                                                    clientWidth * widthRatio > 300 ?
                                                        300 * message.ratio : clientWidth * widthRatio * message.ratio :
                                                    clientWidth * widthRatio < 300 ? clientWidth * widthRatio : 300,
                                        }}
                                        className="image-container"
                                    >
                                        <div className="image__container--loader">
                                            <CircularProgress style={{ width: page.width <= 760 ? 40 : 80, height: page.width <= 760 ? 40 : 80 }} />
                                        </div>
                                    </div>
                                    : message.imageUrl ?
                                        <div                                       	
                                            className="image-container"
                                            style={{
                                                width: clientWidth * widthRatio,
                                                height: message.ratio <= 1 ?
                                                        clientWidth * widthRatio > 300 ?
                                                            300 * message.ratio : clientWidth * widthRatio * message.ratio :
                                                        clientWidth * widthRatio < 300 ? clientWidth * widthRatio : 300,
                                            }}
                                        >
                                            <Link  to={{
                                            	pathname: match.url + "/image",
                                            	state: state,
                                            }}>
                                                <img onClick={(e) => clickImagePreview(e, message.imageUrl, message.ratio)} src={message.imageUrl} alt="" />
                                            </Link>
                                        </div>
                                        : null}
                                {message.audioName ?
                                    <AudioPlayer sender={message.uid === user.uid} roomID={roomID} animState={animState} setAudioID={setAudioID} audioID={audioID} id={message.id} audioUrl={message.audioUrl} audioPlayed={message.audioPlayed} />
                                : <span className="chat__message--message">{message.message}</span>}
                                <span className="chat__timestamp">
                                    {message.timestamp}
                                </span>
                            </div>
                        )
                    })}
                    {messages.length > 0 ?
                        <CSSTransition
                            in={seen && messages[messages.length - 1].uid === user.uid}
                            timeout={200}
                            classNames="seen-animate"
                            appear={true}
                        >
                            <p className="seen" >
                                <p><span>Seen <DoneAllRounded /></span></p>
                            </p>
                        </CSSTransition>
                    : null}
                </div>
            </div>
            {src !== "" ? <MediaPreview close={close} mediaPreview={mediaPreview} setSRC={setSRC} setImage={setImage} imageSRC={src} /> : null}

            <ChatFooter 
                input={input} 
                handleFocus={handleFocus} 
                change={change} 
                sendMessage={sendMessage} 
                setFocus={setFocus}
                image={image}
                focus={focus}
                state={state}
                token={token}
                roomID={roomID} 
                setAudioID={setAudioID}
            />
            <div></div>
            				
            <CSSTransition
                in={firstRender && scrollArrow && !sendAnim}
                classNames="scroll"
                timeout={310}
                unmountOnExit
            >
                <div className="scroll" onClick={() => 
                    anime({
                        targets: chatBodyContainer.current,
                        scrollTop: chatBodyContainer.current.scrollHeight,
                        duration: 1000,
                        easing: "linear",
                    })}
                >
                    <ArrowDownward style={{
                        width: 22,
                        height: 22,
                        color: "black",
                    }} />
                    {unreadMessages ? <div><span>{unreadMessages}</span></div> : null}
                </div>
            </CSSTransition>
            {deleting ?
                <div className="chat__deleting">
                    <CircularProgress />
                </div> : null
            }
        </div>
        <TransitionGroup component={null}>
            <Transition
                timeout={{
                    appear: 310,
                    enter: 310,
                    exit: 410,
                }}
                classNames="page"
                key={location.pathname}
            >
                {animState => (
                    <Route path={match.url + "/image"} location={location}>
                        <ImagePreview
                            imagePreview={imagePreview}
                            animState={animState}
                        />
                    </Route>
                )}  
            </Transition>
        </TransitionGroup>
        </>
    )
}

export default memo(Chat);
