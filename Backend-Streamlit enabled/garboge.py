import os
import cv2
import supervision as sv
from roboflow import Roboflow
import streamlit as st
from flask import Flask, jsonify
from dotenv import load_dotenv
from threading import Thread
from flask_cors import CORS
from openai import OpenAI
import base64

# Load .env file
load_dotenv()

client = OpenAI(
    api_key = os.getenv("OAI"),
)

# Set the API key for Roboflow
rf = Roboflow(api_key=os.getenv('ROB'))

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Variable to store the last detection
last_detection = {"class": None}

# Define the Streamlit interface
st.title("Garbage Classification Streamlit App")
st.sidebar.header("Settings")

confidence_threshold = st.sidebar.slider("Confidence Threshold", 0, 100, 55)
overlap_threshold = st.sidebar.slider("Overlap Threshold", 0, 100, 0)

st.sidebar.write("Click below to start detection.")
start_detection = st.sidebar.button("Start Detection")
stop_button = st.sidebar.button("Stop Detection")

# Load a pre-trained yolov8n model
project = rf.workspace().project("garbage-classification-3")
model = project.version(2).model

# Define a function to update the last detection in Streamlit state
'''def update_last_detection(class_label):
    """Update the last detection state."""
    st.session_state.last_detection = class_label  # Store the value in session_state'''
def write_last_detection_to_file(class_label):
    """Write the last detection class to a text file."""
    with open("last_detection.txt", "w") as f:
        f.write(class_label)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

if "last_detection" not in st.session_state:
    st.session_state.last_detection = None  # Initialize if it doesn't exist

# Main Streamlit loop
if start_detection:
    videoCap = cv2.VideoCapture(0)
    stframe = st.empty()

    while True:
        ret, frame = videoCap.read()
        if not ret:
            st.warning("Unable to access the webcam. Check your device.")
            break

        # Run inference
        results = model.predict(frame, confidence=confidence_threshold, overlap=overlap_threshold).json()

        # Extract predictions
        predictions = results['predictions']

        for prediction in predictions:
            class_label = prediction['class']
            if class_label is not None:
                #update_last_detection(class_label)
                write_last_detection_to_file(class_label)  # Update the last detection directly in Streamlit

        # Load the results into the supervision Detections API
        detections = sv.Detections.from_inference(results)

        # Create supervision annotators
        bounding_box_annotator = sv.BoxAnnotator()
        label_annotator = sv.LabelAnnotator()

        # Annotate the image with our inference results
        annotated_image = bounding_box_annotator.annotate(scene=frame, detections=detections)
        annotated_image = label_annotator.annotate(scene=annotated_image, detections=detections)

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Display the image in the Streamlit app
        stframe.image(frame_rgb, caption="Camera Feed", use_column_width=True)
        cv2.imwrite("mage.png", frame)
        # Display the last detected class in the Streamlit app
        #st.sidebar.write(f"Last Detected Class: {st.session_state.last_detection}")

        # Stop the loop when the "Stop" button is clicked
        if stop_button:
            break

    videoCap.release()

# Show a fallback message if not detecting
else:
    st.write("Click 'Start Detection' to begin.")

# Flask API endpoint for fetching the last detection
@app.route('/last-detection', methods=['GET'])
def get_last_detection():
    """Read the last detection from a text file and return it as JSON."""
    try:
        with open("last_detection.txt", "r") as f:
            last_detection = f.read().strip()  # Read and strip any extra whitespace
        return jsonify({"class": last_detection if last_detection else None})
    except Exception as e:
        print("EEEE")
        # If the file does not exist or there is an error reading it
        return jsonify({"error": f"Error reading the last detection: {str(e)}"})
    
@app.route("/text", methods=['GET'])
def Text_API():
    try:
        with open("last_detection.txt", "r") as f:
            last_detection = f.read().strip()  # Read and strip any extra whitespace
            completion = client.chat.completions.create(
                model = "gpt-4o",
                messages = [
                        {
                            "role": "user",
                            "content": f"{last_detection}"
                        }
                ]
            )
        return jsonify({"text": completion.choices[0].message.content.strip()})
    except Exception as e:
        print("EEEE")
        # If the file does not exist or there is an error reading it
        return jsonify({"error": f"Error reading the last detection: {str(e)}"})

@app.route("/image", methods=['GET'])
def image_API():
                # Getting the base64 string
    base64_image = encode_image("mage.png")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "What is in this image?",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                    },
                ],
            }
        ],
    )
    return jsonify({"img_data":response.choices[0].message.content.strip()})
# Run Flask app in a separate thread
def run_flask():
    app.run(host="0.0.0.0", port=8000)

# Run the Flask server in a separate thread
flask_thread = Thread(target=run_flask)
flask_thread.start()

