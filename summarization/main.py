from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import requests
import uvicorn

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
        
uvicorn.run(app)