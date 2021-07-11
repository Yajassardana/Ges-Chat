import scalePage from "./scalePage";

export const initialState = {
    user: null,
    path: "",
    pathID: "",
    dispatchMessages: {},
    audioID: null,
    roomsData: {},
    page: scalePage(),
    dispMessSafe : false,
}

export const  actionTypes = {
    SET_USER: "SET_USER",
    SET_MESSAGES : "SET_MESSAGES",
}

const reducer = (state, action) => {
    switch (action.type) {
        case "set_scale_page" :
            return {
                ...state,
                page: action.page
            }
        case actionTypes.SET_USER :
            return {
                ...state,
                user: action.user
            }
        case "SET_PATH" :
            return {
                ...state, 
                path: action.path
            }
        case "set_path_id" :
            return {
                ...state,
                pathID: action.id
            }
        case actionTypes.SET_MESSAGES :
            const dispatchMessages = state.dispatchMessages;
            if (action.update) {
                if (dispatchMessages[action.id].messages) {
                    if (dispatchMessages[action.id].messages.length === 0) {
                        if (action.messages.length > 0) {
                            dispatchMessages[action.id] = {
                                messages: action.messages, 
                                limitReached: dispatchMessages[action.id].limitReached,
                                firstMessageID: dispatchMessages[action.id].firstMessageID,
                                audio: state.pathID === action.id,
                            };
                        }  
                    } else if (dispatchMessages[action.id].messages.length > 0 && action.messages.length === 0) {
                        dispatchMessages[action.id] = {
                            messages: [], 
                            limitReached: true,
                            firstMessageID: undefined,
                            audio: false,
                        };
                    } else {
                        const s = dispatchMessages[action.id].messages.length - action.messages.length;
                        var isSame = s === 0 ? false : true;
                        if (s >= 0) {
                            for (var i = 0; i < action.messages.length - 2; i++) {
                                isSame = action.messages[i].id === dispatchMessages[action.id].messages[s + i + 1].id;
                                if (!isSame) {
                                    break;
                                }
                            }
                        } else {
                            for (i = 0; i < dispatchMessages[action.id].messages.length - 2; i++) {
                                isSame = action.messages[i].id === dispatchMessages[action.id].messages[i].id;
                                if (!isSame) {
                                    break;
                                };
                            };
                        };
                        if (isSame) {
                            var arr;
                            if (s >= 0) {
                                arr = [...dispatchMessages[action.id].messages.slice(0, s + 1), ...action.messages];
                            } else {
                                arr = [...action.messages]; 
                            }
                            dispatchMessages[action.id] = {
                                messages: arr, 
                                limitReached: dispatchMessages[action.id].limitReached,
                                firstMessageID: dispatchMessages[action.id].firstMessageID,
                                audio: state.pathID === action.id && isSame,
                            };
                        };
                    };
                };
                return {
                    ...state,
                    dispatchMessages,
                };
            };
            dispatchMessages[action.id] = {
                messages: action.messages, 
                limitReached: dispatchMessages[action.id].firstMessageID === "no id" ? true : action.messages[0]?.id === dispatchMessages[action.id].firstMessageID,
                firstMessageID: dispatchMessages[action.id].firstMessageID,
                audio: false
            }
            return {
                ...state,
                dispatchMessages
            }
        case "set_audio_false" : 
            const newMessages = state.dispatchMessages;
            newMessages[action.id] = {
                ...newMessages[action.id],
                audio: false
            };
            return {
                ...state,
                dispatchMessages: newMessages
            };
        case "set_firstMessage" :
            const s = state.dispatchMessages;
            if (s[action.id]) {
                s[action.id].firstMessageID = action.firstMessageID;
            } else {
                s[action.id] = {
                    firstMessageID: action.firstMessageID
                };
            };
            return {
                ...state,
                dispatchMessages: s,
                dispMessSafe : true,
            };
        case "update_media" :
            const f = state.dispatchMessages;
            const updatedMessages = f[action.roomID].messages;
            const e = updatedMessages.findIndex(cur => cur.id === action.id);
            updatedMessages[e] = {
                ...updatedMessages[e],
                ...action.data
            };
            f[action.roomID] = {
                messages: updatedMessages, 
                limitReached: f[action.roomID].limitReached,
                firstMessageID: f[action.roomID].firstMessageID
            }
            return {
                ...state,
                dispatchMessages: f,
            }
        case "add_rooms_data" :
            const newRoomsData = {...state.roomsData};
            newRoomsData[action.roomID] = {
                lastMessageListener: action.lastMessageListener,
                onlineStatelistener: action.onlineStatelistener,
                roomID: action.roomID
            }
            return {
                ...state,
                roomsData: newRoomsData
            }
        case "update_rooms_data" :
            const roomsData = {...state.roomsData};
            if (action.data !== roomsData[action.roomID][action.dataType]) {
                roomsData[action.roomID] = {
                    ...roomsData[action.roomID],
                    [action.dataType] : action.data
                }
                return {
                    ...state,
                    roomsData: roomsData
                }
            }
            return state;
        default: 
            return state;
    }
}

export default reducer;