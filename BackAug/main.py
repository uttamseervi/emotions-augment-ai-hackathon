
from flask import Flask, request, jsonify
from flask_cors import CORS  
from  utils.predictMoodUtils import predict_emotion_util

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:5173",  # Vite dev server
            "http://localhost:3000",
            "https://disease-prediction-app.vercel.app"  # Replace with your actual frontend domain,
                "*",
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["Content-Range", "X-Content-Range"],
        "supports_credentials": True,
        "max_age": 600
    }
})
@app.after_request
def after_request(response):
    allowed_origins = ['http://localhost:5173', 
                       '*',
                      'https://disease-prediction-app.vercel.app']
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

@app.route('/')
def home():
    return "Welcome to the Emotion Prediction API!"

@app.route('/predictEmotion', methods=['POST'])
def predictMain(): 
    try:
        data = request.get_json()  # Get JSON input
        text = data.get('text')    # Extract text
        if not text:
            return jsonify({"error": "No text provided"}), 400

        predicted_class = predict_emotion_util(text)  # Call your prediction function
        return jsonify({"emotion": predicted_class})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)