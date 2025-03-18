const socket = io();
let mediaStream = null;
let recognition = null;

// DOM Elements
const imageInput = document.getElementById('imageInput');
const cameraBtn = document.getElementById('cameraBtn');
const camera = document.getElementById('camera');
const canvas = document.getElementById('canvas');
const queryInput = document.getElementById('queryInput');
const sendQuery = document.getElementById('sendQuery');
const voiceInput = document.getElementById('voiceInput');
const response = document.getElementById('response');

// Handle image upload
imageInput.addEventListener('change', handleImageUpload);

// Handle camera
cameraBtn.addEventListener('click', toggleCamera);

// Handle query submission
sendQuery.addEventListener('click', sendQueryToServer);

// Setup voice input
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        queryInput.value = text;
    };
    
    recognition.onend = () => {
        voiceInput.classList.remove('recording');
    };
}

voiceInput.addEventListener('click', toggleVoiceInput);

// Functions
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            socket.emit('image', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

async function toggleCamera() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        camera.style.display = 'none';
        camera.parentElement.style.display = 'none';
        cameraBtn.textContent = 'Use Camera';
        mediaStream = null;
    } else {
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                } 
            });
            
            camera.srcObject = mediaStream;
            camera.style.display = 'block';
            camera.parentElement.style.display = 'block';
            camera.style.width = '100%';
            camera.style.maxWidth = '500px';
            camera.style.height = 'auto';
            camera.style.objectFit = 'contain';
            camera.style.backgroundColor = '#000';
            
            // Create capture button if it doesn't exist
            let captureBtn = document.querySelector('.capture-btn');
            if (!captureBtn) {
                captureBtn = document.createElement('button');
                captureBtn.className = 'btn btn-success mt-2 capture-btn';
                captureBtn.textContent = 'Take Photo';
                captureBtn.onclick = capturePhoto;
                camera.parentElement.appendChild(captureBtn);
            }
            
            cameraBtn.textContent = 'Stop Camera';
            console.log('Camera started successfully');
            
        } catch (err) {
            console.error('Camera access error:', err);
            alert('Error accessing camera. Please make sure you have granted camera permissions.');
        }
    }
}

function capturePhoto() {
    try {
        // Set canvas dimensions to match video
        canvas.width = camera.videoWidth;
        canvas.height = camera.videoHeight;
        
        // Draw the current video frame on the canvas
        const context = canvas.getContext('2d');
        context.drawImage(camera, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        
        // Send image data to server
        socket.emit('image', imageData);
        console.log('Photo captured successfully');
    } catch (err) {
        console.error('Error capturing photo:', err);
        alert('Error capturing photo. Please try again.');
    }
}

function sendQueryToServer() {
    const query = queryInput.value.trim();
    if (query) {
        socket.emit('query', { query });
        response.innerHTML = 'Waiting for response...';
    }
}

function toggleVoiceInput() {
    if (recognition) {
        if (voiceInput.classList.contains('recording')) {
            recognition.stop();
        } else {
            voiceInput.classList.add('recording');
            recognition.start();
        }
    }
}

// Handle server responses
socket.on('response', (data) => {
    response.innerHTML = data.text;
});

socket.on('error', (data) => {
    response.innerHTML = `Error: ${data.message}`;
}); 