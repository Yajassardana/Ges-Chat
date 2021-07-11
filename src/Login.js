import {memo} from 'react';
import { Button } from '@material-ui/core';
import { auth, provider } from './firebase';
import './Login.css'
import logo from  './logo.png'
function Login() {
    const signIn = () => {
        auth.signInWithPopup(provider).catch(e => alert(e.message))
    }

    return (
        <div className="login">
            <div className="login__container">
                <img
                    src={logo}
                    alt=""
                />
                <div className="login__text">
                    <h1>Sign in to Ges'Chat</h1>
                </div>

                <Button onClick={signIn}>
                    Sign in with Google
                </Button>
            </div>
        </div>
    )
}

export default memo(Login)