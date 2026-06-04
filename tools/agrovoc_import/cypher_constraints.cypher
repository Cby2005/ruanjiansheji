CREATE CONSTRAINT agro_concept_uri_unique IF NOT EXISTS
FOR (n:AgroConcept)
REQUIRE n.uri IS UNIQUE;

CREATE INDEX agro_concept_zh_label_index IF NOT EXISTS
FOR (n:AgroConcept)
ON (n.zhPrefLabel);

CREATE INDEX agro_concept_en_label_index IF NOT EXISTS
FOR (n:AgroConcept)
ON (n.enPrefLabel);
