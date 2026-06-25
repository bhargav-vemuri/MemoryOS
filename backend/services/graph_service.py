from core.neo4j_client import neo4j_client

class GraphService:
    def create_file_node(self, file_id: int, filename: str, file_type: str):
        query = """
        MERGE (f:File {id: $file_id})
        SET f.name = $filename, f.type = $file_type
        RETURN f
        """
        with neo4j_client.get_session() as session:
            session.run(query, file_id=file_id, filename=filename, file_type=file_type)

    def extract_and_create_entities(self, file_id: int, text: str):
        # Placeholder for NER logic (e.g. spaCy or LLM)
        # For demonstration, we simulate finding concepts
        words = text.split()
        concepts = [word for word in words if len(word) > 7][:5] # naive extraction
        
        query = """
        MATCH (f:File {id: $file_id})
        UNWIND $concepts AS concept_name
        MERGE (c:Concept {name: concept_name})
        MERGE (f)-[:CONTAINS]->(c)
        """
        with neo4j_client.get_session() as session:
            session.run(query, file_id=file_id, concepts=concepts)

    def extract_and_create_projects(self, file_id: int, project_name: str):
        query = """
        MATCH (f:File {id: $file_id})
        MERGE (p:Project {name: $project_name})
        MERGE (f)-[:BELONGS_TO_PROJECT]->(p)
        """
        with neo4j_client.get_session() as session:
            session.run(query, file_id=file_id, project_name=project_name)

    def link_evolution(self, concept_a: str, concept_b: str):
        query = """
        MERGE (a:Concept {name: $concept_a})
        MERGE (b:Concept {name: $concept_b})
        MERGE (a)-[:EVOLVED_TO]->(b)
        """
        with neo4j_client.get_session() as session:
            session.run(query, concept_a=concept_a, concept_b=concept_b)

    def calculate_centrality(self):
        query = """
        MATCH (c:Concept)<-[r]-()
        WITH c, count(r) as incoming_links
        SET c.centrality = incoming_links
        RETURN c.name as name, c.centrality as score
        ORDER BY c.centrality DESC
        LIMIT 10
        """
        with neo4j_client.get_session() as session:
            return session.run(query).data()

    def delete_file_node(self, file_id: int):
        query = """
        MATCH (f:File {id: $file_id})
        DETACH DELETE f
        """
        with neo4j_client.get_session() as session:
            session.run(query, file_id=file_id)

    def get_graph_data(self):
        query = """
        MATCH (n)-[r]->(m)
        RETURN n.id AS source_id, labels(n)[0] AS source_label, n.name AS source_name,
               type(r) AS rel_type,
               m.id AS target_id, labels(m)[0] AS target_label, m.name AS target_name
        LIMIT 100
        """
        nodes = []
        links = []
        added_nodes = set()
        
        with neo4j_client.get_session() as session:
            result = session.run(query)
            for record in result:
                s_id = str(record["source_id"] or record["source_name"])
                t_id = str(record["target_id"] or record["target_name"])
                
                if s_id not in added_nodes:
                    nodes.append({"id": s_id, "label": record["source_name"], "group": record["source_label"]})
                    added_nodes.add(s_id)
                if t_id not in added_nodes:
                    nodes.append({"id": t_id, "label": record["target_name"], "group": record["target_label"]})
                    added_nodes.add(t_id)
                
                links.append({"source": s_id, "target": t_id, "label": record["rel_type"]})
                
        return {"nodes": nodes, "links": links}

graph_service = GraphService()
