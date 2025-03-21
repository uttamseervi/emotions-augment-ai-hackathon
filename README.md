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

4. Set up your API keys in the main.py file:
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

## Usage
1. Open your browser and navigate to http://localhost:3000.
2. Click on "Start Recording" to begin capturing your voice.
3. The AI will analyze your speech, detect emotions, and respond accordingly.

## Project Architecture
The application follows a client-server architecture:
- **Frontend**: Handles user interaction, audio recording, and playback
- **Backend**: Processes audio, detects emotions, and coordinates with external APIs

## API Integration
- **AssemblyAI**: Used for accurate speech-to-text conversion
- **Google Gemini AI**: Provides context-aware, emotion-sensitive responses
- **ElevenLabs**: Generates natural-sounding speech from text

## Emotion Detection System
The emotion detection system analyzes speech patterns, tone, and linguistic cues to identify emotions including:
- Happiness
- Sadness
- Anger
- Fear
- Surprise
- Neutral

## Security Considerations
- API keys should be stored securely
- User data is processed in real-time and not stored permanently
- Consider implementing user authentication for production deployments

## Troubleshooting
- If audio isn't being captured, check browser microphone permissions
- Ensure all API keys are correctly configured
- For WebSocket connection issues, verify the backend server is running

## Future Enhancements
- Multi-language support
- Enhanced emotion detection accuracy
- Conversation history storage
- User preference settings
- Mobile application

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Thanks to AssemblyAI, Google, and ElevenLabs for their powerful APIs
- Special thanks to all contributors who helped develop EmotionVox
