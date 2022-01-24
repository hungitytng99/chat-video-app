import React from 'react';
import { useEffect, useRef } from 'react/cjs/react.development';

function Camera({ stream }) {
    const cameraRef = useRef(null);
    useEffect(() => {
        cameraRef.current.srcObject = stream;
    }, [])
    return (
        <video
            ref={cameraRef}
            autoPlay
            style={{ width: "320px", height: "240px" }}>

        </video>
    );
}

export default Camera;