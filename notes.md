## The frontend code which is not converting the speech in frontend
```javascript
"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Info, Github, MicOff } from "lucide-react";
import EmotionRecorder from "@/components/emotion-recorder";
import { io, Socket } from "socket.io-client";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [response, setResponse] = useState<string>("");
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:5050");

    newSocket.on("connect", () => {
      console.log("✅ Socket.IO Connected");
    });

    newSocket.on("response", (data: any) => {
      console.log("📨 AI Response received");

      let parsedData: { text?: string; audio?: string } = {};
      if (typeof data === "string") {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          parsedData = { text: data };
        }
      } else {
        parsedData = data;
      }

      setResponse(parsedData.text || "No text response");
      speakText(parsedData.text || "");
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Socket.IO Disconnected");
    });

    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();

        reader.onloadend = () => {
          if (socket) {
            console.log("✅ Sending audio data...");
            const audioBase64 = reader.result?.toString().split(",")[1];
            socket.emit("message", JSON.stringify({ audio: audioBase64, type: "audio_data" }));
          } else {
            console.error("❌ Socket not initialized");
          }
        };

        reader.readAsDataURL(audioBlob);
        setIsRecording(false);
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("❌ Error accessing microphone:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const speakText = (text: string) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center text-primary">
            <Mic className="h-6 w-6" />
            <span className="text-xl font-bold">EmotionVox</span>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Link href="#about">
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4 mr-2" /> About
                </Button>
              </Link>
              <Link href="https://github.com/uttamseervi/augment-ai-hackathon" target="_blank">
                <Button variant="ghost" size="sm">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Detect Emotions in Your Voice
            </h1>
            <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
              Our AI-powered tool analyzes your speech to identify emotions in real-time.
            </p>
            <div className="space-x-4">
              {!isRecording ? (
                <Button size="lg" className="gap-2" onClick={startRecording}>
                  <Mic className="h-4 w-4" /> Start Recording
                </Button>
              ) : (
                <Button size="lg" className="gap-2 bg-red-500 hover:bg-red-600" onClick={stopRecording}>
                  <MicOff className="h-4 w-4" /> Stop Recording
                </Button>
              )}
            </div>

            {response && (
              <div className="mt-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg max-w-[42rem] w-full">
                <h3 className="font-medium mb-2">AI Response:</h3>
                <p className="text-lg">{response}</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <section id="demo" className="container py-8 md:py-12 lg:py-16">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">Speech Emotion Analyzer</h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Speak into your microphone and our algorithm will analyze your voice to detect emotions.
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[64rem] md:grid-cols-1 lg:max-w-[64rem]">
          <EmotionRecorder />
        </div>
      </section>

    </div>
  );
}

```



