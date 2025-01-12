from flask import Flask
import os
import base64
from openai import OpenAI
from dotenv import load_dotenv

# Load the .env file
load_dotenv()

# Retrieve the OpenAI API key from the .env file
api_key = os.getenv("OPENAI_API_KEY")

# Ensure the API key is loaded properly
if api_key is None:
    raise ValueError("OpenAI API key not found in .env file")

# Initialize the OpenAI client with the API key
client = OpenAI(
    api_key = os.getenv("OAI"),
)

app = Flask(__name__)

# Get the current working directory
current_directory = os.getcwd()

# Image file name
image_file = "img.png"

# Construct the full path to the image
image_file_path = os.path.join(current_directory, image_file)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

# Getting the base64 string
base64_image = encode_image(image_file_path)

@app.route("/text", methods=['GET'])
def Text_API():
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": "Hello"
            }
        ]
    )
    return completion.choices[0].message.content.strip()

@app.route("/image", methods=['GET'])
def image_API():
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "Identify the piece of trash in this image, and explain how to dispose of it according to garbage disposal laws and recommendations in the region of Hamilton, Ontario. Additionally, provide from 1 to 4 ways to reuse the piece of trash instead of throwing it out. If there are better and more ways to reuse the trash, provide more alternatives for reuse, up to 4. However, if there are fewer ways to reuse the trash, provide fewer alternatives for reuse, down to 1."
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{base64_image}"},
                    },
                ],
            }
        ],
    )
    #print(response['choices'][0])  # Print the response for debugging
    return response.choices[0].message.content.strip()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
