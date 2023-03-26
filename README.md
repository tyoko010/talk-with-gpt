# Talk with GPT

Talk with GPT is a sample program that allows you to have a conversation with OpenAI's GPT model using your voice through your web browser. This project is built using Node.js.

## Architecture
```
┌───────┐              ┌─────────┐       ┌──────────────┐
│       │localhost:3000│ Client  │       │Google        │
│Browser├──────────────┤         │   ┌───┤Text to Speech│
│       │   html,js,css│React App│   │   │Speech to Text│
└────┬──┘              └─────────┘   │   └──────────────┘
     │                               │
     │                 ┌─────────┐   │   ┌──────────────┐
     │   localhost:3001│ Server  │   │   │OpenAI        │
     └─────────────────┤         ├───┴───┤              │
             Audio Data│Socket.io│       │gpt-3.5       │
                       └─────────┘       └──────────────┘
```

## How to run

### Server side

Before running the server, you need to obtain API keys for both OpenAI and Google. Once you have obtained the keys, set them as environment variables by running the following commands in your terminal.

```bash
export OPENAI_API_KEY=<your OpenAI API key>
export GOOGLE_APPLICATION_CREDENTIALS=<path to your Google JSON key file>
```

After setting the environment variables, navigate to the server directory and start the server.

```bash
cd server
node index.js
```

### Client side

Navigate to the client directory and run the following command.

```bash
cd client
npm start
```

This will start the client and open the application in your default web browser.