import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import { SpeechClient } from "@google-cloud/speech";
import { PassThrough } from 'stream';

import { Configuration, OpenAIApi } from "openai";

const PORT = process.env.PORT || 3001;

// Recognize speech with Google Cloud Speech API
const createRecognizeStream = (onTranscript) => {
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
      onTranscript(transcript);
    });
};

// Create a completion with OpenAI API
const createCompletion = async (message) => {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are an assistant bot that is expected to converse as a close friend. Please provide appropriate responses to the user in Japanese."},
      { role: "user", content: message},
    ],
    temperature: 0.5,
    max_tokens: 256,
  });
  return completion;
};

// Create a server with Express and Socket.io
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

io.on("connection", (socket) => {
  console.log("Client connected.");

  const audioStream = new PassThrough();
  const recognizeStream = createRecognizeStream(async (transcript) => {
    const completion = await createCompletion(transcript);
    console.log(`Completion: ${completion.data.choices[0].message.content}`);
  });
  
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


