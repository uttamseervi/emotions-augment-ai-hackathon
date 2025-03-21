"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { io, Socket } from "socket.io-client";
import { Mic, Square } from "lucide-react";
import EmotionVisualizer from "./EmotionVisualizer";

export default function EmotionRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [emotionData, setEmotionData] = useState<any>(null);
  const [recordingHistory, setRecordingHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Define 10 hours in milliseconds for cleanup
  const TEN_HOURS_MS = 10 * 60 * 60 * 1000;

  // Load stored recording history from localStorage on component mount and remove old entries.
  useEffect(() => {
    const storedHistory = localStorage.getItem("recordingHistory");
    if (storedHistory) {
      const parsedHistory = JSON.parse(storedHistory);
      const now = Date.now();
      const filteredHistory = parsedHistory.filter((entry: any) => now - entry.time < TEN_HOURS_MS);
      setRecordingHistory(filteredHistory);
      localStorage.setItem("recordingHistory", JSON.stringify(filteredHistory));
    }
  }, []);

  useEffect(() => {
    const newSocket = io("https://emotion-backend-final-production.up.railway.app/"); // Ensure it matches your backend URL
    setSocket(newSocket);

    newSocket.on("connect", () => console.log("✅ Socket.IO Connected"));

    newSocket.on("response", (data: any) => {
      console.log("📨 AI Response received:", data);
      // When a response arrives, set loading to false.
      setLoading(false);

      if (data.model_response) {
        try {
          const parsedData = JSON.parse(data.model_response);
          console.log("Emotion data:", parsedData);
          console.log("Detected Mood:", parsedData.mood);

          const probabilities = parsedData.probabilities;
          console.log("Probabilities:", probabilities);

          if (probabilities) {
            const formattedEmotionData = Object.entries(probabilities).map(
              ([name, value]) => ({
                name,
                value,
              })
            );
            // Optionally, add "Neutral" if needed
            formattedEmotionData.push({ name: "Neutral", value: 5 });
            setEmotionData(formattedEmotionData);

            // Create a new recording history entry with current timestamp.
            const currentTime = Date.now();
            const timestamp = new Date(currentTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            const newEntry = { time: currentTime, timestamp, emotions: formattedEmotionData };

            setRecordingHistory((prevHistory) => {
              const updatedHistory = [...prevHistory, newEntry];
              localStorage.setItem("recordingHistory", JSON.stringify(updatedHistory));
              return updatedHistory;
            });
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
      newSocket.disconnect();
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      setIsRecording(true);
      setLoading(false); // Ensure loading is false when starting

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
            // Set loading to true until we receive a response.
            setLoading(true);
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
            {isRecording ? (
              <Square className="h-8 w-8" />
            ) : loading ? (
              "Loading..."
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </Button>
          {!isRecording && !loading && (
            <p className="text-center text-muted-foreground">Press the mic and start speaking</p>
          )}
        </CardContent>
      </Card>
      {emotionData && (
        <div className="flex items-center justify-center flex-col">
          <h1 className="text-2xl font-semibold">Report while talking yourself</h1>
          <EmotionVisualizer emotionData={emotionData} recordingHistory={recordingHistory} />
        </div>
      )}
    </div>
  );
}
