import React, { useState, useRef } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:3001";
const RECORD_TIME_SLICE = 100; // 100ms

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const socketRef = useRef();
  const audioRef = useRef();

  const startRecording = async () => {
    socketRef.current = io(SERVER_URL);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioRef.current = new MediaRecorder(stream);
    audioRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        const audioBlob = e.data;
        socketRef.current.emit("audioData", audioBlob);
      }
    };
    audioRef.current.start(RECORD_TIME_SLICE);
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsRecording(false);
  };

  return (
    <div className="App">
      <h1>Speak with GPT</h1>
      {!isRecording ? (
        <button onClick={startRecording}>Start</button>
      ) : (
        <button onClick={stopRecording}>Stop</button>
      )}
    </div>
  );
}

export default App;