# EmotionVox: AI-Powered Real-Time Voice Chatbot

## Overview
EmotionVox is a real-time voice chatbot that transcribes audio, detects emotions, generates AI responses, and converts them back to speech.

## Technologies Used:
- **Flask-SocketIO** – WebSocket-based real-time communication
- **AssemblyAI** – Speech-to-text transcription with emotion analysis
- **Google Gemini AI** – AI-generated responses
- **ElevenLabs** – Text-to-speech synthesis

## Code:

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
ASSEMBLY_AI_KEY = "YOUR_ASSEMBLY_AI_KEY"
ELEVENLABS_KEY = "YOUR_ELEVENLABS_KEY"
GENAI_API_KEY = "YOUR_GEMINI_AI_KEY"

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
        
        with open(temp_file_path, "rb") as f:
            response = requests.post(
                "https://api.assemblyai.com/v2/upload",
                headers=headers,
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
            json={"audio_url": upload_url, "sentiment_analysis": True}
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
        os.remove(temp_file_path)
        
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
        
        Please respond in a helpful, concise way. If you detect emotions in their message,
        acknowledge them appropriately. Keep your response under 3 sentences.
        """
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else "Sorry, I couldn't process that."
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
        message_type = parsed_data.get("type", "text_data")
        
        if message_type == "audio_data" and "audio" in parsed_data:
            print("🎤 Processing audio data")
            audio_base64 = parsed_data.get("audio")
            text_input = transcribe_audio(audio_base64)
            print(f"🗣️ Transcription: {text_input}")
            
        else:
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
    try:
        print("🔊 Generating speech...")
        audio = client_elevenlabs.generate(
            text=ai_response, 
            voice="Rachel", 
            model="eleven_multilingual_v1"
        )

        # Convert binary audio to Base64
        audio_bytes = b"".join(audio)
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        print("✅ Audio generated successfully")

    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        audio_base64 = None

    # Send Response
    response_data = {
        "text": ai_response,
        "audio": audio_base64,
        "original_input": text_input
    }
    emit("response", response_data)

# Run Server
if __name__ == "__main__":
    print("🚀 Starting EmotionVox server at http://localhost:5050")
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, use_reloader=False)








```
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
        
        Please respond in a helpful, concise way. your task is just to talk to the user and go with the flow don't indulge in any emotional support . Keep your response under 3 sentences.
        """
        response = model.generate_content(prompt)
        return response.text.strip() if response.text else "Sorry, I couldn't process that."
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
    try:
        print("🔊 Generating speech...")
        audio = client_elevenlabs.generate(
            text=ai_response, 
            voice="Rachel", 
            model="eleven_multilingual_v1"
        )

        # Convert binary audio to Base64
        audio_bytes = b"".join(audio)
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        print("✅ Audio generated successfully")

    except Exception as e:
        print(f"❌ Error generating audio: {e}")
        audio_base64 = None

    # Send Response
    response_data = {
        "text": ai_response,
        "audio": audio_base64,
        "original_input": text_input
    }
    emit("response", response_data)

# Run Server
if __name__ == "__main__":
    print("🚀 Starting EmotionVox server at http://localhost:5050")
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, use_reloader=False)
```