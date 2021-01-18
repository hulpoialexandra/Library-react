import React, { useContext, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonInput, IonLabel, IonLoading, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Redirect, RouteComponentProps } from "react-router";
import { getLogger } from "../core";
import { AuthContext } from './AuthProvider';

const log=getLogger('Login');

interface LoginState{
    username?:string;
    password?:string;
}


export const Login: React.FC<RouteComponentProps> =({history}) =>{
    const {isAuthenticated,isAuthenticating,login,authenticationError}=useContext(AuthContext);
    const[state,setState]=useState<LoginState>({});
    const {username,password}=state;
    const handleLogin=()=>{
        log('handle login');
        login?.(username,password);
    };
    log('render')
    if(isAuthenticated){
        return<Redirect to={{pathname:'/'}}/>
    }
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput placeholder="Username" value={username} onIonChange={e=>setState({
                    ...state,
                    username:e.detail.value||''
                })}/>
                <IonInput placeholder="Password" value={password} onIonChange={e=>setState({
                    ...state,
                    password:e.detail.value||''
                })}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError && (<div>{authenticationError.message||'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin}>Login</IonButton>
            </IonContent>
        </IonPage>
    )
}