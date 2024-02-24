import requests
import base64

def image_generation(text):
    API_URL = "https://api-inference.huggingface.co/models/CompVis/stable-diffusion-v1-4"
    headers = {"Authorization": "Bearer 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"}

    def query(payload):
        response = requests.post(API_URL, headers=headers, json=payload)
        return response.content

    image_bytes = query({
        "inputs": text,
    })

    try:
        encoded_img_data = base64.b64encode(image_bytes).decode('utf-8')
        return encoded_img_data
    except Exception as e:
        raise Exception(f"Failed to generate image: {e}")
        return None
