from services.llm_service import llm_service
from services.graph_service import graph_service
import json
import re

class AgentService:
    def process_new_memory(self, file_id: int, filename: str, text: str):
        if not text.strip():
            return
            
        print(f"Agent is analyzing new memory: {filename}")
        
        # Keep text brief for phi to process reasonably fast
        snippet = text[:2000]
        
        system_prompt = "You are an AI agent designed to extract the 3 most important core concepts or entities from the provided text. Return ONLY a valid JSON array of strings, e.g. [\"Concept1\", \"Concept2\", \"Concept3\"]."
        prompt = f"Extract exactly 3 core concepts from this text:\n\n{snippet}"
        
        response = llm_service.generate(prompt, system_prompt=system_prompt)
        
        concepts = []
        try:
            # Try to parse the response as JSON (extracting from markdown blocks if present)
            match = re.search(r'\[.*\]', response.replace('\n', ' '))
            if match:
                concepts = json.loads(match.group(0))
            else:
                concepts = json.loads(response)
        except Exception as e:
            print(f"Agent failed to parse concepts as JSON: {e}. Raw response: {response}")
            # Fallback naive parsing
            clean_resp = response.replace("'", '"').replace("\n", " ").strip()
            # If it's somewhat comma separated
            if "1." in response:
                 # heuristic fallback
                 pass
                 
        if isinstance(concepts, list):
            for concept in concepts[:5]: # Cap at 5 just in case
                if isinstance(concept, str) and len(concept) > 2:
                    clean_concept = concept.strip().title()
                    print(f"Agent extracted concept: {clean_concept}")
                    graph_service.create_concept_node(clean_concept)
                    graph_service.link_file_to_concept(file_id, clean_concept, "CONTAINS_CONCEPT")

agent_service = AgentService()
