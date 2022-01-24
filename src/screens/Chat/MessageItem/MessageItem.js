import React from 'react';
import './MessageItem.sass';

function MessageItem({ message, position = "left" }) {
    return (
        <div className='message-item'
            style={
                position === "left" ?
                    { justifyContent: "left" } :
                    { justifyContent: "right" }
            }
        >
            <div style={{ fontWeight: 'bold', marginRight: '8px' }}>{message?.userName}:
            </div>{message?.info}
        </div>
    );
}

export default MessageItem;