### The backend 
```python

import eventlet
eventlet.monkey_patch()  # Fix WebSocket issues

import json
import base64
import os
import tempfile
import time
import requests
import google.generativeai as genai
from flask import Flask
from flask_socketio import SocketIO, emit
from elevenlabs.client import ElevenLabs

# Flask App & WebSockets
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Set API Keys
ASSEMBLY_AI_KEY = "e90167029f9d49e88511ee744d519ccc"
ELEVENLABS_KEY = "sk_0bc02ae2b14a1940ce7bade6c490df0ba84f946938d532d6" 
GENAI_API_KEY = "AIzaSyBAwZanZoYfQFZBPAtPABCZroGUhlxUEs8"

# Configure AI Models
genai.configure(api_key=GENAI_API_KEY)
client_elevenlabs = ElevenLabs(api_key=ELEVENLABS_KEY)

# AssemblyAI Speech-to-Text
def transcribe_audio(audio_base64):
    """Transcribes audio using AssemblyAI API."""
    # Decode base64 audio to file
    audio_bytes = base64.b64decode(audio_base64)
    
    # Create temp file
    temp_dir = tempfile.gettempdir()
    temp_file_path = os.path.join(temp_dir, f"audio_{int(time.time())}.webm")
    
    with open(temp_file_path, "wb") as f:
        f.write(audio_bytes)
    
    print(f"✅ Saved audio to {temp_file_path}")
    
    try:
        # Upload to AssemblyAI
        headers = {
            "authorization": ASSEMBLY_AI_KEY,
            "content-type": "application/json"
        }
        
        # Upload the audio file
        with open(temp_file_path, "rb") as f:
            response = requests.post(
                "https://api.assemblyai.com/v2/upload",
                headers={"authorization": ASSEMBLY_AI_KEY},
                data=f
            )
        
        if response.status_code != 200:
            print(f"❌ Upload failed: {response.text}")
            return "I couldn't understand the audio."
            
        upload_url = response.json()["upload_url"]
        
        # Start transcription
        response = requests.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers,
            json={
                "audio_url": upload_url,
                "sentiment_analysis": True  # Enable emotion analysis
            }
        )
        
        transcript_id = response.json()["id"]
        
        # Poll for results
        polling_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
        
        while True:
            transcription_result = requests.get(polling_endpoint, headers=headers).json()
            
            if transcription_result["status"] == "completed":
                break
            elif transcription_result["status"] == "error":
                print(f"❌ Transcription error: {transcription_result}")
                return "There was an error processing your speech."
                
            print("⏳ Waiting for transcription to complete...")
            time.sleep(2)
        
        # Clean up temp file
        try:
            os.remove(temp_file_path)
        except:
            pass
            
        # Get the text and any sentiment analysis
        text = transcription_result["text"]
        sentiment = ""
        
        if "sentiment_analysis_results" in transcription_result and transcription_result["sentiment_analysis_results"]:
            sentiment = transcription_result["sentiment_analysis_results"][0]["sentiment"]
            sentiment_score = transcription_result["sentiment_analysis_results"][0]["confidence"]
            sentiment = f" (Detected emotion: {sentiment.capitalize()} with {sentiment_score:.0%} confidence)"
        
        return text + sentiment
        
    except Exception as e:
        print(f"❌ Transcription error: {str(e)}")
        return "I had trouble understanding you. Please try again."

# AI Model Function
def generate_ai_response(text):
    """Generates an AI response using Gemini AI."""
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"""
        The user said: "{text}"
        
        Please respond in a helpful, concise way. your task is just to talk to the user and go with the flow don't indulge in any emotional support just be . Keep your response under 3 sentences.
        """
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else "Sorry, I couldn't process that, please try again."
    except Exception as e:
        print(f"❌ Error generating AI response: {e}")
        return "I'm experiencing issues right now. Please try again later."

# WebSocket Connection Event
@socketio.on("connect")
def handle_connect():
    """Handles client connection."""
    print("🔌 Client connected!")
    emit("response", {"text": "Connected! Say something or start recording."})

# WebSocket Message Handling
@socketio.on("message")
def handle_message(data):
    """Handles incoming WebSocket messages."""
    print(f"📩 Received message")

    try:
        parsed_data = json.loads(data)
        
        # Check message type
        message_type = parsed_data.get("type", "text_data")
        
        if message_type == "audio_data" and "audio" in parsed_data:
            print("🎤 Processing audio data")
            audio_base64 = parsed_data.get("audio")
            
            # Transcribe audio to text
            text_input = transcribe_audio(audio_base64)
            print(f"🗣️ Transcription: {text_input}")
            
        else:
            # Handle text input
            text_input = parsed_data.get("text", "Hello!")
            print(f"💬 Text input: {text_input}")
            
    except json.JSONDecodeError:
        print("❌ Failed to parse JSON, treating as raw text.")
        text_input = data
        
    except Exception as e:
        print(f"❌ Error processing message: {e}")
        text_input = "Sorry, I couldn't understand that."

    # Generate AI Response
    ai_response = generate_ai_response(text_input)
    print(f"🤖 AI Response: {ai_response}")

    # Convert AI response to speech using ElevenLabs
    # try:
    #     print("🔊 Generating speech...")
    #     audio = client_elevenlabs.generate(
    #         text=ai_response, 
    #         voice="Rachel", 
    #         model="eleven_multilingual_v1"
    #     )

    #     # Convert binary audio to Base64
    #     audio_bytes = b"".join(audio)
    #     audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
    #     print("✅ Audio generated successfully")

    # except Exception as e:
    #     print(f"❌ Error generating audio: {e}")
    #     audio_base64 = None

    # Send Response
    response_data = {
        "text": ai_response,
        # "audio": audio_base64,
        "original_input": text_input
    }
    emit("response", response_data)

# Run Server
if __name__ == "__main__":
    print("🚀 Starting EmotionVox server at http://localhost:5050")
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, use_reloader=False)
```