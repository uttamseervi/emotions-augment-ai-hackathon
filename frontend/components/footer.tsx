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
                            Our speech emotion analysis uses advanced signal processing and machine learning techniques.
                        </p>
                    </div>
                    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-1 md:max-w-[64rem] md:grid-cols-3 lg:max-w-[64rem] mt-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Audio Capture</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>We use the Web Speech API to capture high-quality audio from your microphone in real-time.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Feature Extraction</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Our algorithm extracts acoustic features like pitch, energy, tempo, and spectral properties from your
                                    speech.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Emotion Classification</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>A trained machine learning model analyzes these features to classify emotions with high accuracy.</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>
                <section className="container py-8 md:py-12 lg:py-16 bg-muted rounded-lg my-8">
                    <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
                        <Award className="h-12 w-12 text-primary" />
                        <h2 className="text-3xl font-bold leading-tight tracking-tighter md:text-4xl">
                            Perfect for Hackathon
                        </h2>
                        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                            This project demonstrates innovative use of web technologies, machine learning, and user experience design
                            - all key elements judges look for in hackathon submissions.
                        </p>
                        <Tabs defaultValue="features" className="w-full max-w-[800px]">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="features">Key Features</TabsTrigger>
                                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                                <TabsTrigger value="extensions">Possible Extensions</TabsTrigger>
                            </TabsList>
                            <TabsContent value="features" className="text-left">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Real-time speech emotion analysis</li>
                                    <li>Visual representation of emotional states</li>
                                    <li>Historical tracking of emotion patterns</li>
                                    <li>Responsive design works on all devices</li>
                                    <li>Privacy-focused (all processing happens in the browser)</li>
                                </ul>
                            </TabsContent>
                            <TabsContent value="tech" className="text-left">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Next.js for frontend framework</li>
                                    <li>Web Speech API for audio capture</li>
                                    <li>TensorFlow.js for emotion classification</li>
                                    <li>Recharts for data visualization</li>
                                    <li>Tailwind CSS and shadcn/ui for styling</li>
                                </ul>
                            </TabsContent>
                            <TabsContent value="extensions" className="text-left">
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Add sentiment analysis of transcribed text</li>
                                    <li>Implement user accounts to save historical data</li>
                                    <li>Create an API for other applications to use</li>
                                    <li>Add support for multiple languages</li>
                                    <li>Develop a mobile app version</li>
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

