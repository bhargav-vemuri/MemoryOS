import requests
import json
import os

class LLMService:
    def __init__(self):
        self.base_url = os.environ.get("OLLAMA_BASE_URL", "http://host.docker.internal:11434")
        self.model = "phi"

    def generate(self, prompt: str, system_prompt: str = "") -> str:
        url = f"{self.base_url}/api/generate"
        payload = {
            "model": self.model,
            "prompt": prompt,
            "system": system_prompt,
            "stream": False
        }
        
        try:
            response = requests.post(url, json=payload, timeout=60)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except Exception as e:
            print(f"Error communicating with Ollama: {e}")
            return "I'm sorry, I couldn't connect to the local language model."

    def generate_chat_stream(self, messages: list):
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True
        }
        
        try:
            with requests.post(url, json=payload, stream=True, timeout=60) as response:
                response.raise_for_status()
                for line in response.iter_lines():
                    if line:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            yield data["message"]["content"]
        except Exception as e:
            print(f"Error communicating with Ollama: {e}")
            yield "Error communicating with the local language model."

llm_service = LLMService()
