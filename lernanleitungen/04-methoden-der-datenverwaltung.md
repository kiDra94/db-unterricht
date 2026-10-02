# Themenkorb 4: Methoden der Datenverwaltung

**Legende:**
📝 = steht so in deiner Mitschrift/deinem Code ·
🌐 = aus dem Internet ergänzt (Link bei der Stelle) ·
[Allgemeinwissen] = Standardwissen ohne eigene Quelle ·
⚠️ = Hinweis/Falle, bitte selbst prüfen ·
✅ = war ein Fehler in deinen Unterlagen, dort am 02.10.2026 ausgebessert

---

## 1. Worum geht es

> „Hier geht es darum, wie eine Datenbank ihre Daten intern organisiert, damit sie schnell gefunden werden. Das Hauptthema sind Indizes: Sie machen das Lesen schneller, kosten aber Speicher und machen das Schreiben langsamer. Ich erkläre, wie ein Index mit einem B+-Baum oder einer Hash-Map funktioniert und wann ein Index sinnvoll ist.“

---

## 2. Roter Faden für 15 Minuten (auswendig lernen)

| # | Abschnitt | Zeit | Kernaussagen (Stichworte) |
|---|-----------|------|---------------------------|
| 1 | **Problem: Full Table Scan** | 2 min | `SELECT … WHERE` ohne Index = jede Zeile anschauen = O(n) · Telefonbuch: sortiert nach Nachname → schnell, nach Telefonnummer suchen → alles durchlesen |
| 2 | **Index & deine Übung** | 4 min | Index = sortierte Zusatzstruktur „Wert → Zeile“ · PK hat automatisch einen Index · kostet Speicher (+17,2 % bei 500 000 Kunden) · Streuung entscheidet (address 100 %, firstname 0,14 %) · `EXPLAIN QUERY PLAN`: SCAN vs SEARCH USING INDEX · `LIKE '%…'` kann keinen Index nutzen |
| 3 | **B+-Baum** | 4 min | balanciert: alle Blätter auf gleicher Höhe · Knoten = Festplattenseite, ein Sprung = ein Laden von Platte in den RAM · viele Schlüssel pro Knoten → flacher Baum → O(log n) · Einfügen: Knoten voll → teilen, mittlerer Schlüssel nach oben · B+: Daten nur in den Blättern, Blätter verkettet → Bereichsabfragen · Umbauen langsam, egal, weil Lesen zählt |
| 4 | **Hash-Map** | 3 min | Hashfunktion: Wert → Platz im Array → O(1) · Beispiel Anfangsbuchstabe (nur zur Veranschaulichung!) · Kollisionen → Liste pro Bucket · Nachteil: Speicher reservieren, Umstrukturieren, keine Bereiche/Sortierung · Einsatz: Hash-Index, Hash-Join, Cache, laufende Transaktionen merken |
| 5 | **Caching & Wann Index?** | 2 min | Cache: Betriebssystem bzw. Page Cache der DB hält oft gebrauchte Seiten im RAM · Index sinnvoll: hohe Streuung, oft in WHERE/JOIN, viel Lesen · nicht sinnvoll: kleine Tabellen, wenig Streuung, viel Schreiben |

---

## 3. Erklärung Schritt für Schritt

### 3.1 Das Problem: Full Table Scan (≈ 2 min)

📝 matura-themen.md („Allgemeine Infos“): „Was ist ein Full Table Scan (`select * from where` (ohne Indices)), Laufzeit O(n).“

Ohne Index weiß die DB nicht, wo „Huber“ steht. Sie muss **jede Zeile** lesen und vergleichen – das ist die lineare Suche aus Themenkorb 1:

```python
def full_table_scan(tabelle, spalte, gesucht):
    treffer = []
    for zeile in tabelle:
        if zeile[spalte] == gesucht:
            treffer.append(zeile)
    return treffer
```

