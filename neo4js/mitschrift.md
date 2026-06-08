## GraphQL

Graphen sind Mengen von Konten(V) und Ecken(E) (die Beziehungen zwischen den Knoten) (Node, Edges). Ein Graph ist eine Anzahl von Objekten und die Beziehungen daszwischen.

G = (V, E) -- E=Menge all Edges(Kanten); V=Menge alle Vertices/Node(Knoten)
Graphen können noch Richtungen haben.

BSP:
```
G = ({1, 2, 3}, {(1, 2), (1, 3), (3, 3)})

Personen(id INT, name TEXT)l;
knows(from_id INT, to_id INT);
INSERT INTO Person VALUES(1, 'Alice');
INSERT INTO Person VALUES(2, 'Bob');
INSERT INTO Person VALUES(3, 'Charlie');
INSERT INTO Person VALUES(4, 'Dan');

INSERT INTO knows(1, 2);
INSERT INTO knows(1, 4);
INSERT INTO knows(2, 3);
INSERT INTO knows(3, 4);

# Wenn kennt alles ALICE und nach wie viel Knoten komm ich zu Dan

FROM Person alice
JOIN knows k1 ON alice.id = k1.from_id
JOIN knows k2 ON k1.from_id = k2.to_id
usw.

# Es werden viel Joins gebraucht und Rekursion, ist sehr kompliziert in SQL
```
**WICHTIG**
JEDER EINTRAG IN DIE DATENBANK IST EINE NODE!!!!

## Befehle
#Node erzeugen n fuer Node Person ist der Datentyp
```
CREATE (n:Person)
```
#Node erzeugen mit daten
```
CREATE (n:Person{name: 'Alice', age: 25, profession: 'SW Developer'})
CREATE (n:Person{name: 'Bob', age: 27, profession: 'SW Developer'})
```

Abfrage beginnt immer mit MATCH dannach kommen "Zeichnungen in ASCII Art".
```
MATCH (n) RETURN n LIMIT 25;
```
Die () representieren "Kreise". 
Das suchen nach eigenschaften geht wie folgt.
```
MATCH (n:Person{name: "Alice"}) RETURN n LIMIT 25;
```
Wenn wir nach Bob & Alice suchen wollen geht es so (ist nicht die optimale Variante, es geht nur darum zu zeigen das **n** und **m** eigentlich **Variablen** sind):
```
MATCH (n:Person{name: "Bob"}), (m:Person{name: "Alice"}) RETURN n, m LIMIT 25;
```
Beweis ist die folgende Abfrage wo wir eine Relations dannach machen:
```
MATCH (n:Person{name: "Bob"}), (m:Person{name: "Alice"})
CREATE (m)-[:LIKES]->(n) RETURN *
```
m & n werden unten fuer die Relations verwendet! LIKES ist eine Edge, also Verbindung zwischen den einzelnen Nodes.

Wenn wir die Relatons umdrehen wollen gibt es 2 Varienaten
```
MATCH (n:Person{name: "Bob"}), (m:Person{name: "Alice"})
CREATE (m)<-[:HACKS]-(n) RETURN *

MATCH (n:Person{name: "Bob"}), (m:Person{name: "Alice"})
CREATE (n)-[:HACKS]->(m) RETURN *
```
Eine Variante ist m & n umtauschen, die zweite Variante ist den Pfeil umdrehen.

Relations werden wie folgt Abgefragt:
```
MATCH p=()-[]->() RETURN p LIMIT 25;
MATCH p=()-[:LIKES]->() RETURN p LIMIT 25;
```
Die [] stehen fuer die Edges (also die Relations).

Das Loeschen funktineirt mit DELETE nach einen MATCH. Zum Aufpassen, wenn wir Loeschen und es Verbindungen gibt das man diese auch Mitloescht. Dies Loest man mit DETACH
```
MATCH (n) DETACH DELETE n;
```
sihe Repo von Simon (TODO: hier verlinken!)