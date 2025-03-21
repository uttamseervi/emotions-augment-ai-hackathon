"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BarChart3 } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Cell,
} from "recharts"

type EmotionData = { name: string; value: number }[]
type RecordingHistory = { timestamp: string; emotions: EmotionData }[]

type EmotionVisualizerProps = {
    emotionData: EmotionData
    recordingHistory: RecordingHistory
}

const EMOTION_COLORS: Record<string, string> = {
    happy: "#10b981",
    sad: "#6366f1",
    angry: "#ef4444",
    love: "#f59e0b",
    scared: "#8b5cf6",
    Neutral: "#64748b",
}

const getEmotionColor = (emotion: string): string => EMOTION_COLORS[emotion] || "#64748b"

export default function EmotionVisualizer({ emotionData, recordingHistory }: EmotionVisualizerProps) {
    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                            <BarChart3 className="mr-2 h-5 w-5" />
                            Emotion Analysis Results
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={emotionData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} />
                                    <YAxis dataKey="name" type="category" width={80} />
                                    <Tooltip formatter={(value) => [`${value}%`, "Confidence"]} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {emotionData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getEmotionColor(entry.name)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-4">Emotion Radar</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={emotionData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="name" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar name="Emotions" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                    <Tooltip formatter={(value) => [`${value}%`, "Confidence"]} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <Card>
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
                                                {record?.emotions?.map((entry, i) => (
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

        </div>
    )
}
