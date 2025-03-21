"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { Mic, Square } from "lucide-react";
import EmotionVisualizer from "./EmotionVisualizer";

export default function EmotionRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [modelResponse, setModelResponse] = useState<any>({});
  const [socket, setSocket] = useState<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [emotionData, setEmotionData] = useState<any>(null);
  const [recordingHistory, setRecordingHistory] = useState<any[]>([]);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    const newSocket = io("http://localhost:5050"); // Ensure it matches backend URL
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("✅ Socket.IO Connected"));

    newSocket.on("response", (data: any) => {
      console.log("📨 AI Response received:", data);

      if (data.model_response) {
        try {
          const parsedData = JSON.parse(data.model_response);
          console.log("Emotion data:", parsedData);
          console.log("Detected Mood:", parsedData.mood);

          const probabilities = parsedData.probabilities;
          console.log("Probabilities:", probabilities);

          if (probabilities) {
            const formattedEmotionData = Object.entries(probabilities).map(([name, value]) => ({
              name,
              value,
            }));
            
            formattedEmotionData.push({ name: "Neutral", value: 5 });
            setEmotionData(formattedEmotionData);
          } else {
            console.warn("⚠️ Probabilities data is missing or undefined");
            setEmotionData(null);
          }
        } catch (error) {
          console.error("❌ Failed to parse model_response:", error);
          setEmotionData(null);
        }
      } else {
        console.warn("⚠️ model_response is missing or undefined");
        setEmotionData(null);
      }
    });

    return () => {
      newSocket.disconnect(); // Cleanup on unmount
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
            socket.emit("onlyUser", JSON.stringify({ audio: audioBase64, type: "audio_data" }));
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
        audioStream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      <Card>
        <CardContent className="pt-6 flex flex-col items-center space-y-4">
          <Button
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            className="w-24 h-24 rounded-full"
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </Button>
          {!isRecording && <p className="text-center text-muted-foreground">Press the mic and start speaking</p>}
        </CardContent>
      </Card>
      {emotionData && 
      <div className="flex items-center justify-center flex-col">
        <h1 className="text-2xl font-semibold">Report while talking your-self</h1>
      <EmotionVisualizer emotionData={emotionData} recordingHistory={recordingHistory} />
      </div>
      }
    </div>
  );
}
