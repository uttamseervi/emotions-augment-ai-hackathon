"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Info, Github, MicOff, BarChart as LucideBarChart } from "lucide-react";
import EmotionRecorder from "@/components/emotion-recorder";
import { io, Socket } from "socket.io-client";
import EmotionVisualizer from "@/components/EmotionVisualizer";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, Cell, ResponsiveContainer, XAxis, YAxis } from "recharts";

const EMOTION_COLORS: Record<string, string> = {
  happy: "#10b981",
  sad: "#6366f1",
  angry: "#ef4444",
  love: "#f59e0b",
  scared: "#8b5cf6",
  Neutral: "#64748b",
};

const getEmotionColor = (emotion: string): string => EMOTION_COLORS[emotion] || "#64748b";

export default function Home() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [modelResponse, setModelResponse] = useState<any>({});
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const [emotionData, setEmotionData] = useState<any>(null);
  const [recordingHistory, setRecordingHistory] = useState<any[]>([]);

  // Load stored recording history from localStorage on component mount
  useEffect(() => {
    const storedHistory = localStorage.getItem("recordingHistory");
    if (storedHistory) {
      setRecordingHistory(JSON.parse(storedHistory));
    }
  }, []);

  // New state for section selection using buttons
  const [selectedSection, setSelectedSection] = useState("section1");
  const deleteHistory = ()=>{
    localStorage.removeItem("recordingHistory");
    setRecordingHistory([]);
  }
  useEffect(() => {
    const newSocket = io("http://localhost:5050/");

    newSocket.on("connect", () => {
      console.log("✅ Socket.IO Connected");
    });

    newSocket.on("response", (data: any) => {
      console.log("📨 AI Response received:", data);
      setResponse(data.text || "No text response");
      speakText(data.text || "We are facing some issue right now.");
      
      // Once response is received, clear the loading state.
      setLoading(false);

      if (data.model_response) {
        try {
          const parsedData = JSON.parse(data.model_response); // ✅ Parse safely
          console.log("Emotion data:", parsedData);
          console.log("Detected Mood:", parsedData.mood);

          const probabilities = parsedData.probabilities;
          console.log("probabilites ", probabilities);

          if (probabilities) {
            // Convert probabilities object into the required array format
            const formattedEmotionData = Object.entries(probabilities).map(([name, value]) => ({
              name,
              value,
            }));

            // Optionally, add "Neutral" if needed
            formattedEmotionData.push({ name: "Neutral", value: 5 });

            setEmotionData(formattedEmotionData);
            console.log("Settted emotion data ", formattedEmotionData);

            // Create a new recording history entry with current timestamp
            const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            const newEntry = { timestamp, emotions: formattedEmotionData };

            // Update recordingHistory state and localStorage
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
          setEmotionData(null); // Handle parsing error gracefully
        }
      } else {
        console.warn("⚠️ model_response is missing or undefined");
        setEmotionData(null);
      }
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
      setLoading(false); // Ensure loading is false when starting recording

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
            // After stopping, set loading to true until we get a response.
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
    // Optionally, show a polite waiting message while loading is true.
    const politeStatements = [
      "Thank you so much for your patience! We’re almost there, and we truly appreciate your understanding while we make sure everything is perfectly prepared for you.",
      "You’re doing an amazing job waiting! We’re just about finished, and your patience means so much to us. Thank you for sticking with us as we wrap things up.",
      "We sincerely appreciate your patience during this time. Rest assured, we’re giving this our full attention to ensure that everything is done just right for you.",
      "Hang tight a little bit longer! The results are coming soon, and we’re grateful for your understanding as we finalize everything to make it as good as possible for you.",
      "We truly appreciate you waiting. Every detail is being carefully crafted to ensure everything is perfect when it’s ready, and we thank you for being so patient with us.",
      "We’re just putting the finishing touches on everything, and we couldn’t do it without your patience. Thanks for sticking with us as we complete the final steps of this process.",
      "Your patience means so much to us! We are just about there, and we appreciate you waiting while we make sure everything is exactly how it should be. We’ll be with you shortly.",
      "You’ve been amazing, and we’re almost done! Thank you so much for your patience – we’ll have everything ready for you shortly, and we can’t wait for you to experience it.",
      "Good things really do take time, and we’re ensuring that your experience is absolutely worth the wait. Your patience has been incredible, and we truly appreciate it.",
      "You’re incredibly patient, and we want to thank you from the bottom of our hearts. We’re wrapping things up now, and we’ll be ready for you in no time at all.",
      "We can’t thank you enough for your patience! We’re taking extra care to make sure everything is perfect behind the scenes, and we’re almost ready to share the results with you.",
      "Almost there! You’ve been such a wonderful sport through this process, and we’re deeply grateful for your patience as we make the final adjustments. Thank you for waiting so patiently.",
      "Everything is coming together beautifully, and we can’t thank you enough for your patience while we work through the final details. We’ll be all set for you shortly!",
      "We’re working hard to put together something truly special for you, and we greatly appreciate your understanding and patience as we make sure everything is just right before we share it.",
      "You’re almost there! Thank you so much for sticking with us. We’re just finishing the last touches, and your patience is truly appreciated as we wrap everything up.",
      "Thank you for your patience! We’re so close to being done, and we want to make sure everything is just perfect for you. We appreciate your understanding and trust in the process.",
      "Your understanding and patience mean the world to us. We’re making sure every detail is in place, and we’ll be ready for you in just a few more moments. Thanks for sticking with us.",
      "You're doing such a great job waiting, and we want to acknowledge how wonderful your patience has been. We are so grateful to have you with us and will be finished shortly.",
      "We truly appreciate your patience and want to reassure you that we're working hard to get everything right. It won’t be much longer now – we’re almost ready for you!",
      "We’re getting closer and closer to the finish line, and we couldn’t have done it without your patience. Thank you for your understanding while we finalize everything to make it perfect.",
      "Thank you for your continued patience. We know waiting isn't always easy, but your understanding and kindness have been amazing, and we’re almost finished preparing everything for you.",
      "Your patience has been truly remarkable, and we want to express our heartfelt thanks. We’re wrapping up everything now, and we’ll be ready for you very soon. Thanks again for waiting!",
      "Almost there! You’ve been so patient and understanding, and we are incredibly grateful for your trust as we make the final preparations to ensure everything is just right.",
      "We’re so close to finishing, and your patience has been such a wonderful part of this experience. We’re putting everything together with great care, and we’ll be ready shortly.",
      "Your patience has been nothing short of amazing, and we want to take a moment to thank you for waiting. We are just finishing up the last details and will be ready for you soon.",
      "Thank you for your incredible patience! We’re putting together something truly special for you, and it will be worth the wait. We appreciate you sticking with us through this process.",
      "We understand that waiting can be tough, but we want to assure you that every moment has been worth it. We are almost done, and we truly appreciate your kindness and patience."
    ];

    const randomIndex = Math.floor(Math.random() * politeStatements.length);
    const statement = politeStatements[randomIndex];

    setTimeout(() => {
      speakText(statement);
    }, 200);
  };

  const speakText = (text: string, emotion?: string) => {
    if (!text) return;

    let politeStatement = " ";
    switch (emotion) {
      case "happy":
        politeStatement =
          "You seem to be in such a wonderful mood today! It's great to see you so positive and cheerful. I hope the rest of your day is just as bright and uplifting!";
        break;
      case "sad":
        politeStatement =
          "I'm truly sorry you're feeling this way. I know it can be tough, but remember you're not alone – I'm here to assist you and support you through it. Together, we’ll get through this.";
        break;
      case "angry":
        politeStatement =
          "I can sense some frustration in your voice. I understand that things might feel a bit overwhelming, but take a moment to breathe – I’ll do my best to help you work through it and ease the tension.";
        break;
      case "neutral":
        politeStatement =
          "It seems like you’re in a calm and steady state today, which is wonderful. I’m here if you need anything or just want to talk through something. Let me know how I can assist you in any way.";
        break;
      default:
        politeStatement =
          "I’m here to help with anything you need, no matter the situation. Feel free to share what’s on your mind, and I’ll do my best to assist you in the best way possible.";
    }

    const combinedText = politeStatement + text;
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
            <nav className="flex items-center md:space-x-2 space-x-1">
              <Link href="#about">
                <Button variant="ghost" size="sm">
                  <Info className="h-4 w-4 mr-2" /> About
                </Button>
              </Link>
              <Link href="https://github.com/uttamseervi/emotions-augment-ai-hackathon" target="_blank">
                <Button variant="ghost" size="sm">
                  <Github className="h-4 w-4 mr-2" /> GitHub
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Buttons to select the section */}
      <div className="container mx-auto my-4 flex gap-4 justify-center">
        <Button
          onClick={() => setSelectedSection("section1")}
          variant={selectedSection === "section1" ? "default" : "outline"}
        >
          Section 1 (Talk about your day)
        </Button>
        <Button
          onClick={() => setSelectedSection("section2")}
          variant={selectedSection === "section2" ? "default" : "outline"}
        >
          Section 2 (Voice Chat with AI companion)
        </Button>
      </div>

      {/* Toggle Recording History Button */}


      {/* Render section based on button selection */}
      {selectedSection === "section2" && (
        <section className="flex items-center mx-auto">
          <main className="flex">
            <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-16">
              <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Customer Service Simulation
                </h1>
                <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                  (AI is just used to keep the conversation going, but the emotions are detected from our ml model)
                </p>
                <div className="space-x-4">
                  {!isRecording && !loading ? (
                    <Button size="lg" className="gap-2" onClick={startRecording}>
                      <Mic className="h-4 w-4" /> Start Recording
                    </Button>
                  ) : isRecording ? (
                    <Button size="lg" className="gap-2 bg-red-500 hover:bg-red-600" onClick={stopRecording}>
                      <MicOff className="h-4 w-4" /> Stop Recording
                    </Button>
                  ) : (
                    <Button size="lg" className="gap-2" disabled>
                      Loading...
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
        </section>
      )}

      {selectedSection === "section1" && (
        <section id="demo" className="container py-8 md:py-12 lg:py-16 flex-1">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
              Speech Emotion Analyzer
            </h2>
            <span className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Speak into your microphone and our algorithm will analyze your voice to detect emotions
              <p>(Record your voice and send it to our model).</p>
            </span>
          </div>
          <div className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[64rem] md:grid-cols-1 lg:max-w-[64rem]">
            <EmotionRecorder />
          </div>
        </section>
      )}

      {emotionData && (
        <div className="flex items-center justify-center flex-col">
          <h1 className="text-2xl font-semibold">Report while talking to our Ai-agent</h1>
          <EmotionVisualizer emotionData={emotionData} recordingHistory={recordingHistory} />
        </div>
      )}

      {/* Recording History Card - toggled via button */}
      {showHistory && (
        <Card className="mx-auto my-4 w-full max-w-4xl">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Recording History</h3>
            <div className="space-y-4">
              {recordingHistory?.map((record, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Recording at {record.timestamp}</span>
                    <span className="text-sm text-muted-foreground">
                      Primary: {record.emotions[0].name} ({record.emotions[0].value}%)
                    </span>
                  </div>
                  <div className="h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={record.emotions} layout="vertical" margin={{ top: 0, right: 0, left: 60, bottom: 0 }}>
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 12 }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {record?.emotions?.map((entry: { name: string; }, i: any) => (
                            <Cell key={`cell-${i}`} fill={getEmotionColor(entry.name)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

<div className="container mx-auto my-4 flex justify-center gap-3">
        <Button onClick={() => setShowHistory((prev) => !prev)}>
          {showHistory ? "Hide Recording History" : "Show Recording History"}
        </Button>
        <Button onClick={() => deleteHistory()}>
          Delete Recording History
        </Button>
      </div>

      <section>
        <Footer />
      </section>
    </div>
  );
}
