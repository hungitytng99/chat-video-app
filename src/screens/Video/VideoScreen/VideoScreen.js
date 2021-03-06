import React, { useContext, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams, useRouteMatch } from 'react-router-dom';
import { SocketContext } from '../../../context/socket';
import Peer from 'peerjs';
import "./VideoScreen.sass"
import Camera from '../Camera/Camera';

function VideoScreen() {
    let { idCall, fromId, fromUserName, toId, toUserName } = useParams();
    // src 
    // autoPlay
    const myVideo = useRef(null);
    const userVideo = useRef(null);
    const connectionRef = useRef(null);
    const buttonCall = useRef(null);
    const getMySocketId = () => {
        if (sessionStorage.getItem("userName") === fromUserName) {
            return fromId;
        } else {
            return toId;
        }
    }
    const currentSocketId = getMySocketId();

    const getCallerSocketId = () => {
        if (sessionStorage.getItem("userName") === toUserName) {
            return fromId;
        } else {
            return toId;
        }
    }

    useEffect(() => {
        const peer = new Peer(currentSocketId);
        peer.on('call', (call) => {
            var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.moz.GetUserMedia;
            getUserMedia({ video: true, audio: true }, (mediaStream) => {

                myVideo.current.srcObject = mediaStream;
                myVideo.current.play();
                call.answer(mediaStream);
                call.on('stream', remoteStream => {
                    userVideo.current.srcObject = remoteStream;
                });
            })
        });

        connectionRef.current = peer;
    }, [])

    const call = (remotePeerId) => {
        var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        getUserMedia({ video: true, audio: true }, (mediaStream) => {
            myVideo.current.srcObject = mediaStream;

            const call = connectionRef.current.call(remotePeerId, mediaStream);
            call.on('stream', remoteStream => {
                console.log("Set call stream");
                userVideo.current.srcObject = remoteStream;
            });
        })
    }

    useEffect(() => {
        setTimeout(() => {
            call(getCallerSocketId());
        }, 2000);
    },[]);

    return (
        <div id="video-grid">
            <button onClick={() => {
                call(getCallerSocketId());
            }}>Refresh</button>
            <div className="video">
                <video muted ref={myVideo} autoPlay style={{ width: "300px" }} />
            </div>
            <div className="video">
                <video ref={userVideo} autoPlay style={{ width: "300px" }} />
            </div>
        </div>
    );
}

export default VideoScreen;