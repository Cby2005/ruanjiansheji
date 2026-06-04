from neo4j import GraphDatabase

d = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "20050828"))
s = d.session()
r = s.run("MATCH (n:Concept) RETURN count(n) as cnt")
print("Concepts:", r.single()["cnt"])
r2 = s.run("MATCH ()-[r]->() RETURN count(r) as cnt")
print("Relations:", r2.single()["cnt"])
s.close()
d.close()
