# EmotionVox: AI-Powered Real-Time Voice Chatbot

## Overview
EmotionVox is a real-time voice chatbot that transcribes audio, detects emotions, generates AI responses, and converts them back to speech. It leverages advanced AI technologies to provide an interactive and engaging user experience.

## Features
- **Real-Time Emotion Detection**: Analyze emotions in voice recordings using state-of-the-art machine learning models.
- **AI Responses**: Generate context-aware responses using Google Gemini AI.
- **Speech-to-Text**: Convert spoken language into text using AssemblyAI.
- **Text-to-Speech**: Convert AI-generated text responses back into speech using ElevenLabs.
- **User-Friendly Interface**: Intuitive UI built with React and Next.js for seamless interaction.

## Technologies Used
- **Backend**: Flask, Flask-SocketIO
- **Frontend**: React, Next.js
- **Speech-to-Text**: AssemblyAI
- **AI Responses**: Google Gemini AI
- **Text-to-Speech**: ElevenLabs
- **Emotion Analysis**: Custom ML models

## Installation

### Prerequisites
- Python 3.x
- Node.js
- npm or yarn

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/uttamseervi/emotions-augment-ai-hackathon.git
   cd emotions-augment-ai-hackathon/BackAug
   ```
2. Create Virtual Environment and Activate it
   ```bash
   cd backend/app
   python -m venv venv
   source venv/bin/activate  # For Mac
   venv\Scripts\activate #For windows
   ```
3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up your API keys in the main.py file (Jdges no need to do this, we hardcoded the keys, will remove once Hackathonends):
   ```bash
   ASSEMBLY_AI_KEY = "YOUR_ASSEMBLY_AI_KEY"
   ELEVENLABS_KEY = "YOUR_ELEVENLABS_KEY"
   GENAI_API_KEY = "YOUR_GENAI_API_KEY"
   ```
5. Run the backend server:
   ```bash
   python main.py
   ```
### Frontend Setup
1. From root directory of project, navigate to frontend
   ```bash
   cd frontend
   ```
2. Install required Node packages:
   ```bash
   npm i --force
   ```
3. Start the frontend server:
   ```bash
   npm run dev
   ```

### Usage
1. Open your browser and navigate to http://localhost:3000.
2. Click on "Start Recording" to begin capturing your voice.
3. The AI will analyze your speech, detect emotions, and respond accordingly.
