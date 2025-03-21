import eventlet
eventlet.monkey_patch()  # Fix WebSocket issues
import re
from  utils.predictMoodUtils import predict_emotion_util 
from flask_cors import CORS 
from flask import request


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
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  
            "http://localhost:3000",
            "https://disease-prediction-app.vercel.app/",
            "https://disease-prediction-app.vercel.app",
            "https://emotions-augment-ai-hackathon.vercel.app"  # Add this domain
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True,
        "max_age": 600
    }
})

socketio = SocketIO(app, cors_allowed_origins=[
    "http://localhost:5173",  
    "http://localhost:3000",
    "https://disease-prediction-app.vercel.app",
    "https://emotions-augment-ai-hackathon.vercel.app"  # Add frontend
])

@app.after_request
def after_request(response):
    allowed_origins = [
        'http://localhost:5173',  
        "http://localhost:3000",
        'https://disease-prediction-app.vercel.app',
        'https://emotions-augment-ai-hackathon.vercel.app'  # Allow frontend domain
    ]
    
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Set API Keys
ASSEMBLY_AI_KEY = "e90167029f9d49e88511ee744d519ccc"
ELEVENLABS_KEY = "sk_0bc02ae2b14a1940ce7bade6c490df0ba84f946938d532d6" 
GENAI_API_KEY = "AIzaSyBAwZanZoYfQFZBPAtPABCZroGUhlxUEs8"

# Configure AI Models
genai.configure(api_key=GENAI_API_KEY)
client_elevenlabs = ElevenLabs(api_key=ELEVENLABS_KEY)

# # AssemblyAI Speech-to-Text
# def transcribe_audio(audio_base64):
#     """Transcribes audio using AssemblyAI API."""
#     # Decode base64 audio to file
#     audio_bytes = base64.b64decode(audio_base64)
    
#     # Create temp file
#     temp_dir = tempfile.gettempdir()
#     temp_file_path = os.path.join(temp_dir, f"audio_{int(time.time())}.webm")
    
#     with open(temp_file_path, "wb") as f:
#         f.write(audio_bytes)
    
#     print(f"✅ Saved audio to {temp_file_path}")
    
#     try:
#         # Upload to AssemblyAI
#         headers = {
#             "authorization": ASSEMBLY_AI_KEY,
#             "content-type": "application/json"
#         }
        
#         # Upload the audio file
#         with open(temp_file_path, "rb") as f:
#             response = requests.post(
#                 "https://api.assemblyai.com/v2/upload",
#                 headers={"authorization": ASSEMBLY_AI_KEY},
#                 data=f
#             )
        
#         if response.status_code != 200:
#             print(f"❌ Upload failed: {response.text}")
#             return "I couldn't understand the audio."
            
#         upload_url = response.json()["upload_url"]
        
#         # Start transcription
#         response = requests.post(
#             "https://api.assemblyai.com/v2/transcript",
#             headers=headers,
#             json={
#                 "audio_url": upload_url,
#                 "sentiment_analysis": True  # Enable emotion analysis
#             }
#         )
        
#         transcript_id = response.json()["id"]
        
#         # Poll for results
#         polling_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
        
#         while True:
#             transcription_result = requests.get(polling_endpoint, headers=headers).json()
            
#             if transcription_result["status"] == "completed":
#                 break
#             elif transcription_result["status"] == "error":
#                 print(f"❌ Transcription error: {transcription_result}")
#                 return "There was an error processing your speech."
                
#             print("⏳ Waiting for transcription to complete...")
#             time.sleep(2)
        
#         # Clean up temp file
#         try:
#             os.remove(temp_file_path)
#         except:
#             pass
            
#         # Get the text and any sentiment analysis
#         text = transcription_result["text"]
#         sentiment = ""
        
#         if "sentiment_analysis_results" in transcription_result and transcription_result["sentiment_analysis_results"]:
#             sentiment = transcription_result["sentiment_analysis_results"][0]["sentiment"]
#             sentiment_score = transcription_result["sentiment_analysis_results"][0]["confidence"]
#             sentiment = f" (Detected emotion: {sentiment.capitalize()} with {sentiment_score:.0%} confidence)"
        