**Telefonbuch-Bild** (📝 „Bsp mit Telefonbuch ist bildlich leicht vorstellbar“):
- Das Telefonbuch ist **nach Nachnamen sortiert** → ich schlage in der Mitte auf, gehe nach vorne oder hinten → wenige Schritte. Das ist ein **Index auf Nachname**.
- Suche ich jemanden **nach der Telefonnummer**, hilft die Sortierung nichts → ich muss das ganze Buch lesen = Full Table Scan.
- Will ich auch schnell nach Nummer suchen, brauche ich **ein zweites Buch**, sortiert nach Nummer, mit Verweis auf den Eintrag. Genau das ist ein zusätzlicher Index – und deshalb kostet er Speicher.

### 3.2 Was ist ein Index, und was hat deine Übung gezeigt (≈ 4 min)

📝 matura-themen.md: „Macht es schneller, kostet aber Speicher! Es gibt da eine Übung dazu, und die reicht dafür vollkommen aus.“ → Die Übung ist [3/db/assigment/assigment-indizes](../../assigment/assigment-indizes/report.md) (Commits 22.–25.09.2025).

**Index** = eigene, sortierte Datenstruktur neben der Tabelle: **Spaltenwert → Verweis auf die Zeile**. In SQLite ist jeder Index ein eigener B-Baum (🌐 [sqlite.org/arch.html](https://www.sqlite.org/arch.html): „separate B-trees are used for each table and each index“).

```sql
CREATE INDEX IF NOT EXISTS index_address ON customer (address);
DROP INDEX IF EXISTS index_address;
```

**Automatische Indizes** (📝): „Auf den PK ist automatisch von der DB ein Index gesetzt, man soll sich aber selber überlegen, wo welche Sinn machen, z. B. Name bei Person.“
- Auch `UNIQUE` erzeugt einen Index: 📝 Prisma hat aus `seriennummer @unique` automatisch `CREATE UNIQUE INDEX "Articel_seriennummer_key"` gemacht ([Migration](../../2-test-kiDra94/prisma/migrations/20251215094904_articel/migration.sql)).

**Was deine Übung gemessen hat** (📝 [report.md](../../assigment/assigment-indizes/report.md)):
- 500 000 Kunden mit Faker generiert (firstname, lastname, email, address).
- **Speicher**: Datei wächst durch den Index auf `lastname` von 41,75 MB auf 48,94 MB = **+17,2 %**.
- **Streuung** (deine Definition: Anteil verschiedener Werte; 100 % = keine Duplikate):

| Spalte | verschiedene Werte | Streuung |
|--------|--------------------|----------|
| firstname | 690 | ≈ 0,14 % |
| lastname | 1 000 | ≈ 0,20 % |
| email | 319 382 | ≈ 63,88 % |
| address | 500 000 | 100 % |

- Deine Schlussfolgerung: „Rein technisch würde der Index am meisten Sinn bei der 'address' machen, da in diesem Fall die Streuung die größte ist.“
- Fachbegriff [Allgemeinwissen]: Streuung ≈ **Selektivität**. Je selektiver eine Spalte, desto weniger Zeilen liefert eine Suche und desto mehr bringt der Index.

✅ **Zeitmessung in deiner Übung – korrigiert am 02.10.2026.** Die alte Messung war falsch, die alten Prozentzahlen (60 % / 80 %) bitte **nicht** mehr nennen:
1. Für „mit Index“ wurde nur `EXPLAIN QUERY PLAN SELECT …` gemessen (seit Commit `c9a3115`, 25.09.2025). `EXPLAIN QUERY PLAN` **führt die Abfrage nicht aus**, es zeigt nur den Plan (🌐 [sqlite.org/eqp.html](https://www.sqlite.org/eqp.html)).
2. Ohne Index wurde nach `firstname` gesucht, mit Index nach `lastname` – zwei verschiedene Abfragen.
3. `LIKE '%IL%'` beginnt mit einem Platzhalter → SQLite versucht dann gar nicht, einen Index zu benutzen (🌐 [sqlite.org/optoverview.html](https://www.sqlite.org/optoverview.html): „if the right-hand side begins with a wildcard character then this optimization is not attempted“).
4. Auch `LIKE 'B%'` nutzt einen normalen Index in SQLite **nicht**, weil `LIKE` standardmäßig Groß/Kleinschreibung ignoriert und der Index binär sortiert ist (gleiche Quelle).

In SQLite 3.46 nachgeprüft:

```text
EXPLAIN QUERY PLAN SELECT * FROM p WHERE name = 'Max'       → SEARCH p USING COVERING INDEX ix (name=?)
EXPLAIN QUERY PLAN SELECT * FROM p WHERE name LIKE 'B%'     → SCAN p
EXPLAIN QUERY PLAN SELECT * FROM p WHERE name LIKE '%IL%'   → SCAN p
EXPLAIN QUERY PLAN SELECT * FROM p WHERE id = 5             → SEARCH p USING INTEGER PRIMARY KEY (rowid=?)
```

**Was jetzt in deiner Übung steht:** [time_measurement.py](../../assigment/assigment-indizes/time_measurement.py) und [index_address.py](../../assigment/assigment-indizes/index_address.py) messen dieselbe Abfrage mit `=`, einmal ohne und einmal mit Index (Durchschnitt aus 5 Läufen, inkl. `fetchall()`), und zeigen dazu den Plan. Neue Ergebnisse (auf einer Kopie von fake_dat.db gemessen, auch in [report.md](../../assigment/assigment-indizes/report.md)):

| Abfrage | ohne Index (`SCAN`) | mit Index (`SEARCH … USING INDEX`) |
|---------|---------------------|------------------------------------|
| `WHERE lastname = 'Abbott'` (212 Treffer) | ca. 50 ms | ca. 0,5 ms (≈ 100-mal schneller) |
| `WHERE address = '…'` (1 Treffer, 100 % Streuung) | ca. 51 ms | ca. 0,03 ms |

**So erzählst du die Übung in der Prüfung:** 500 000 Kunden, Index kostet 17,2 % Speicher. Die Streuung entscheidet, welche Spalte sich lohnt. Ohne Index zeigt `EXPLAIN QUERY PLAN` einen `SCAN`, also einen Full Table Scan mit ca. 50 ms. Mit Index zeigt er `SEARCH … USING INDEX`, das dauert nur Bruchteile einer Millisekunde. Bei der Adresse ist der Gewinn am größten, weil nur eine Zeile gefunden wird.

> 📷 FOTO-PLATZHALTER: Screenshot Terminal: EXPLAIN QUERY PLAN vor dem Index (SCAN customer) und nach dem Index (SEARCH customer USING INDEX index_address)
> ![](bilder/04-datenverwaltung-explain-query-plan.png)

### 3.3 B+-Baum (≈ 4 min)

📝 matura-themen.md: „Alternative sind B+-Bäume, eventuell es auch hinzeichnen, warum sie balanciert sein müssen, also jedes Elternteil möglichst gleich viel Kinder hat. Es gibt 2 Referate dazu (meins und von der Anh).“ Und: „sichere Folgefragen zu Indices“.
📝 Dein Referat-Repo: [1-2/db/b-tree](../../../../1-2/db/b-tree/README.md) (Juni 2025, „Vortrag ca. 40 Minuten“).
⚠️ Das Referat von Anh liegt nicht in deinen Unterlagen.

**Grundidee:** Ein Suchbaum, bei dem jeder Knoten **viele** Schlüssel hat (nicht nur einen wie beim binären Baum).

**Regeln** (📝 README):
- „Alle Leafs müssen auf gleicher Höhe sein.“ → der Baum ist **balanciert**, jeder Weg von der Wurzel zu einem Blatt ist gleich lang → Suche ist immer gleich schnell, nie „entartet“.
- Der **Grad** (in der Literatur d, t, k oder m) bestimmt, wie viele Schlüssel ein Knoten haben darf. In deinem Code [b_tree_exp.py](../../../../1-2/db/b-tree/b_tree_exp.py): Mindestgrad t, maximal **2t − 1** Schlüssel pro Knoten.

**Warum ist das für Datenbanken so gut?** (📝 matura-themen.md)
- „Der Sprung zwischen den Knoten ist Laden der Daten von der Festplatte in die Memory, die Kinder werden auf einmal geladen und die Suche ist dann schnell.“
- 📝 Genau das simuliert dein [binary_tree.py](../../../../1-2/db/b-tree/binary_tree.py) mit den Klassen `Hdd` und `Ram` und `time.sleep(2)` beim Laden: **Festplattenzugriffe sind teuer**, Vergleiche im RAM billig.
- Ein Knoten entspricht einer Festplattenseite (🌐 SQLite: Seiten von standardmäßig 4096 Byte, [arch.html](https://www.sqlite.org/arch.html)). Viele Schlüssel pro Knoten → **sehr flacher Baum** → wenige Plattenzugriffe.
- Zahlenbeispiel [selbst gerechnet]: Mit 100 Kindern pro Knoten reichen 3 Ebenen für 100 · 100 · 100 = 1 000 000 Einträge → 3 Plattenzugriffe statt bis zu 1 000 000 Zeilen lesen.
- Laufzeit: Suchen, Einfügen, Löschen O(log n).

**Einfügen – Beispiel mit t = 2** (max. 3 Schlüssel pro Knoten), so wie dein Code es macht (voller Knoten wird beim Hinunterlaufen geteilt, der **mittlere Schlüssel wandert nach oben**, „Middle element promoted“):

```text
Einfügen 10, 20, 30:        [10 | 20 | 30]                  (Knoten voll)

Einfügen 40:                Wurzel voll → teilen, 20 nach oben
                                  [20]
                                /      \
                           [10]        [30 | 40]

Einfügen 50:                      [20]
                                /      \
                           [10]        [30 | 40 | 50]       (Blatt voll)

Einfügen 60:                Blatt voll → teilen, 40 nach oben
                                [20 | 40]
                              /     |     \
                          [10]    [30]    [50 | 60]
```

Der Baum wächst **nach oben** (neue Wurzel), nicht nach unten – deshalb bleiben alle Blätter auf gleicher Höhe [Allgemeinwissen].

**B-Baum vs. B+-Baum** – Dein Code in `b-tree` ist ein **B-Baum** (Schlüssel und Werte auch in den inneren Knoten), im Matura-Text steht **B+-Baum** (✅ dort steht jetzt ein Hinweis auf den Unterschied). Der Unterschied (🌐 [Wikipedia – B+-Baum](https://de.wikipedia.org/wiki/B%2B-Baum)):
- B+-Baum: „Die eigentlichen Datenelemente werden nur in den Blattknoten gespeichert, während die inneren Knoten lediglich Schlüssel enthalten.“
- Die **Blätter sind verkettet** → „für Bereichsanfragen optimal geeignet“ (z. B. `WHERE preis BETWEEN 10 AND 20`: einmal zum ersten Blatt, dann einfach weiterlaufen).
- Innere Knoten haben mehr Platz für Schlüssel → noch flacher.

**Nachteil** (📝): „Umstrukturierung ist langsam, kann uns aber egal sein, da wir die Read-Befehle schnell haben wollen.“ Bei jedem INSERT/UPDATE/DELETE muss jeder Index mitgepflegt werden, eventuell mit Splits.

**Zum Üben** (📝 „es gibt viele Websites, wo man Daten in einen B+-Baum einfügen kann“): z. B. 🌐 „B+ Tree Visualization“ der University of San Francisco: https://www.cs.usfca.edu/~galles/visualization/BPlusTree.html (Seite existiert; dass man dort Werte einfügen kann, konnte ich ohne JavaScript nicht prüfen – bitte selbst ausprobieren).

> 📷 FOTO-PLATZHALTER: Selbst gezeichneter B+-Baum mit 3 Ebenen, Blätter durch Pfeile verkettet, ein Suchweg rot markiert
> ![](bilder/04-datenverwaltung-bplus-baum.png)

> 📷 FOTO-PLATZHALTER: Tafelbild Einfügen 10–60 mit Splits (wie oben)
> ![](bilder/04-datenverwaltung-bbaum-split.png)

### 3.4 Hash-Map (≈ 3 min)

📝 matura-themen.md: „Anschauen wie sie funktionieren, bei Laufzeit angeben, dass es O(1) ist. **Beispiel mit Anfangsbuchstaben explizit erwähnen, dass es nur zur Veranschaulichung ist.** Die Hash-Map kann viel mehr.“

**Idee:** Eine **Hashfunktion** rechnet aus dem Schlüssel direkt eine Position im Array aus. Kein Suchen, nur einmal rechnen → **O(1)** im Mittel.

**Dein Beispiel aus dem Unterricht** (📝 [math-grundlagen/basic.py](../math-grundlagen/basic.py), Klasse `MengeNamen`, 20.03.2026): 26 Plätze, Position = Anfangsbuchstabe.

```python
class NamenHashMap:
    def __init__(self):
        self.buckets = []
        for i in range(26):
            self.buckets.append([])

    def hash(self, name):
        # Anfangsbuchstabe → Zahl 0..25 (NUR zur Veranschaulichung!)
        return (ord(name[0].upper()) - ord('A')) % 26

    def add(self, name):
        index = self.hash(name)
        self.buckets[index].append(name)

    def contains(self, name):
        index = self.hash(name)
        for eintrag in self.buckets[index]:
            if eintrag == name:
                return True
        return False
```

- „Anton“, „Albert“, „Alina“ landen alle im selben Platz → **Kollision**. Lösung hier: pro Platz eine Liste (**Verkettung**, 🌐 [Wikipedia – Hashtabelle](https://de.wikipedia.org/wiki/Hashtabelle)).
- 📝 Das `% 26` steht da, „damit Ötzie Platz hat“: `ord('Ö')` liegt außerhalb A–Z; durch Modulo landet Ötzie trotzdem in einem gültigen Platz (nachgerechnet: (214 − 65) % 26 = 19, also beim „T“).
- **Warum nur Veranschaulichung?** Echte Hashfunktionen verteilen gleichmäßig. Beim Anfangsbuchstaben wären „E“ und „S“ voll und „X“ fast leer [Allgemeinwissen].

**Laufzeit** (🌐 Wikipedia): im Mittel O(1), im schlechtesten Fall (alles im selben Bucket) **O(n)**.

**Nachteile** (📝 matura-themen.md + 🌐):
- **Speicher**: „Je mehr ich Hashmap habe, desto mehr Speicher brauche ich“; man reserviert Plätze im Voraus.
- **Umstrukturieren**: Wird die Tabelle zu voll (Lastfaktor), muss sie vergrößert und alles neu verteilt werden (Rehashing).
- **Keine Bereichsabfragen und keine Sortierung**: Hash von 10 und 11 liegen irgendwo. Deshalb nehmen DBs für normale Indizes meist B-Bäume [Allgemeinwissen].

**Wo DBs Hash-Maps benutzen** (📝 „Anwendungsfall neben den Indices ist Caching, JOINs (Keys matchen) … merken von laufenden Transaktionen“):
- **Hash-Index**: z. B. PostgreSQL `CREATE INDEX … USING HASH`, nur für `=`-Vergleiche [Allgemeinwissen, 🌐 [postgresql.org – Hash Indexes](https://www.postgresql.org/docs/current/hash-index.html)].
- **Hash-Join**: Kleinere Tabelle in eine Hash-Map laden (Key = Join-Spalte), dann die größere einmal durchgehen und jeweils in O(1) nachschauen (🌐 [Wikipedia – Join](https://en.wikipedia.org/wiki/Join_(SQL)) nennt Hash-Joins).

```python
def hash_join(kunden, bestellungen):
    kunden_nach_id = {}
    for kunde in kunden:
        kunden_nach_id[kunde["id"]] = kunde
    ergebnis = []
    for bestellung in bestellungen:
        kunde = kunden_nach_id.get(bestellung["kunde_id"])
        if kunde is not None:
            ergebnis.append((kunde["name"], bestellung["id"]))
    return ergebnis
```

- **Cache**: Seitennummer → Seite im RAM [Allgemeinwissen].
- **Laufende Transaktionen merken**: Transaktions-ID → Zustand/Sperren (📝 Stichwort aus matura-themen.md; wie genau ein bestimmtes DBMS das intern macht, habe ich nicht nachgeprüft).
- 📝 Python-`dict` und `set` sind Hash-Maps – auch in deinem Code: `lagerbewegung_menge_dict = dict(lagerbewegung_menge)` in [reporting.py](../../assigment/lagerverwaltung-kiDra94/reporting.py).

> 📷 FOTO-PLATZHALTER: Skizze Array mit 26 Plätzen A–Z, bei „A“ eine Liste Anton → Albert → Alina (Kollision), Ötzie bei „T“
> ![](bilder/04-datenverwaltung-hashmap.png)

### 3.5 Caching & wann ein Index sinnvoll ist (≈ 2 min)

📝 matura-themen.md: Caching ist „eher eine Folgefrage für 1 und 2“; „das Betriebssystem kümmert sich darum, mehr Informationen dazu brauchen wir nicht wissen.“

- **Cache** = schneller Zwischenspeicher (RAM) für oft gebrauchte Daten von der langsamen Platte.
- Das Betriebssystem puffert Dateizugriffe; zusätzlich hat SQLite einen eigenen **Page Cache** (🌐 [arch.html](https://www.sqlite.org/arch.html): „responsible for reading, writing, and caching these pages“).
- Zusammenhang mit dem B-Baum: Die oberen Knoten (Wurzel) werden ständig gebraucht und liegen praktisch immer im Cache → oft ist nur der letzte Sprung ein echter Plattenzugriff [Allgemeinwissen].

**Index – ja oder nein?** (Zusammenfassung aus deiner Übung + [Allgemeinwissen])

| Index sinnvoll | Index eher nicht |
|----------------|------------------|
| Spalte wird oft in `WHERE`, `JOIN`, `ORDER BY` benutzt | kleine Tabelle (Scan ist eh schnell) |
| hohe Streuung (address, email) | geringe Streuung (Geschlecht, Status) |
| viel Lesen, wenig Schreiben | sehr viele INSERT/UPDATE/DELETE |
| FK-Spalten (für JOINs) | Suche mit `LIKE '%…'` |

---

## 4. Zusammenhänge (zum Weiterführen des Gesprächs)

- **O-Notation → Themenkorb 1**: Full Table Scan O(n), B-Baum O(log n), Hash O(1).
- **Optimizer → Themenkorb 1**: Er entscheidet, ob ein Index benutzt wird; `EXPLAIN QUERY PLAN` zeigt es.
- **PK/UNIQUE → Themenkorb 2**: erzeugen automatisch einen Index.
- **JOINs → Themenkorb 3**: Indizes auf FK-Spalten, Hash-Join.
- **Transaktionen → Themenkorb 3**: Jeder Index muss beim Schreiben in derselben Transaktion mitgeändert werden.
- **ORM → Themenkorb 7**: `@unique`/`@id` in Prisma erzeugen Indizes in der Migration.
- **NoSQL → Themenkorb 8**: MongoDB hat ebenfalls Indizes: `db.users.createIndex({ name: 1 })` (📝 [MongoDB_Cheat_Sheet.md](../../../../1-2/db/MongoDB_Cheat_Sheet.md)); bei Neo4j war Indexing laut teststoff-4 „nicht wichtig“.

## 5. Typische Fehler und Stolpersteine

- **„Index macht alles schneller“** – nein: Schreiben wird langsamer, Speicher wächst.
- **Index auf Spalte mit wenig Streuung** bringt kaum etwas.
- **`LIKE '%xyz'`** kann keinen B-Baum-Index nutzen (Anfang unbekannt → wo im sortierten Baum anfangen?).
- **Messen mit `EXPLAIN QUERY PLAN`** – das ist kein Zeitmessen (siehe oben).
- **B-Baum ≠ binärer Baum**: B-Baum hat viele Schlüssel pro Knoten.
- **B-Baum ≠ B+-Baum**: beim B+ liegen die Daten nur in den Blättern, die Blätter sind verkettet.
- **Hash-Map ist nicht immer O(1)**: bei vielen Kollisionen O(n).

## 6. Mögliche Nachfragen der Prüfer

**Warum nimmt man für Indizes B-Bäume und nicht Hash-Maps?**
Weil B-Bäume sortiert sind: Sie können `=`, `<`, `>`, `BETWEEN` und `ORDER BY`. Eine Hash-Map kann nur `=`. Außerdem muss eine Hash-Map beim Wachsen komplett neu verteilt werden.

**Warum muss der Baum balanciert sein?**
Damit jeder Weg zu einem Blatt gleich lang ist. Dann ist jede Suche O(log n). Ein unbalancierter Baum kann zu einer Liste entarten, dann ist die Suche O(n).

**Was passiert, wenn ein Knoten voll ist?**
Er wird geteilt: Der mittlere Schlüssel wandert in den Elternknoten, links und rechts davon entstehen zwei halb volle Knoten. Ist die Wurzel voll, entsteht eine neue Wurzel – der Baum wächst nach oben.

**Warum hat ein B-Baum-Knoten so viele Schlüssel?**
Weil ein Knoten einer Festplattenseite entspricht. Das Laden einer Seite ist teuer, die Vergleiche im RAM sind billig. Viele Schlüssel pro Seite → wenige Ebenen → wenige Plattenzugriffe.

**Was ist eine Hash-Kollision und wie löst man sie?**
Zwei verschiedene Schlüssel bekommen denselben Hashwert. Lösung: pro Platz eine Liste (Verkettung) oder einen anderen freien Platz suchen (offene Adressierung).

**Wo würdest du in der Personen-Tabelle einen Index setzen?**
Der PK hat schon einen. Zusätzlich auf Spalten, nach denen oft gesucht wird und die gut streuen – z. B. Nachname oder E-Mail. Nicht auf Geschlecht.

**Wie überprüfst du, ob dein Index benutzt wird?**
Mit `EXPLAIN QUERY PLAN`: `SEARCH … USING INDEX` heißt ja, `SCAN` heißt Full Table Scan.

## 7. Quellen

**Deine Dateien:**
- [matura-themen.md](../matura-themen.md)
- [3/db/assigment/assigment-indizes/](../../assigment/assigment-indizes/report.md): report.md, generete_db.py, streuung.py, time_measurement.py, index_address.py (Commits 22.–25.09.2025, v. a. `a872410` „comparing file size befor/after index“, `c9a3115` „… fixed sql stmt index now must be use“, `d511df5` „implemnted index and time meassurement for address“)
- [1-2/db/b-tree/](../../../../1-2/db/b-tree/README.md): README.md (UTF-16 kodiert), b_tree_exp.py, b_tree_time.py, binary_tree.py (Commits 09.–17.06.2025, `a9799ff` „binary tree basic function, hdd and ram loading with sleep 2 sek“)
- [math-grundlagen/basic.py](../math-grundlagen/basic.py) (`MengeNamen`, Commit `008a45e`)
- [2-test-kiDra94 Migration](../../2-test-kiDra94/prisma/migrations/20251215094904_articel/migration.sql)
- [1-2/db/MongoDB_Cheat_Sheet.md](../../../../1-2/db/MongoDB_Cheat_Sheet.md)

**Internet:**
- https://www.sqlite.org/eqp.html
- https://www.sqlite.org/optoverview.html (LIKE-Optimierung)
- https://www.sqlite.org/arch.html
- https://de.wikipedia.org/wiki/B%2B-Baum
- https://de.wikipedia.org/wiki/Hashtabelle
- https://en.wikipedia.org/wiki/Join_(SQL)
- https://www.postgresql.org/docs/current/hash-index.html

**Nicht gefunden:** Referat von Anh zum B+-Baum.
