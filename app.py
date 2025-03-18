import os
from flask import Flask, render_template, request, jsonify, session
from flask_socketio import SocketIO, emit
from flask_session import Session
import google.generativeai as genai
from dotenv import load_dotenv
import base64
from PIL import Image
import io

# Load environment variables
load_dotenv()

# Configure Google Gemini API
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please add it to your .env file.")

print(f"Using API key: {GOOGLE_API_KEY[:10]}...")  # Print first 10 characters of the key for debugging

try:
    genai.configure(api_key=GOOGLE_API_KEY)
    
    # List available models
    print("\nAvailable models:")
    for m in genai.list_models():
        print(f"Model: {m.name}")
    
    model = genai.GenerativeModel('gemini-1.5-flash')
    print("\nSuccessfully configured Gemini API")
except Exception as e:
    print(f"Error configuring Gemini API: {str(e)}")
    raise ValueError(f"Failed to configure Gemini API: {str(e)}")

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html')

@socketio.on('image')
def handle_image(data):
    try:
        # Decode base64 image
        image_data = base64.b64decode(data.split(',')[1])
        image = Image.open(io.BytesIO(image_data))
        
        # Store image for later use
        session['current_image'] = image
        
        emit('image_received', {'status': 'success'})
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        emit('error', {'message': f'Error processing image: {str(e)}'})

@socketio.on('query')
def handle_query(data):
    try:
        query = data['query']
        image = session.get('current_image')
        
        if not image:
            emit('error', {'message': 'No image available. Please upload an image first.'})
            return
            
        print(f"Sending query to Gemini API: {query}")
        # Get response from Gemini
        response = model.generate_content([query, image])
        print("Received response from Gemini API")
        
        emit('response', {'text': response.text})
        
    except Exception as e:
        error_message = str(e)
        print(f"Error in handle_query: {error_message}")
        if "credentials" in error_message.lower() or "api key" in error_message.lower():
            error_message = "API key error. Please check your Google API key in the .env file and ensure it has access to Gemini API."
        emit('error', {'message': error_message})

if __name__ == '__main__':
    socketio.run(app, debug=True) 