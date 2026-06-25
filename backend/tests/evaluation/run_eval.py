import requests
import time

def evaluate_retrieval(query: str, expected_file_id: int):
    # This acts as an automated integration test / evaluation script
    # To run: python run_eval.py
    
    start_time = time.time()
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/chat", 
            json={"query": query, "messages": []}
        )
        latency = time.time() - start_time
        
        # A full eval script would intercept the retrieval payload or parse the text
        # Here we just print the latency indicating the framework is stubbed out
        print(f"[EVAL] Query: '{query}'")
        print(f"       Expected ID: {expected_file_id}")
        print(f"       Latency: {latency:.2f}s")
        print("       Check frontend UI for citations accuracy.")
        print("-" * 50)
    except Exception as e:
        print(f"Failed to reach API: {e}")

if __name__ == "__main__":
    print("=== MemoryOS Retrieval Evaluation Framework ===")
    evaluate_retrieval("What is generative AI?", 1)
    evaluate_retrieval("How do I fix a react hook?", 2)
