import React, { useState, useRef } from "react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import History from "./History";
import './App.css';

const SERVER_URL = "http://localhost:3001";
const RECORD_TIME_SLICE = 100; // 100ms

function App() {
  const [isTalking, setIsTalking] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const socketRef = useRef();
  const audioRef = useRef();

  const startTalking = async () => {
    socketRef.current = io(SERVER_URL);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioRef.current = new MediaRecorder(stream);
    audioRef.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        const audioBlob = e.data;
        socketRef.current.emit("clientAudio", audioBlob);
      }
    };

    socketRef.current.on('serverAudio', async (data) => {
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(data);

      const bufferSource = audioContext.createBufferSource();
      bufferSource.buffer = audioBuffer;
      bufferSource.connect(audioContext.destination);
      bufferSource.start();
    });

    socketRef.current.on('message', (message) => {
      message['key'] = uuidv4();
      setMessageList(oldMessageList => [...oldMessageList, message]);
    });

    audioRef.current.start(RECORD_TIME_SLICE);
    setIsTalking(true);
  };

  const stopTalking = () => {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setIsTalking(false);
  };

  return (
    <div className="App">
      <header>
        <h1>Talk with GPT</h1>
        {!isTalking ? (
          <button onClick={startTalking}>Start</button>
        ) : (
          <button onClick={stopTalking}>Stop</button>
        )}
      </header>
      <div>
        <History items={messageList} />
      </div>
    </div>
  );
}

export default App;