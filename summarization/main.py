from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import requests
import uvicorn
from generate_keywords import get_keywords
from stable_diffusion import image_generation

app = FastAPI()

@app.get('/')
def home():
    data = {"message": "Welcome to the summarization API."}
    return JSONResponse(status_code=200,content=data)


@app.post('/summarize')
async def summarize(data:dict):
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
    input_text = data.get("text","")
    max_length = int(data.get("max_length", 512))
    
    if not input_text:
        raise HTTPException(status_code=400,detail="Input text is required")
    
    API_URL = "https://api-inference.huggingface.co/models/facebook/bart-large-cnn"
    headers = {"Authorization": "Bearer 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"}
    
    payload = {
        "inputs": input_text,
        "parameters": {"min_length": max_length // 4, "max_length": max_length}
    }
    
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        summary = response.json()[0]["summary_text"]
        return JSONResponse(status_code=200,content={"summary": summary})
    else:
        raise HTTPException(status_code=response.status_code,detail="Failed to summarize text")
        
# Add the keyword endpoint   
@app.post('/keywords')
async def keyword(data:dict):
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
    
    input_text = data.get("text","")
    keywords_size = int(data.get("keywords_size",""))
    keywords = get_keywords(input_text,keywords_size)
    return JSONResponse(status_code=200,content={"keywords": keywords})

@app.post('/generate_image')
async def generate_image(data:dict):
    if not data:
        raise HTTPException(status_code=400, detail="No data provided")
    text = data.get("prompt","")
    photo = image_generation(text)
    return JSONResponse(status_code=200,content={"message": "Image generated successfully","image": photo})
    
if __name__ == '__main__':
    uvicorn.run(app, port=8000, host='0.0.0.0')