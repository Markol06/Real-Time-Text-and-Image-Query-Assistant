# Real-Time Text and Image Query Assistant

This project is an interactive assistant that allows users to upload images and ask questions about them in real-time using the Google Gemini API. The assistant supports both file system image uploads and webcam photo capture.

## Features

- 📸 Upload images from file system
- 📱 Capture photos using webcam
- 💬 Interactive image queries
- 🎤 Voice input for queries
- 🔄 Real-time responses
- 🌐 Web interface using Flask and Socket.IO

## Requirements

- Python 3.8+
- Google API key with Gemini API access
- Web browser with JavaScript support
- Webcam access (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Markol06/Real-Time-Text-and-Image-Query-Assistant.git
cd Real-Time-Text-and-Image-Query-Assistant
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the project root and add your Google API key:
```
GOOGLE_API_KEY=your_api_key_here
```

## Running the Application

1. Start the server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

## Usage

1. Upload an image or use the webcam to capture a photo
2. Enter your question about the image in the text field
3. Click "Send" or use voice input
4. Receive the assistant's response

## Technical Details

- **Backend**: Flask, Flask-SocketIO
- **Frontend**: HTML, CSS, JavaScript
- **API**: Google Gemini API
- **Image Processing**: Pillow (PIL)
- **Session Management**: Flask-Session

## Security

- API keys are stored in the `.env` file
- `.env` file is added to `.gitignore`
- Sessions are stored locally

## License

MIT License

## Author

Markol06

## Acknowledgments

- Google Gemini API for providing access to AI models
- Flask and Flask-SocketIO for the excellent framework
- All project contributors for their input 