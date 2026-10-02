# Themenkorb 8: NoSQL-Datenbanken

**Legende:**
📝 = steht so in deiner Mitschrift/deinem Code ·
🌐 = aus dem Internet ergänzt (Link bei der Stelle) ·
[Allgemeinwissen] = Standardwissen ohne eigene Quelle ·
⚠️ = Hinweis/Falle, bitte selbst prüfen ·
✅ = war ein Fehler in deinen Unterlagen, dort am 02.10.2026 ausgebessert

---

## 1. Worum geht es

> „NoSQL steht für nicht-relationale Datenbanken. Sie verzichten auf feste Tabellenschemata und sind dort besser, wo die Daten keine einheitliche Struktur haben oder Beziehungen im Mittelpunkt stehen. Ich erkläre zuerst, was ‚relational‘ eigentlich heißt, dann die Arten von NoSQL-Datenbanken und wann man sie nimmt. Danach zeige ich an MongoDB, einer dokumentbasierten Datenbank mit JSON, und an Neo4j, einer Graphdatenbank, wie man dort CRUD-Operationen und JOINs macht.“

---

## 2. Roter Faden für 15 Minuten (auswendig lernen)

| # | Abschnitt | Zeit | Kernaussagen (Stichworte) |
|---|-----------|------|---------------------------|
| 1 | **Relational vs. NoSQL, Arten** | 2,5 min | „relational“ kommt von der mathematischen **Relation** (= Tabelle), nicht von FK-Beziehungen · NoSQL = „Not only SQL“, nicht relational · Arten: dokumentbasiert (MongoDB), Graph (Neo4j), Key-Value (Redis), spaltenorientiert (Cassandra) |
| 2 | **Wann NoSQL?** | 2 min | schemaless: Daten ohne feste Struktur · Amazon: Laptop hat RAM, T-Shirt nicht – gemeinsam nur ID/Bezeichnung · Sensordaten · Beziehungsnetze → Graph · bei neuer DB-Technik immer fragen: Wie gehen CRUD, JOIN, GROUP BY? |
| 3 | **Datenformate JSON, XML, YAML** | 2,5 min | JSON: flexibel, JavaScript, Internet-Standard · XML: Attribute, Schema möglich, schwerer lesbar, mehr Speicher, XSLT übersetzt, XPath fragt ab · YAML: Einrückung, „man weiß nicht, ob es fertig ist“ |
| 4 | **MongoDB** | 4 min | Collections statt Tabellen, Dokumente (JSON/BSON) statt Zeilen · keine eigene Sprache, JS-Funktionen mit JSON-Parametern · `insertOne`, `find(filter, projection)`, `updateOne` + `$set`, `deleteOne` · Operatoren mit `$` · `aggregate`-Pipeline: `$match` (= find/WHERE), `$group` (GROUP BY), `$lookup` (JOIN) |
| 5 | **Neo4j / Cypher** | 4 min | Graph G = (V, E): Knoten + Kanten · Beziehungen sind gespeichert, kein JOIN nötig · „ASCII-Art“: `(n:Person)` Knoten, `-[:LIKES]->` Kante · `CREATE`, `MATCH … RETURN`, `SET`, `DETACH DELETE` · SQL mit vielen JOINs → ein Muster · `shortestPath` |

---

## 3. Erklärung Schritt für Schritt

### 3.1 Relational vs. NoSQL, Arten von NoSQL (≈ 2,5 min)

📝 matura-themen.md: „Was ist es überhaupt (Antwort: nicht relationale DB). Was heißt überhaupt relational … der Grund, warum die relationale so heißt, ist nicht, weil die Tabellen relational sind, sondern weil es Beziehungen zwischen den Daten in der Spalte mit dem gegebenen Namen der Spalte gibt.“

**Was heißt „relational“?** Hier hilft deine eigene RA-Mitschrift ([math.grundlagen.datenbank.md](../math-grundlagen/math.grundlagen.datenbank.md)): Eine **Relation** ist eine Teilmenge des kartesischen Produkts, „die personen ist die Table bzw. die Relation“. Eine Zeile (1, 'Max', 'Mustermann') setzt Werte aus verschiedenen Wertebereichen **in Beziehung** zueinander. Also: **Relationale DB = Datenbank aus Relationen (Tabellen) im mathematischen Sinn** – nicht, weil Tabellen über Fremdschlüssel verbunden sind.
(Das ist dieselbe Aussage wie in matura-themen.md, nur mit dem Begriff aus deiner RA-Mitschrift.)

