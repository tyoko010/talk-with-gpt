import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { SpeechClient } from "@google-cloud/speech";
import { PassThrough } from 'stream';

const PORT = process.env.PORT || 3001;

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("Server is running.");
});

const createRecognizeStream = () => {
  const request = {
    config:  {
      encoding: "WEBM_OPUS",
      sampleRateHertz: 48000,
      languageCode: "ja-JP",
    },
    interimResults: false,
  };

  return new SpeechClient()
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', data => {
      const transcript = data.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');
      console.log(`Transcript: ${transcript}`);
    });
};

io.on("connection", (socket) => {
  console.log("Client connected.");

  const audioStream = new PassThrough();
  const recognizeStream = createRecognizeStream();
  
  socket.on("audioData", (data) => {
    audioStream.write(data);
  });

  socket.on("disconnect", async () => {
    console.log("Client disconnected.");
    audioStream.end();
  });

  audioStream.pipe(recognizeStream);
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