#         return text + sentiment
        
#     except Exception as e:
#         print(f"❌ Transcription error: {str(e)}")
#         return "I had trouble understanding you. Please try again."
def transcribe_audio(audio_base64):
    """Optimized transcription using AssemblyAI API."""
    # Decode base64 audio
    audio_bytes = base64.b64decode(audio_base64)
    
    try:
        # Set headers for API requests
        headers = {
            "authorization": ASSEMBLY_AI_KEY
        }
        
        # Upload the audio bytes directly
        print("🔄 Starting audio upload...")
        upload_response = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers=headers,
            data=audio_bytes
        )
        
        if upload_response.status_code != 200:
            print(f"❌ Upload failed: {upload_response.text}")
            return "I couldn't understand the audio."
            
        upload_url = upload_response.json()["upload_url"]
        print("✅ Audio uploaded successfully")
        
        # Start transcription with faster processing option
        headers["content-type"] = "application/json"
        response = requests.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers,
            json={
                "audio_url": upload_url,
                "sentiment_analysis": True,
                "speed_boost": True  # Request faster processing
            }
        )
        
        transcript_id = response.json()["id"]
        
        # Poll for results with adaptive polling
        polling_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
        
        # Start with short polling interval, then increase
        polling_interval = 1  # Start with 1 second
        max_polling_interval = 3  # Cap at 3 seconds
        polling_count = 0
        
        while True:
            polling_count += 1
            transcription_result = requests.get(polling_endpoint, headers=headers).json()
            
            if transcription_result["status"] == "completed":
                break
            elif transcription_result["status"] == "error":
                print(f"❌ Transcription error: {transcription_result}")
                return "There was an error processing your speech."
            
            # Adaptive polling interval that increases with time
            if polling_count > 3:
                polling_interval = min(polling_interval * 1.5, max_polling_interval)
                
            print(f"⏳ Waiting for transcription... (attempt {polling_count})")
            time.sleep(polling_interval)
            
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
            # this is my text which i have to send to model --------------------------------------------------------------
            
            text_input = transcribe_audio(audio_base64)
            responseFromModel = predict_emotion_util(text_input)
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
        "model_response": responseFromModel,
        # "audio": audio_base64,
        "original_input": text_input
    }
    print(response_data)
    emit("response", response_data)

@socketio.on("onlyUser")
def handle_only_user(data):
    """Handles incoming WebSocket messages (voice & text)."""
    # print(f"📩 Received 'onlyUser' event: {data}")

    try:
        if isinstance(data, str):  
            parsed_data = json.loads(data)  
        else:
            parsed_data = data  

        message_type = parsed_data.get("type", "text_data")

        if message_type == "audio_data" and "audio" in parsed_data:
            print("🎤 Processing audio data")
            audio_base64 = parsed_data["audio"]
            text_input = transcribe_audio(audio_base64) or "Could not transcribe audio."

            

            if " (Detected" in text_input:
                    cleaned_text = text_input.split(" (Detected")[0].strip()
            else:
                    cleaned_text = text_input
            print("Cleaned text:", cleaned_text)

            text_input = cleaned_text  

            # Split the cleaned text into sentences using regex
            sentences = re.split(r'(?<=[.!?])\s+', cleaned_text)
            sentences = [s.strip() for s in sentences if s.strip()]
            print("Split sentences:", sentences) 
            
            print(text_input)
            responseFromModel = predict_emotion_util(text_input)
            print(f"🗣️ Transcription: {sentences}")

        else:
            text_input = parsed_data.get("text", "Hello!")
            print(f"💬 Text input: {text_input}")

    except Exception as e:
        print(f"❌ Error processing message: {e}")
        text_input = "Sorry, I couldn't understand that."

    response_data = {
        "text": "Yeah, the voice note has been received!",
        "model_response": responseFromModel,
        "original_input": text_input,
    }
    emit("response", response_data)  



# Run Server
if __name__ == "__main__":
    print("🚀 Starting EmotionVox server at http://localhost:5050")
    socketio.run(app, host="0.0.0.0", port=5050, debug=True, use_reloader=False)
