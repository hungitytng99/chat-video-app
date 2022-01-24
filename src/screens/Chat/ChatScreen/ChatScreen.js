import React, { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from '../../../context/socket';
import MessageItem from '../MessageItem/MessageItem';
import Modal from 'react-modal';
import "./ChatScreen.sass"
import { Link, useNavigate } from 'react-router-dom';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};
Modal.setAppElement("#root")

function ChatScreen() {
    const socket = useContext(SocketContext);
    const listUserTypingRef = useRef([]);
    const listUserRef = useRef([]);
    const callInfoRef = useRef({});

    const [listUser, setListUser] = useState(listUserRef.current);
    const [listUserTyping, setListUserTyping] = useState(listUserTypingRef.current);
    const [currentUserName, setCurrentUserName] = useState(sessionStorage.getItem("userName"));
    const [listMessage, setListMessage] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);
    let typingTimeout = useRef(null);
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        socket.emit('join', 'messageChannel');

        socket.on("receive a request call", function (data) {
            callInfoRef.current = data;
            setIsOpen(true);
        });
        socket.on("list message", function (data) {
            setListMessage(data);
        });
        socket.on("send list user", function (data) {
            if (listUserRef.current.length !== data.length) {
                listUserRef.current = data;
                setListUser(listUserRef.current);
            }
        });
        socket.on("user disconnected", function (data) {
            listUserRef.current = listUserRef.current.filter(user => user != data)
            setListUser(listUserRef.current);
            console.log('listUserRef.current: ', listUserRef.current);
        });
        socket.on("new message comming", function (data) {
            setListMessage(data);
        });
        socket.on("typing", function (data) {
            if (!listUserTypingRef.current.includes(data) && data != currentUserName) {
                listUserTypingRef.current.push(data)
                setListUserTyping([...listUserTypingRef.current]);
            }
            if (typingTimeout.current !== null) {
                clearTimeout(typingTimeout.current);
            }

            typingTimeout.current = setTimeout(() => {
                listUserTypingRef.current = [];
                setListUserTyping([]);
            }, 500)
        });

        socket.on("accept a call", function (data) {
            navigate(`/call/${data.idCall}/${data.fromUserName}/${data.fromId}/${data.toUserName}/${data.toId}`);
        });
    }, [])


    function handleTypeMessage(e) {
        setNewMessage(e.target.value);
    }

    function handleKeyPress(e) {
        if (e.code === "Enter") {
            handleSubmitMessage();
        } else {
            socket.emit("typing", currentUserName);
        }
    }

    function handleSubmitMessage() {
        setNewMessage("");
        socket.emit("new message", {
            userName: currentUserName,
            info: newMessage,
        });
    }

    useEffect(() => {
        if (listMessage.length > 0) {
            scrollToBottom();
        }
    }, [listMessage])

    useEffect(() => {
        if (sessionStorage.getItem("userName") === null) {
            const generateUserName = `User${Math.floor(Math.random() * 1000000)}`;
            sessionStorage.setItem("userName", generateUserName);
            setCurrentUserName(generateUserName);
        }
        if (sessionStorage.getItem("userName") !== null) {
            socket.emit("new user", sessionStorage.getItem("userName"));
        }
    }, [currentUserName]);


    function scrollToBottom() {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    function handleMakeACall(userName) {
        if (userName !== currentUserName) {
            socket.emit("request a call", {
                fromId: socket.id,
                fromUserName: currentUserName,
                toUserName: userName,
            });
        }
    }

    function handleAcceptCall() {
        socket.emit("accept a call", callInfoRef.current);
    }

    function closeModal() {
        setIsOpen(false);
        callInfoRef.current = {};
    }

    return (
        <div className='flex-center'>
            <div className="container">
                <div className="list-user">
                    <span className='header'>Danh sách user</span>
                    {listUser.map(user => {
                        return (
                            <div className="list-user__item"
                                style={user === currentUserName ? { fontWeight: 'bold' } : {}}
                                key={user}
                                onClick={() => handleMakeACall(user)}
                            >
                                {user}
                            </div>
                        )
                    })}
                </div>
                <div className="list-message">
                    <span className='header'>Tin nhắn</span>
                    <div className="list-message__box" >
                        {listMessage.length === 0 && <div>Chưa có tin nhắn</div>}
                        {listMessage.map((message, index) => {
                            return (<MessageItem key={index} message={message}
                                position={`${currentUserName === message?.userName ? "right" : "left"}`}
                            />);
                        })}
                        <div
                            style={{ float: "left", clear: "both" }}
                            ref={messagesEndRef}
                        >
                        </div>
                    </div>
                    <div className="list-message__typing">
                        <div className="list-user__typing-message">
                            {
                                listUserTyping.map((user, index) => {
                                    return <span key={user}>{index > 0 && ","}{user}</span>
                                })
                            }
                            {listUserTyping.length > 0 && <span> is typing...</span>}
                        </div>
                        <input
                            value={newMessage}
                            onChange={(e) => handleTypeMessage(e)}
                            onKeyDown={(e) => handleKeyPress(e)}
                            type="text"
                            placeholder="Enter message"
                        />
                        <button onClick={handleSubmitMessage}>SEND</button>
                    </div>
                </div>
            </div>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
            >
                <div className="call-request">
                    <div className="call-request__title">Accept call from {callInfoRef.current.fromUserName}</div>
                    <button onClick={handleAcceptCall}>Accept</button>
                    <button style={{ marginLeft: '8px' }} onClick={closeModal}>Cancel</button>
                </div>
            </Modal>
        </div>
    );
}

export default ChatScreen;