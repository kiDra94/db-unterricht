## GraphQL

Graphen sind Mengen von Konten(V) und Ecken(E) (die Beziehungen zwischen den Knoten) (Node, Edges). Ein Graph ist eine Anzahl von Objekten und die Beziehungen daszwischen.

BSP:

```
G = (V, E)

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
