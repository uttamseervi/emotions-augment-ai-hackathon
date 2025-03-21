import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Info, Github, Award } from "lucide-react"
import EmotionRecorder from "@/components/emotion-recorder"

export default function Footer() {
    return (
        <div className="flex min-h-screen flex-col">
        
            <main className="flex-1">

                <section id="about" className="container py-8 md:py-12 lg:py-16">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">How It Works</h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        Our speech emotion analysis system utilizes voice-to-text processing combined with a machine learning model to predict emotions from textual data.
                        </p>
                    </div>
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[64rem] md:grid-cols-3 lg:max-w-[64rem] mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Audio Capture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>The frontend captures voice input using a microphone and sends it to the backend via WebSockets.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Transcription</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                The Assembly AI API converts speech into text with high accuracy.

                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Emotion Classification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>The transcribed text is analyzed by our custom-trained machine learning model, which predicts the probabilities of different emotions.</p>
                            </CardContent>
                        </Card>
                        
                    </div>
                </section>
                <section className="container py-8 md:py-12 lg:py-16 bg-muted rounded-lg my-8">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                        <Award className="h-12 w-12 text-primary" />
                        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                            Perfect for Emotion detection
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                        This project showcases:
Real-time emotion analysis using advanced ML models.
Seamless AI integration for real-world applications.
Interactive UI with individual and AI-assisted modes.
Practical use cases in therapy, customer support, and mental health monitoring.
                        </p>
                        <Tabs defaultValue="features" className="w-full max-w-[800px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="features">Key Features</TabsTrigger>
                                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                                <TabsTrigger value="extensions">Possible Extensions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="features" className="text-left">
                            <ul>
  <li>Real-time voice emotion detection</li>
  <li>Analytics dashboard for emotional trends</li>
  <li>Self-analysis mode (individual emotion tracking)</li>
  <li>AI-assisted mode (customer service simulation)</li>
  <li>Speech-to-text and text-to-speech integration</li>
  <li>History tracking for emotional insights</li>
</ul>

</TabsContent>

                            <TabsContent value="tech" className="text-left">
                            <ul>
  <li>Frontend: Next.js (TypeScript)</li>
  <li>Backend: Python (FastAPI)</li>
  <li>ML Model: Custom-trained emotion detection model</li>
  <li>APIs Used: Assembly AI (speech-to-text), Google Gemini AI (optional AI response)</li>
  <li>Communication: WebSockets for real-time data transfer</li>
</ul>

                            </TabsContent>
                            <TabsContent value="extensions" className="text-left">
                            <ul>
  <li>Multi-language support for wider accessibility</li>
  <li>Deeper analytics with emotion pattern trends</li>
  <li>Personalized AI responses based on detected emotions</li>
  <li>Integration with customer service platforms for real-world deployment</li>
</ul>

                            </TabsContent>
                        </Tabs>
                    </div>
                </section>
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built for our hackathon project. Created with ❤️ by our team.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                            Privacy Policy
                        </Link>
                        <Link href="#" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}

