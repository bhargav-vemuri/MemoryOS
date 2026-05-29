from neo4j import GraphDatabase
from core.config import settings

class Neo4jClient:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            settings.NEO4J_URI,
            auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
        )
    
    def close(self):
        self.driver.close()
        
    def get_session(self):
        return self.driver.session()

neo4j_client = Neo4jClient()

def get_neo4j():
    session = neo4j_client.get_session()
    try:
        yield session
    finally:
        session.close()
