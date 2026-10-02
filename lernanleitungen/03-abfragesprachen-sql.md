# Themenkorb 3: Abfragesprachen – SQL

**Legende:**
📝 = steht so in deiner Mitschrift/deinem Code ·
🌐 = aus dem Internet ergänzt (Link bei der Stelle) ·
[Allgemeinwissen] = Standardwissen ohne eigene Quelle ·
⚠️ = Hinweis/Falle, bitte selbst prüfen ·
✅ = war ein Fehler in deinen Unterlagen, dort am 02.10.2026 ausgebessert

---

## 1. Worum geht es

> „SQL ist die Standardsprache für relationale Datenbanken. Sie ist deklarativ: Ich sage, *was* ich haben will, nicht *wie* die Datenbank es suchen soll. Ich erkläre die Kategorien der Sprache, wie man mit JOINs und Subselects Daten aus mehreren Tabellen holt und mit GROUP BY auswertet, wozu Views gut sind und warum man zusammengehörige Statements in eine Transaktion packt.“

---

## 2. Roter Faden für 15 Minuten (auswendig lernen)

| # | Abschnitt | Zeit | Kernaussagen (Stichworte) |
|---|-----------|------|---------------------------|
| 1 | **Was ist SQL, Kategorien** | 2,5 min | deklarativ · DDL (CREATE/ALTER/DROP), DML (INSERT/UPDATE/DELETE), DQL (SELECT), DCL (GRANT/User – PostgreSQL, nicht SQLite), Transaktionssteuerung (BEGIN/COMMIT/ROLLBACK) · „INSERT INTO personen … Max Mustermann“ = DML |
| 2 | **JOINs** | 3 min | JOIN = Kreuzprodukt + Bedingung · INNER (nur Treffer), LEFT (alle links, rechts NULL), RIGHT, FULL, CROSS, SELF (abteilung.parent_id) · Grafik mit den Kreisen · Beispiel Bewerber LEFT JOIN Status |
| 3 | **Gruppieren & Aggregieren** | 2 min | `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` · `GROUP BY` = Zeilen mit gleichem Wert zusammenfassen · `WHERE` filtert Zeilen **vor**, `HAVING` filtert Gruppen **nach** dem Gruppieren · `ORDER BY` sortiert · Bsp. Umsatz pro Kunde |
| 4 | **Subselects** | 2 min | SELECT in einem SELECT · in WHERE (IN, EXISTS, Vergleich mit AVG), als Wert in Trigger-WHEN · verliert gegen JOIN, sobald ich Spalten aus der 2. Tabelle **anzeigen** will |
| 5 | **Views** | 2,5 min | „ein SELECT, der einen Namen bekommt“ · Vorteile: Komplexität verstecken, Berechtigungen, Frontend braucht kein SQL · Nachteil: meistens nur R von CRUD · Lösung: `INSTEAD OF`-Trigger (E-Book-View Bibliothek) |
| 6 | **Transaktionen & ACID** | 3 min | mehrere Statements, die fachlich zusammengehören → alle oder keines · BEGIN/COMMIT/ROLLBACK · Überweisung Alice → Bob · SQLite sperrt (database is locked) · Savepoints (Warenkorb bleibt, Zahlung scheitert) · ACID: Atomarität, Konsistenz, Isolation, Dauerhaftigkeit |

---

## 3. Erklärung Schritt für Schritt

### 3.1 Was ist SQL, welche Kategorien gibt es (≈ 2,5 min)

📝 matura-themen.md: „Grundverständnis, was SQL überhaupt ist, welche Kategorien es in der Sprache gibt. DQL DDL DML DCL usw. Bsp. insert into Personen max mustermann ist DML.“

**SQL** (Structured Query Language) [Allgemeinwissen]: Standardsprache für relationale Datenbanken; **deklarativ** – ich beschreibe das Ergebnis, das DBMS (Optimizer) entscheidet den Weg. Grundlage ist die relationale Algebra (Themenkorb 1).