**NoSQL** (🌐 [Wikipedia – NoSQL](https://de.wikipedia.org/wiki/NoSQL)): „Not only SQL“, nicht-relationaler Ansatz, „keine festgelegten Tabellenschemata“, „versuchen Joins zu vermeiden“.

| Art | Idee | Beispiel |
|-----|------|----------|
| **Dokumentbasiert** | Datensatz = Dokument (JSON), verschachtelt | **MongoDB** (📝) |
| **Graphbasiert** | Knoten + Kanten, Beziehungen im Mittelpunkt | **Neo4j** (📝) |
| Key-Value | Schlüssel → Wert, wie eine riesige Hash-Map | Redis (🌐) |
| Spaltenorientiert | Daten spaltenweise, für riesige Datenmengen | Cassandra (🌐) |

🌐 Laut Wikipedia bieten NoSQL-DBs oft nur „eventual consistency“ (schwächere Konsistenz als ACID) und skalieren dafür gut horizontal über viele Server. Der Markt wird aber „nach wie vor deutlich von relationalen Systemen dominiert“.

### 3.2 Wann ist NoSQL besser als SQL? (≈ 2 min)

📝 matura-themen.md: „Anwendungsbereiche, wo NoSQL besser als SQL ist (wo wir nicht wissen, wie die Daten ausschauen, **schemaless**).“

**Beispiel Amazon** (📝): Amazon verkauft Artikel. Ein Laptop hat das Feld Arbeitsspeicher, ein T-Shirt nicht – „das einzige Gemeinsame ist die ID und eventuell Bezeichnung“.
- Relational: entweder eine Tabelle mit hunderten Spalten voller NULL (wie STI, Themenkorb 2) oder für jede Produktart eine eigene Tabelle.
- MongoDB: Jedes Dokument hat einfach die Felder, die es braucht:

```javascript
db.artikel.insertMany([
  { _id: 1, bezeichnung: "ThinkPad X1", ram_gb: 16, cpu: "i7" },
  { _id: 2, bezeichnung: "T-Shirt Basic", groesse: "M", farbe: "blau" }
])
```

**Beispiel Sensor** (📝): dynamische Daten von einem Sensor, die je nach Gerät andere Werte liefern.
**Beispiel Graph** (📝 [neo4js/mitschrift.md](../neo4js/mitschrift.md)): „Wen kennt Alice, und nach wie vielen Knoten komme ich zu Dan“ – in SQL braucht man dafür viele JOINs und Rekursion, „ist sehr kompliziert in SQL“.

**Die Fragen bei jeder neuen DB-Technologie** (📝 „Spannendes Thema allgemein bei neuen DB-Technologien … das erste, was wir machen: ich schaue mir an, wie die basic CRUD-Operationen gehen, wie gehen die JOINs usw. **SQL bei den NoSQL-Fragen immer im Hinterkopf behalten.**“):
1. Wie lege ich Daten an (Create)?
2. Wie frage ich ab, wie filtere ich (Read, WHERE)?
3. Wie ändere/lösche ich (Update/Delete)?
4. Wie mache ich einen JOIN, ein GROUP BY, einen Subselect?
→ Genau diese Struktur verwende ich unten für MongoDB und Neo4j.

### 3.3 Datenformate: JSON, XML, YAML (≈ 2,5 min)

📝 matura-themen.md: „Wie speichert die MongoDB ihre Daten (JSON); wenn dieses Stichwort fällt, kann man über JSON reden.“

**JSON** (JavaScript Object Notation) – 📝 „Warum JSON: flexibel, JavaScript-Shell, Internet-Standard.“
```json
{ "name": "anna", "klasse": "3a", "noten": [1, 2, 2] }
```
(📝 aus deiner MongoDB-Aufgabe „schueler“). Objekte `{}`, Listen `[]`, Strings, Zahlen, true/false, null. REST-APIs sprechen JSON (Themenkorb 6).
🌐 MongoDB speichert intern **BSON** (binäres JSON) – die SQL-Vergleichsseite spricht von „document or BSON document“ ([mongodb.com – SQL to MongoDB](https://www.mongodb.com/docs/manual/reference/sql-comparison/)).

**XML** (📝 matura-themen.md): „eher selten, weil schwerer zu lesen, mehr Speicher und langsamer“. Vorteile: „man hat Attribute und es ist nicht schemaless (man kann sich den Aufbau überlegen; es kann auch ein Nachteil sein, da Daten, die nicht im Schema sind, Probleme machen können)“. „Man kann mit XML auch Übersetzer zwischen 2 Schemata machen (heißt **XSLT**).“
```xml
<schueler klasse="3a">
  <name>anna</name>
  <noten><note>1</note><note>2</note><note>2</note></noten>
</schueler>
```
→ `klasse` ist hier ein **Attribut**, `name` ein **Element**.

**XPath** (📝 „Spannend bei XML könnte eine Frage sein mit Doku – XPath. Wenn man das versteht, versteht man den Zusammenhang zwischen XML und DBs.“) – eine Abfragesprache, die Teile eines XML-Dokuments adressiert, Grundlage von XSLT und XQuery (🌐 [Wikipedia – XPath](https://de.wikipedia.org/wiki/XPath)). Beispiele auf das XML oben [selbst gebaut nach den Regeln aus Wikipedia]:

| XPath | Bedeutung | ≈ SQL-Idee |
|-------|-----------|------------|
| `/schueler/name` | Element `name` direkt unter `schueler` | `SELECT name` |
| `//note` | alle `note`-Elemente auf jeder Ebene | alle Werte einer Spalte |
| `/schueler[@klasse='3a']/name` | Namen der Schüler mit Attribut klasse = 3a | `WHERE klasse = '3a'` |
| `//note[1]` | jeweils die erste Note (Zählung ab 1) | |
| `//name/text()` | nur der Textinhalt | |

Zusammenhang mit DBs: XML ist ein **Baum**, XPath navigiert im Baum mit Pfad + Bedingung in `[...]` – ähnlich wie `SELECT … WHERE`.

**YAML** – 📝 „Nachteil: man weiß nicht, ob es fertig ist oder nicht.“ 🌐 [Wikipedia – YAML](https://de.wikipedia.org/wiki/YAML) bestätigt das: „Abgeschnittene YAML-Dokumente … sind meist noch gültig“. Struktur entsteht durch **Einrückung**; JSON ist eine Teilmenge von YAML 1.2. Typisch für Konfigurationsdateien.
```yaml
name: anna
klasse: 3a
noten:
  - 1
  - 2
  - 2
```
Bei JSON/XML fehlt bei einem Abbruch die schließende Klammer bzw. das schließende Tag → man merkt den Fehler. Bei YAML nicht.

### 3.4 MongoDB (≈ 4 min)

📝 Unterricht ab 10.04.2026 ([nosql/mitschrift.md](../nosql/mitschrift.md)), Klassenrepo [3/db/mongodb](../../mongodb/) bei Simon Gunacker (Mai 2026), [teststoff-4.md](../teststoff-4.md).

✅ **Korrigiert am 02.10.2026:** In nosql/mitschrift.md stand „Ist eine **hierarchische** Datenbank“, jetzt steht dort „**dokumentbasiert**“, wie in matura-themen.md, teststoff-4.md und bei 🌐 Wikipedia. Gemeint war wohl, dass Dokumente verschachtelt sein können.

**Begriffe** (📝 + 🌐 [SQL-to-MongoDB](https://www.mongodb.com/docs/manual/reference/sql-comparison/)):

| SQL | MongoDB |
|-----|---------|
| Datenbank | Datenbank |
| Tabelle | **Collection** (📝 „Arrays mit lauter JSON-Objekten“) |
| Zeile | **Dokument** |
| Spalte | Feld |
| Primärschlüssel | `_id` (automatisch) |
| JOIN | `$lookup` oder eingebettete Dokumente |
| GROUP BY | Aggregation-Pipeline (`$group`) |

📝 teststoff-4.md: „**es gibt keine eigene Sprache**, sondern Funktionen“ – die Shell `mongosh` ist eine **JavaScript-Konsole**. Parameter sind JSON-Objekte, Operatoren beginnen mit `$` (`$gt`, `$lt`, `$ne`, `$and`, `$or`).

**CRUD** (📝 Mitschrift + [MongoDB_Cheat_Sheet.md](../../../../1-2/db/MongoDB_Cheat_Sheet.md)):
```javascript
use schueler
db.schueler.insertMany([
  { name: 'anna',  klasse: '3a', noten: [1, 2, 2] },
  { name: 'ben',   klasse: '3a', noten: [2, 3, 2] },
  { name: 'clara', klasse: '3a', noten: [1, 1, 1] }
])                                                     // Create – Collection entsteht automatisch

db.schueler.find({ klasse: '3a' })                     // Read  – SELECT * WHERE klasse = '3a'
db.schueler.updateOne({ name: 'ben' }, { $set: { klasse: '3b' } })   // Update
db.schueler.deleteOne({ name: 'clara' })               // Delete
```

**find mit Projektion** (📝 Airbnb-Aufgabe): „erstes Objekt sind die Filterbedingungen und das 2. die Zeilen [Felder], die angezeigt werden“:
```javascript
db.listingsAndReviews.find(
  { property_type: 'Apartment', price: { $lt: 50 }, "address.country": "Australia", amenities: "Elevator" },
  { name: 1, _id: 0, price: 1, "address.country": 1 }
)
```
= SQL: `SELECT name, price, country FROM listings WHERE property_type = 'Apartment' AND price < 50 AND country = 'Australia' AND 'Elevator' IN amenities`. `"address.country"` greift in ein **verschachteltes** Dokument.

📝 teststoff-4.md zur Bewertung: Ob man `{ age: { $gt: 25 } }` oder `{ $gt: { age: 25 } }` schreibt, ist „egal“, aber „logische Fehler sind schlimm, nach einem `$or` kommt eine eckige Klammer, da es 2 Bedingungen hat“:
```javascript
db.schueler.find({ $or: [ { klasse: '3a' }, { klasse: '3b' } ] })
```

**Aggregation-Pipeline** (📝 teststoff-4: „**ganz wichtig**“; [aggregat.md](../nosql/aggregat.md): „historisch nur das GROUP BY, praktisch ist es die Lösung für alles“).
- Pipeline = **Array von Stages**, „wird von oben nach unten verarbeitet“ – wie `ls | grep 'Visual' | grep '2025'` in der Shell (📝).

**find mit aggregate** (📝 „was wichtig ist, zu wissen, wie man mit aggregate ein find machen kann!“):
```javascript
db.schueler.aggregate([
  { $match:   { klasse: '3a' } },           // = find-Filter / WHERE
  { $project: { name: 1, _id: 0 } }         // = Projektion / SELECT name
])
```

**GROUP BY → `$group`** (📝 aus aggregat.md, Shipwrecks-Daten):
```javascript
db.shipwrecks.aggregate([
  {
    $group: {
      _id: "$feature_type",                 // gruppieren nach diesem Feld
      feature_pro_type: { $sum: 1 },        // COUNT(*)
      avg_latdec: { $avg: "$latdec" }       // AVG(latdec)
    }
  }
])
```
= SQL: `SELECT feature_type, COUNT(*), AVG(latdec) FROM shipwrecks GROUP BY feature_type`. `$feature_type` mit `$` heißt „Wert dieses Feldes“.

**JOIN → `$lookup`** (📝 [lookup.js](../nosql/lookup.js), Aufgabe 1 – Self-Join: Wracks auf derselben Karte):
```javascript
db.shipwrecks.aggregate([
  {
    $lookup: {
      from: "shipwrecks",                   // welche Collection
      localField: "chart",                  // Feld hier
      foreignField: "chart",                // Feld dort
      as: "wracks_auf_gleicher_karte"       // Ergebnis als neues Array
    }
  }
])
```
🌐 [mongodb.com – $lookup](https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/): `$lookup` „performs a **left outer join**“ und hängt die Treffer als **Array** an jedes Dokument. 📝 Aufgabe 2 zeigt die erweiterte Form mit `let` + `pipeline` + `$match`, um das Wrack selbst auszuschließen.

> 📷 FOTO-PLATZHALTER: Skizze Aggregation-Pipeline: Collection → [$match] → [$group] → [$lookup] → Ergebnis, mit Anzahl Dokumente nach jeder Stage
> ![](bilder/08-nosql-mongodb-pipeline.png)

### 3.5 Neo4j und Cypher (≈ 4 min)

📝 Unterricht ab 22.05.2026 ([neo4js/mitschrift.md](../neo4js/mitschrift.md)), Assignment [special-queries-kiDra94](../../special-queries-kiDra94/README.md) (Juni 2026), [teststoff-4.md](../teststoff-4.md).

✅ **Korrigiert am 02.10.2026:** Deine Neo4j-Mitschrift hieß in der Überschrift noch „**GraphQL**“, jetzt heißt sie „Neo4j (Graphdatenbank, Sprache: Cypher)“. **GraphQL** ist etwas anderes, nämlich eine Abfragesprache für **APIs** [Allgemeinwissen].
✅ **Korrigiert am 02.10.2026:** Dort stand außerdem „**Ecken** (E)“, jetzt steht dort „**Kanten** (E)“. Also: G = (V, E), V = Knoten, E = Kanten.

**Graph** (📝): „Ein Graph ist eine Anzahl von Objekten und die Beziehungen dazwischen.“ G = (V, E), z. B. G = ({1, 2, 3}, {(1, 2), (1, 3), (3, 3)}). Kanten können eine **Richtung** haben.
- In Neo4j sind Beziehungen **direkt gespeichert** – man muss sie nicht per JOIN über Fremdschlüssel suchen. 🌐 Neo4j: „In Cypher, there is no need to JOIN tables. You can express connections as graph patterns instead.“ ([neo4j.com – Cypher vs SQL](https://neo4j.com/docs/getting-started/cypher/cypher-sql/))
- 📝 teststoff-4: „JOINS WICHTIG, ist die Stärke“.

**Syntax als ASCII-Art** (📝 teststoff-4: „es reicht aus, dass man in die Klammer die Datentypen setzt, Pfeile die Richtungen zeigen, eckige Klammern für die Beziehung, RETURN ist auch wichtig“):
- `(n:Person {name: 'Alice'})` → **Knoten** („Kreis“), `n` ist eine **Variable**, `Person` das Label.
- `-[:LIKES]->` → **Kante** mit Typ und Richtung.

**CRUD** (📝 Mitschrift):
```cypher
// Create
CREATE (n:Person {name: 'Alice', age: 25, profession: 'SW Developer'})
CREATE (n:Person {name: 'Bob',   age: 27, profession: 'SW Developer'})

// Beziehung anlegen: erst finden, dann verbinden
MATCH (n:Person {name: "Bob"}), (m:Person {name: "Alice"})
CREATE (m)-[:LIKES]->(n) RETURN *

// Read
MATCH (n:Person {name: "Alice"}) RETURN n LIMIT 25
MATCH p=()-[:LIKES]->() RETURN p LIMIT 25

// Update [Allgemeinwissen, nicht in der Mitschrift]
MATCH (n:Person {name: "Alice"}) SET n.age = 26

// Delete – mit Beziehungen: DETACH
MATCH (n) DETACH DELETE n
```
📝 „Wenn wir löschen und es Verbindungen gibt, … löst man das mit DETACH.“

**SQL mit vielen JOINs → Cypher** (📝 teststoff-4: „eventuell bekommen wir SQL für das Übersetzen oder einen Graphen und dann die Query dazu“). Dein Beispiel aus der Mitschrift: `Person(id, name)` und `knows(from_id, to_id)`, Alice kennt Bob und Dan, Bob kennt Charlie, Charlie kennt Dan.

„Wen kennen die Bekannten von Alice?“ in SQL:
```sql
SELECT p2.name
FROM Person alice
JOIN knows k1 ON alice.id = k1.from_id
JOIN knows k2 ON k1.to_id = k2.from_id
JOIN Person p2 ON k2.to_id = p2.id
WHERE alice.name = 'Alice';
```
✅ **Korrigiert am 02.10.2026:** In der Mitschrift stand `k1.from_id = k2.to_id`, jetzt steht dort `k1.to_id = k2.from_id`. Für „Freund eines Freundes“ muss das **Ziel** der ersten Kante der **Start** der zweiten sein.

Dasselbe in Cypher – ein Muster statt drei JOINs:
```cypher
MATCH (alice:Person {name: 'Alice'})-[:KNOWS]->()-[:KNOWS]->(fof:Person)
RETURN DISTINCT fof.name
```
Ergebnis: Charlie (über Bob).

**Wie viele Schritte bis Dan?** (📝 Assignment special-queries, [01.ShortestPath.md](../../special-queries-kiDra94/queries/01.ShortestPath.md)):
```cypher
MATCH p = shortestPath(
  (a:Person {name: 'Alice'})-[:KNOWS*..10]->(b:Person {name: 'Dan'})
)
RETURN length(p)
```
`*..10` = beliebig viele Kanten, höchstens 10 – in SQL bräuchte man dafür Rekursion.
📝 Erreichbarkeit ([02.Reachability.md](../../special-queries-kiDra94/queries/02.Reachability.md)): `RETURN exists((a)-[:FOLLOWS*..10]->(b)) AS reachable`.

🌐 Weitere Übersetzungen ([neo4j.com – Cypher vs SQL](https://neo4j.com/docs/getting-started/cypher/cypher-sql/)): `OPTIONAL MATCH` entspricht dem `LEFT OUTER JOIN`; Gruppieren ist implizit – „As soon as you use the first aggregation function, all non-aggregated columns automatically become grouping keys“ (z. B. `RETURN p.group, count(*)`).

> 📷 FOTO-PLATZHALTER: Graph-Skizze Alice → Bob → Charlie → Dan und Alice → Dan, daneben die beiden SQL-Tabellen Person/knows
> ![](bilder/08-nosql-neo4j-graph.png)

---

## 4. Zusammenhänge (zum Weiterführen des Gesprächs)

- **Relation → Themenkorb 1 (RA)**: „relational“ = mathematische Relation.
- **Schemaless ↔ Normalisierung/STI (Themenkorb 2)**: Was relational viele NULLs oder viele Tabellen braucht, ist in MongoDB einfach ein Dokument mit anderen Feldern. Dafür prüft die DB standardmäßig weniger – es gibt keine Fremdschlüssel wie in SQL; MongoDB kennt aber eine optionale Schema-Validierung [Allgemeinwissen].
- **JOIN (Themenkorb 3)** ↔ `$lookup` ↔ Cypher-Muster.
- **GROUP BY (Themenkorb 3)** ↔ `$group`.
- **Indizes (Themenkorb 4)**: `db.users.createIndex({ name: 1 })` (📝 Cheat Sheet).
- **ACID (Themenkorb 3)** ↔ „eventual consistency“ vieler NoSQL-Systeme.
- **JSON ↔ REST (Themenkorb 6)**: Dein OpenAlex-Projekt (Commit `6889b01`, 11.05.2026): [grep.py](../nosql/openalex/grep.py) holt JSON von `api.openalex.org` und speichert es mit `insert_one` in MongoDB; [app.py](../nosql/openalex/app.py) ist eine kleine Flask-API, die mit `find({"$or": [...]})` und `$regex` darin sucht.
- **ORM (Themenkorb 7)**: Auch für MongoDB gibt es ODMs/ORMs [Allgemeinwissen].
- **Python-Treiber**: `special-queries` importiert mit `neo4j`-Treiber und `MERGE` (= anlegen, falls es nicht existiert) in Batches.

## 5. Typische Fehler und Stolpersteine

- **„NoSQL = kein SQL, also besser“** – nein, es kommt auf die Daten an; relationale DBs dominieren weiterhin.
- **GraphQL mit Neo4j/Cypher verwechseln**.
- **`$or` ohne Array** → `$or: [ {…}, {…} ]`.
- **Projektion vergessen** → `find()` zeigt alles inkl. `_id`; `_id: 0` blendet sie aus.
- **`$feldname` vs. `feldname`**: In `$group` braucht man `"$feature_type"` (Wert des Feldes), als Ausgabename ohne `$`.
- **`$lookup` liefert ein Array**, auch bei nur einem Treffer.
- **Knoten mit Beziehungen löschen ohne `DETACH`** → Fehler.
- **`CREATE` statt `MATCH` für vorhandene Knoten** → Duplikate; vorher `MATCH` (oder `MERGE`).

## 6. Mögliche Nachfragen der Prüfer

**Warum heißt eine relationale Datenbank „relational“?**
Weil die Tabellen Relationen im mathematischen Sinn sind – Teilmengen eines kartesischen Produkts. Nicht wegen der Beziehungen über Fremdschlüssel.

**Wann würdest du MongoDB statt SQLite nehmen?**
Wenn die Daten keine feste Struktur haben, z. B. Produkte mit ganz unterschiedlichen Eigenschaften oder Sensordaten, und wenn ich viele Daten als JSON speichern will. Bei stark verknüpften Daten mit festen Regeln (Bank, Lager) eher relational.

**Wie macht man in MongoDB einen JOIN?**
Mit der Aggregation-Pipeline und der Stage `$lookup`: from, localField, foreignField, as. Das ist ein Left Outer Join, die Treffer kommen als Array ins Dokument. Oder man bettet die Daten gleich ins Dokument ein.

**Wie macht man ein GROUP BY in MongoDB?**
`aggregate` mit `$group`: `_id` ist das Gruppierungsfeld, dazu Akkumulatoren wie `$sum: 1` oder `$avg`.

**Wie sieht eine Abfrage in Cypher aus?**
`MATCH (p:Person {name: 'Alice'})-[:KNOWS]->(f) RETURN f.name`. Runde Klammern sind Knoten, eckige Klammern die Beziehung, der Pfeil die Richtung.

**Warum ist eine Graphdatenbank bei „Freund von Freund“ besser?**
Weil die Beziehungen gespeichert sind und man ihnen direkt folgt. In SQL braucht jede Ebene einen weiteren Self-Join auf die Beziehungstabelle, bei unbekannter Tiefe sogar Rekursion.

**Warum JSON und nicht XML?**
JSON ist kürzer, leichter zu lesen, braucht weniger Speicher und ist direkt JavaScript – die Mongo-Shell ist ja eine JS-Konsole. XML hat dafür Attribute, Schemata, XPath und XSLT.

**Was ist XPath?**
Eine Abfragesprache für XML-Dokumente. Mit Pfaden wie `/schueler/name` und Bedingungen in eckigen Klammern wählt man Teile des XML-Baums aus, ähnlich wie SELECT und WHERE.

## 7. Quellen

**Deine Dateien:**
- [matura-themen.md](../matura-themen.md), [teststoff-4.md](../teststoff-4.md) (Commits `f42415a` 29.05., `17745ec` 31.05.2026)
- [nosql/mitschrift.md](../nosql/mitschrift.md) (Commits `088448d`–`454ad96`, 10.–20.04.2026), [nosql/aggregat.md](../nosql/aggregat.md) (`9ef7a14`, 04.05.2026), [nosql/lookup.md](../nosql/lookup.md), [nosql/lookup.js](../nosql/lookup.js) (`d0e0fb7`, 11.05.2026), [nosql/openalex/grep.py](../nosql/openalex/grep.py) + [app.py](../nosql/openalex/app.py) (`6889b01`)
- [3/db/mongodb/](../../mongodb/) (Klassenrepo; deine Dateien drazen.aggregate.md, drazen.lookup.md/.js, openalex_drazen/; Commits `bc0bbd8`, `fbaa282` 08.05., `4bfb26c` 18.05.2026)
- [1-2/db/MongoDB_Cheat_Sheet.md](../../../../1-2/db/MongoDB_Cheat_Sheet.md)
- [neo4js/mitschrift.md](../neo4js/mitschrift.md) (Commits `3827930`, `632a09f` 22.05., `e062b01`, `8ac5835` 29.05., `3326298` 08.06.2026 „siehe Repo von Guni, noch verlinken“)
- [3/db/special-queries-kiDra94/](../../special-queries-kiDra94/README.md) README.md, queries/01.ShortestPath.md, queries/02.Reachability.md, src/main.py
- [math-grundlagen/math.grundlagen.datenbank.md](../math-grundlagen/math.grundlagen.datenbank.md)

**Internet:**
- https://de.wikipedia.org/wiki/NoSQL
- https://www.mongodb.com/docs/manual/reference/sql-comparison/
- https://www.mongodb.com/docs/manual/reference/operator/aggregation/lookup/
- https://neo4j.com/docs/getting-started/cypher/cypher-sql/ (auch in teststoff-4 verlinkt)
- https://de.wikipedia.org/wiki/XPath
- https://de.wikipedia.org/wiki/YAML

**Nicht gefunden:** das in der Neo4j-Mitschrift erwähnte Repo von Simon/Guni.