| Kategorie | Wofür | Befehle | Beispiel aus deinen Dateien |
|-----------|-------|---------|-----------------------------|
| **DDL** – Data Definition | Schema | `CREATE`, `ALTER`, `DROP` | `CREATE TABLE konto (...)`, `ALTER TABLE konto ADD COLUMN kontorahmen ...` ([bank.sql](../transaktion/bank.sql)) |
| **DML** – Data Manipulation | Daten ändern | `INSERT`, `UPDATE`, `DELETE` | `INSERT INTO konto VALUES(1, 'Alice', 1000.00);` |
| **DQL** – Data Query | Daten lesen | `SELECT` | `SELECT * FROM log;` |
| **DCL** – Data Control | Rechte | `GRANT`, `REVOKE`, User anlegen | 📝 „haben wir nicht gemacht in SQLite, in PostgreSQL kann man da User erzeugen und Rechte vergeben“ |
| Transaktionssteuerung (oft **TCL**) [Allgemeinwissen] | Transaktionen | `BEGIN`, `COMMIT`, `ROLLBACK`, `SAVEPOINT` | [bank.sql](../transaktion/bank.sql) |

DCL-Beispiel PostgreSQL [Allgemeinwissen, 🌐 Syntax: [postgresql.org – GRANT](https://www.postgresql.org/docs/current/sql-grant.html)]:
```sql
CREATE USER frontend WITH PASSWORD 'geheim';
GRANT SELECT ON kunden_uebersicht TO frontend;   -- darf nur die View lesen
```

### 3.2 JOINs (≈ 3 min)

📝 matura-themen.md: „Man muss welche schreiben können, erklären was sie machen bzw. wozu sie dienen. Die Arten von JOINs können (die Grafik für die JOINs).“

**Wozu?** Durch die Normalisierung (Themenkorb 2) sind die Daten auf mehrere Tabellen verteilt. Ein JOIN setzt sie beim Lesen wieder zusammen – über FK = PK.
📝 Aus der RA (basic.py): „der JOIN ist ein Kreuzprodukt gefolgt von einer Selektion (dem WHERE)“.

**Die Arten** (🌐 [Wikipedia – Join (SQL)](https://en.wikipedia.org/wiki/Join_(SQL))):

| JOIN | Ergebnis |
|------|----------|
| `INNER JOIN` | nur Zeilen, für die es auf **beiden** Seiten einen Treffer gibt |
| `LEFT [OUTER] JOIN` | **alle** Zeilen der linken Tabelle; fehlt rechts ein Treffer → NULL |
| `RIGHT [OUTER] JOIN` | alle Zeilen der rechten Tabelle; links NULL |
| `FULL [OUTER] JOIN` | alle Zeilen beider Seiten, fehlende Seite NULL |
| `CROSS JOIN` | kartesisches Produkt, jede mit jeder |
| Self Join | Tabelle mit sich selbst (mit Aliasen) |

🌐 SQLite kann `RIGHT` und `FULL OUTER JOIN` erst seit **Version 3.39.0 (2022)** ([Release-Log](https://sqlite.org/releaselog/3_39_0.html)). Vorher hätte man LEFT JOIN mit vertauschten Tabellen bzw. LEFT JOIN + UNION gebraucht.

**Beispiel 1 – LEFT JOIN** (📝 [Uebung.md](../../../../1-2/db/TIL-DB/geruest/uebung-fuer-test/Uebung.md), Aufgabe 2: „Liste aller Bewerber mit ihrem Bewerbungsstatus“):
```sql
SELECT * FROM applicants AS a
LEFT JOIN states AS s ON a.state_id = s.id;
```
Warum LEFT? Ein Bewerber ohne Status soll trotzdem in der Liste erscheinen (Status dann NULL). Mit INNER JOIN würde er verschwinden.

**Beispiel 2 – INNER JOIN mit Mitschrift-Daten (basic.py)**:
```sql
SELECT p.vorname, h.name AS hobby
FROM personen p
INNER JOIN hobbys h ON p.hobby_id = h.id;
```

**Beispiel 3 – Self Join** (Tabelle `abteilung` mit `parent_id` aus [constraint-trigger/skript.sql](../constraint-trigger/skript.sql)):
```sql
SELECT kind.name AS abteilung, eltern.name AS uebergeordnet
FROM abteilung kind
LEFT JOIN abteilung eltern ON kind.parent_id = eltern.id;
-- IT → R&D, HW → R&D, R&D → NULL
```

**Beispiel 4 – viele JOINs + GROUP BY** (📝 [1-2/db/b-tree/README.md](../../../../1-2/db/b-tree/README.md), DBeaver-Sample-DB): InvoiceLine → Track → Album → Artist und Genre, gruppiert nach Artist und Genre, mit `SUM(IL.UnitPrice * IL.Quantity)`. Gut als Beispiel, dass JOIN und Aggregation zusammenspielen.

> 📷 FOTO-PLATZHALTER: Die JOIN-Grafik mit zwei überlappenden Kreisen (INNER, LEFT, RIGHT, FULL) – selbst gezeichnet
> ![](bilder/03-sql-join-arten.png)

### 3.3 Gruppieren & Aggregieren: GROUP BY, HAVING, ORDER BY (≈ 2 min)

📝 teststoff-4.md: „Generell sollte man wissen, wie man group, join, select machen kann!“
⚠️ Dazu gibt es in deinen Mitschriften keine eigene Erklärung. Die Beispiele kommen aber aus deinem Code (Lagerverwaltung), die Regeln sind [Allgemeinwissen]. Ich habe alle Abfragen unten mit dem Lagerverwaltungs-Schema getestet.

**Aggregatfunktionen** rechnen aus vielen Zeilen **einen** Wert: `COUNT(*)` (Anzahl), `SUM(spalte)`, `AVG(spalte)`, `MIN(spalte)`, `MAX(spalte)`.

📝 Ohne GROUP BY, aus deiner [reporting.py](../../assigment/lagerverwaltung-kiDra94/reporting.py) (Tagesumsatz):
```sql
SELECT SUM(gesamtwert) FROM bestellung
WHERE DATE(datum) = DATE('now')
AND status LIKE 'verarbeitet';
```

**GROUP BY** fasst alle Zeilen mit dem gleichen Wert zu **einer Gruppe** zusammen, und die Aggregatfunktion rechnet dann **pro Gruppe**.

📝 Ebenfalls aus reporting.py (Konsistenzprüfung: Summe der Lagerbewegungen pro Artikel):
```sql
SELECT artikel_id, SUM(menge) FROM lagerbewegung GROUP BY artikel_id;
```

Beispiel zum Erzählen – Umsatz pro Kunde:
```sql
SELECT kunde_id, COUNT(*) AS anzahl, SUM(gesamtwert) AS umsatz
FROM bestellung
WHERE status = 'verarbeitet'
GROUP BY kunde_id;
```

**WHERE oder HAVING?**
- `WHERE` filtert **einzelne Zeilen, bevor** gruppiert wird, z. B. stornierte Bestellungen raus.
- `HAVING` filtert **ganze Gruppen, nachdem** gruppiert wurde, also nach dem Ergebnis der Aggregatfunktion.
- In `WHERE` darf keine Aggregatfunktion stehen. Nachgetestet: `WHERE SUM(menge) > 10` liefert in SQLite `misuse of aggregate: SUM()`.

Beispiel mit JOIN, HAVING und ORDER BY – welche Artikel wurden mindestens 50-mal verkauft, die meisten zuerst:
```sql
SELECT a.name, SUM(bp.menge) AS verkauft
FROM bestellposition bp
JOIN artikel a ON a.id = bp.artikel_id
GROUP BY a.name
HAVING SUM(bp.menge) >= 50
ORDER BY verkauft DESC;
```
`ORDER BY … DESC` sortiert absteigend, `ASC` (Standard) aufsteigend. Mit `LIMIT 3` bekäme man nur die Top 3.

**Reihenfolge, in der die DB das abarbeitet** [Allgemeinwissen] – gut zum Aufzeichnen:
`FROM`/`JOIN` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY` → `LIMIT`.
Daraus sieht man, warum `WHERE` noch nichts von den Gruppen weiß.

> 📷 FOTO-PLATZHALTER: Skizze: Tabelle bestellung → Zeilen nach kunde_id eingefärbt → pro Farbe eine Ergebniszeile mit SUM; daneben der Ablauf FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY
> ![](bilder/03-sql-group-by.png)

### 3.4 Subselects (≈ 2 min)

📝 matura-themen.md: „Man sollte generelle SQL-Abfragen formulieren können, wann einen Subselect benutzen will (er verliert gegen einen JOIN, wenn ich Sachen aus der 2. Tabelle anzeigen will).“
⚠️ Deine Unterlagen haben keine eigene Subselect-Übung; die Beispiele unten verwenden aber deine Schemata.

**Subselect (Unterabfrage)** = ein `SELECT` innerhalb eines anderen Statements, in Klammern.

**Wo man ihn sinnvoll braucht:**
1. **Vergleich mit einem berechneten Wert** – Artikel, die teurer sind als der Durchschnitt (Lagerverwaltung):
```sql
SELECT name, verkaufspreis
FROM artikel
WHERE verkaufspreis > (SELECT AVG(verkaufspreis) FROM artikel);
```
2. **Existenz prüfen** – Kunden, die mindestens eine Bestellung haben:
```sql
SELECT name FROM kunde
WHERE id IN (SELECT kunde_id FROM bestellung);
```
3. **In Triggern** (📝 dein eigener Code): `WHEN (SELECT COUNT(*) FROM bestellung WHERE status = 'offen' AND kunden_id = NEW.kunden_id)` und in der Bibliothek `WHERE (SELECT bestand FROM medium WHERE id = NEW.medium_id) < 1`.
4. 📝 Bei der Tabellenkopie in [bank.sql](../transaktion/bank.sql): `INSERT INTO konto1 SELECT * FROM konto;`

**Wann verliert der Subselect gegen den JOIN?** Beispiel 2 oben liefert nur Kundennamen. Will ich **auch** Datum und Gesamtwert der Bestellung **anzeigen**, brauche ich den JOIN, weil ein Subselect in `WHERE` keine Spalten nach außen liefert:
```sql
SELECT k.name, b.datum, b.gesamtwert
FROM kunde k
JOIN bestellung b ON b.kunde_id = k.id;
```

### 3.5 Views (≈ 2,5 min)

📝 matura-themen.md: „Es ist ein SELECT, der einen Namen bekommt.“

```sql
CREATE VIEW kunden_auslastung AS
SELECT name, aktueller_kredit, kreditlimit,
       aktueller_kredit * 100.0 / kreditlimit AS auslastung_prozent
FROM kunde;

SELECT * FROM kunden_auslastung WHERE auslastung_prozent > 90;
```
(Beispiel gebaut auf deiner Lagerverwaltung; die 90-%-Abfrage hattest du in [reporting.py](../../assigment/lagerverwaltung-kiDra94/reporting.py) direkt geschrieben.)

**Vorteile** (📝):
- **Komplexität verstecken**: Ein SELECT über mehrere Tabellen wird für z. B. den Frontend-Entwickler einfach. „Ich brauche nicht Frontend-Entwickler, die SELECTs schreiben können.“
- **Berechtigungen**: Nicht jeder muss alle Infos aus einer Tabelle sehen – man gibt nur Rechte auf die View (siehe DCL-Beispiel oben).
- Nur die Spalten, die interessieren.

**Nachteil** (📝): „nur R von CRUD geht“, man kann nicht einfach `INSERT ... INTO view` machen.
- 🌐 SQLite-Doku ([lang_createview.html](https://www.sqlite.org/lang_createview.html)): „Views are read-only in SQLite. However, in many cases you can use an INSTEAD OF trigger on the view“.
- 📝 „Es kann sein, dass gewisse SQL-Dialekte CRUD auf einer View unterstützen, aber meistens nur, wenn dahinter eine Tabelle versteckt ist.“

**Lösung: Trigger auf die View** – dein Beispiel aus der Bibliothek (Anforderung 3, [skript.sql](../../assigment/bibliothekssystem-kiDra94/skript.sql)): Man trägt nur Nutzername, Titel und Dauer in die View ein, der Trigger ergänzt den Rest.

```sql
CREATE VIEW ebook_ausleihen_view AS
SELECT n.name AS nutzername, m.titel AS medientitel, NULL AS dauer
FROM nutzer n
JOIN medium m ON m.typ = 'ebook';

CREATE TRIGGER insert_ebook_ausleihe
INSTEAD OF INSERT ON ebook_ausleihen_view
FOR EACH ROW
BEGIN
  INSERT INTO ausleihe (nutzer_id, medium_id, startdatum, rueckgabedatum, status)
  SELECT n.id, m.id, DATE('now'), DATE('now', '+' || NEW.dauer || ' day'), 'aktiv'
  FROM nutzer n
  JOIN medium m ON m.typ = 'ebook'
  WHERE n.name = NEW.nutzername AND m.titel = NEW.medientitel;
END;

INSERT INTO ebook_ausleihen_view (nutzername, medientitel, dauer)
VALUES ('Ben Beispiel', 'Digitale Welten', 10);
```
Ich habe dein Skript mit den Testdaten durchlaufen lassen: Der INSERT legt eine Ausleihe mit Rückgabedatum heute + 10 Tage an.

> 📷 FOTO-PLATZHALTER: Skizze: Frontend schreibt in die View → INSTEAD-OF-Trigger → echte Tabelle ausleihe
> ![](bilder/03-sql-view-instead-of.png)

### 3.6 Transaktionen & ACID (≈ 3 min)

📝 matura-themen.md: „Sie sind wichtig, wenn man mehr als ein SQL-Statement hat, welche semantisch voneinander abhängig sind, also aus Sicht des Business-Cases müssen sie gemeinsam ablaufen. Also alle diese müssen gemeinsam passieren oder keine.“
📝 Unterricht 29.09.2025, [transaktion/bank.sql](../transaktion/bank.sql); Aufgabe Lagerverwaltung (Commits 04.–06.10.2025).

**Das Standardbeispiel – Überweisung:**
```sql
BEGIN TRANSACTION;
UPDATE konto SET saldo = saldo - 300 WHERE id = 2;   -- Bob gibt 300
UPDATE konto SET saldo = saldo + 300 WHERE id = 3;   -- Charlie bekommt 300
COMMIT;      -- erst jetzt endgültig
```
Fällt nach dem ersten UPDATE der Strom aus, ohne Transaktion wären 300 € weg. Mit Transaktion passiert **beides oder nichts**. `ROLLBACK` nimmt alles seit `BEGIN` zurück.

**Was du im Unterricht gesehen hast** (📝 bank.sql):
- Zweite Verbindung will gleichzeitig schreiben → `Runtime error: database is locked (5)`.
- Wird die erste Verbindung geschlossen, ohne COMMIT → automatisch **Rollback**.
- Während einer Transaktion legt SQLite eine **Journal-Datei** an; mit `PRAGMA journal_mode=WAL;` stattdessen eine `-wal`- und eine `-shm`-Datei.
- Mit `CHECK(saldo >= kontorahmen)` schützt ein Constraint davor, dass man durch eine falsche Überweisung „Geld erschafft“ – die Transaktion schlägt fehl und wird zurückgerollt.
- 📝 [lagerverwaltung note.md](../../assigment/lagerverwaltung-kiDra94/note.md), Zitat SQLite-Doku: „Any command that accesses the database … will automatically start a transaction if one is not already in effect.“ → Jedes einzelne Statement ist schon eine eigene kleine Transaktion (Autocommit).

✅ **Korrigiert am 02.10.2026:** In bank.sql stand: „nur eine Transaktion **auf einer Tabelle** gleichzeitig“. Jetzt steht dort: „nur eine schreibende Transaktion gleichzeitig, SQLite sperrt dabei die ganze Datenbankdatei“. Denn SQLite sperrt die **ganze Datenbankdatei**, nicht einzelne Tabellen (🌐 [sqlite.org/lockingv3.html](https://www.sqlite.org/lockingv3.html)). Also besser: „nur eine schreibende Transaktion pro Datenbank gleichzeitig“. Größere Systeme wie PostgreSQL sperren feiner, auf Zeilenebene [Allgemeinwissen].

**Savepoints** (📝 matura-themen.md): „Es gibt Ausnahmen, wo nur Teile passieren können – diese kann man mit Savepoints lösen (Beispiel Lagerverwaltung: Warenkorb bleibt noch erhalten, aber Zahlung ist wegen Internetproblem nicht durchgegangen).“ Syntax 🌐 [sqlite.org/lang_savepoint.html](https://www.sqlite.org/lang_savepoint.html):
```sql
BEGIN TRANSACTION;
INSERT INTO bestellung (kunde_id) VALUES (1);          -- Warenkorb anlegen
SAVEPOINT vor_zahlung;
UPDATE kunde SET aktueller_kredit = aktueller_kredit + 200 WHERE id = 1;
-- Zahlung schlägt fehl:
ROLLBACK TO vor_zahlung;     -- nur die Zahlung zurück, Warenkorb bleibt
COMMIT;
```
📝 bank.sql: „wird in der Praxis aber selten benutzt, da wir solche Sachen oft im Code schon lösen.“

**Im Code – dein Kontextmanager** (📝 [ev.py](../../assigment/lagerverwaltung-kiDra94/ev.py)): Kein Fehler → `COMMIT`, Fehler (z. B. CHECK-Verletzung bei zu wenig Lagerbestand oder überschrittenem Kreditlimit) → `ROLLBACK`. Ausführlicher in [05-realisierung-von-db-anwendungen.md](05-realisierung-von-db-anwendungen.md).

**ACID** (📝 matura-themen.md: „wissen was es ist, wenn wir es selber irgendwo erwähnen, wird nicht explizit nachgefragt!“) – 🌐 [Wikipedia – ACID](https://de.wikipedia.org/wiki/ACID):
- **A – Atomarität**: „entweder ganz oder gar nicht“ (📝 „eine Transaktion muss atomar sein“).
- **C – Konsistenz**: Nach der Transaktion ist die DB wieder in einem gültigen Zustand, alle Integritätsbedingungen (Constraints) sind erfüllt.
- **I – Isolation**: Parallel laufende Transaktionen beeinflussen sich nicht – meist über Sperren (→ „database is locked“).
- **D – Dauerhaftigkeit**: Nach dem COMMIT sind die Daten dauerhaft gespeichert, auch nach einem Absturz (→ Journal/WAL).

> 📷 FOTO-PLATZHALTER: Zeitstrahl BEGIN → UPDATE Bob → UPDATE Charlie → COMMIT, darunter Variante mit Stromausfall → ROLLBACK
> ![](bilder/03-sql-transaktion-ueberweisung.png)

---

## 4. Zusammenhänge (zum Weiterführen des Gesprächs)

- **JOIN → Themenkorb 1 (RA)**: Kreuzprodukt + Selektion; der Optimizer macht WHERE möglichst vor dem JOIN.
- **JOIN → Themenkorb 4**: Indizes auf den JOIN-Spalten; Datenbanken nutzen intern u. a. Hash-Joins (🌐 [Wikipedia – Join](https://en.wikipedia.org/wiki/Join_(SQL))).
- **JOIN → Themenkorb 8**: MongoDB macht den JOIN mit `$lookup`, Neo4j über Muster mit Pfeilen – laut Neo4j „no need to JOIN tables“.
- **GROUP BY → Themenkorb 8**: In MongoDB ist das `$group` in der Aggregation-Pipeline, in Cypher wird automatisch nach allen Spalten ohne Aggregatfunktion gruppiert.
- **Normalisierung (Korb 2) ↔ JOINs**: Je normalisierter, desto mehr JOINs.
- **Views + DCL → Themenkorb 6 (Sicherheit)**: Rechte nur auf Views geben.
- **Transaktionen → Themenkorb 5**: `with`-Kontextmanager macht COMMIT/ROLLBACK automatisch; Fehlercodes der DB auswerten.
- **Transaktionen → Themenkorb 1 (DBMS)**: der Transaktionsmanager.
- **SQL in Programmen → Themenkorb 6 (SQL-Injection)**: SQL nie aus Benutzereingaben zusammenkleben.

## 5. Typische Fehler und Stolpersteine

- **INNER statt LEFT JOIN** → Zeilen ohne Partner verschwinden still.
- **JOIN ohne `ON`-Bedingung** → Kreuzprodukt, riesiges Ergebnis.
- **Bedingung auf die rechte Tabelle im `WHERE` bei LEFT JOIN** (z. B. `WHERE s.name = 'offen'`) macht aus dem LEFT JOIN praktisch einen INNER JOIN, weil die NULL-Zeilen rausfallen [Allgemeinwissen].
- **`= NULL` statt `IS NULL`** – Vergleich mit NULL ist nie wahr [Allgemeinwissen].
- **Views beschreiben wollen** → in SQLite nur über `INSTEAD OF`-Trigger.
- **Aggregatfunktion im `WHERE`** → Fehler; Bedingungen auf Gruppen gehören ins `HAVING`.
- **Spalte im SELECT, die weder in `GROUP BY` steht noch aggregiert ist** → in den meisten DBs ein Fehler. SQLite erlaubt es, liefert dann aber einen zufälligen Wert aus der Gruppe (nachgetestet) [Allgemeinwissen].
- **`COUNT(spalte)` vs. `COUNT(*)`**: `COUNT(spalte)` zählt NULL-Werte nicht mit [Allgemeinwissen].
- **COMMIT vergessen** (z. B. in Python) → Änderungen sind beim Schließen weg.
- **Transaktion zu lang offen** → andere Verbindungen bekommen „database is locked“.
- **RIGHT/FULL JOIN in alter SQLite-Version** (< 3.39) → Syntaxfehler.

## 6. Mögliche Nachfragen der Prüfer

**Was ist der Unterschied zwischen INNER und LEFT JOIN?**
INNER liefert nur Zeilen mit Treffer auf beiden Seiten. LEFT liefert alle Zeilen der linken Tabelle; gibt es rechts keinen Treffer, stehen dort NULLs.

**Was ist der Unterschied zwischen WHERE und HAVING?**
WHERE filtert einzelne Zeilen, bevor gruppiert wird. HAVING filtert die Gruppen danach, also nach dem Ergebnis von SUM, COUNT usw. Eine Aggregatfunktion darf deshalb nur im HAVING stehen, nicht im WHERE.

**Wie berechnest du den Umsatz pro Kunde?**
`SELECT kunde_id, SUM(gesamtwert) FROM bestellung GROUP BY kunde_id;`

**Wann nimmst du einen Subselect statt eines JOINs?**
Wenn ich nur filtern will – z. B. „teurer als der Durchschnitt“ oder „hat mindestens eine Bestellung“. Sobald ich Spalten aus der zweiten Tabelle anzeigen will, nehme ich einen JOIN.

**Kann man in eine View schreiben?**
In SQLite nicht direkt, Views sind read-only. Man kann aber einen `INSTEAD OF`-Trigger anlegen, der den INSERT abfängt und in die echten Tabellen schreibt. Manche DBMS erlauben es bei einfachen Views über eine einzige Tabelle.

**Wozu eine View, wenn ich den SELECT auch so schreiben kann?**
Wiederverwendung, Komplexität verstecken und Berechtigungen: Ich kann jemandem Rechte nur auf die View geben, dann sieht er nur bestimmte Spalten.

**Was ist eine Transaktion?**
Eine Folge von Statements, die fachlich zusammengehören und deshalb ganz oder gar nicht ausgeführt werden – Beispiel Überweisung: abbuchen und gutschreiben.

**Was passiert bei einem Stromausfall mitten in der Transaktion?**
Ohne COMMIT ist nichts endgültig gespeichert. Beim nächsten Start nimmt die DB mit Hilfe des Journals bzw. der WAL-Datei alles zurück.

**Was ist ein Savepoint?**
Ein Zwischenpunkt innerhalb einer Transaktion. Mit `ROLLBACK TO` kann man nur bis dorthin zurückgehen und den Rest behalten.

**Was bedeutet ACID?**
Atomarität (ganz oder gar nicht), Konsistenz (gültiger Zustand danach), Isolation (parallele Transaktionen stören sich nicht), Dauerhaftigkeit (nach COMMIT gespeichert, auch nach Absturz).

## 7. Quellen

**Deine Dateien:**
- [matura-themen.md](../matura-themen.md)
- [transaktion/bank.sql](../transaktion/bank.sql) (Ordner vom 29.09.2025)
- [teststoff-4.md](../teststoff-4.md) („group, join, select“)
- [3/db/assigment/lagerverwaltung-kiDra94/](../../assigment/lagerverwaltung-kiDra94/README.md): README, note.md, ev.py, reporting.py (SUM, GROUP BY) (Commits `4c56cea` „conntextmanager to ErweiterteValidierung“, `240d555` Stornierung, `935f247` „move begin transaction“)
- [3/db/assigment/bibliothekssystem-kiDra94/skript.sql](../../assigment/bibliothekssystem-kiDra94/skript.sql) (Commit `f2f29d3` „view und ebook trigger“, 09.11.2025)
- [constraint-trigger/skript.sql](../constraint-trigger/skript.sql)
- [math-grundlagen/basic.py](../math-grundlagen/basic.py)
- [1-2/db/TIL-DB/geruest/uebung-fuer-test/Uebung.md](../../../../1-2/db/TIL-DB/geruest/uebung-fuer-test/Uebung.md) (Commit `0d7924e` „left join“, 12.05.2025)
- [1-2/db/b-tree/README.md](../../../../1-2/db/b-tree/README.md) (DBeaver-Abfrage)

**Internet:**
- https://en.wikipedia.org/wiki/Join_(SQL)
- https://sqlite.org/releaselog/3_39_0.html
- https://www.sqlite.org/lang_createview.html
- https://www.sqlite.org/lockingv3.html
- https://www.sqlite.org/lang_savepoint.html
- https://de.wikipedia.org/wiki/ACID
- https://www.postgresql.org/docs/current/sql-grant.html
