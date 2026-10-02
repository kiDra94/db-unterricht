# Lernanleitungen – Mündliche Matura Datenbanken

Grundlage: [matura-themen.md](../matura-themen.md) (Stand Commit `43c5b48`, 03.07.2026).
Jede Anleitung ist für **ca. 15 Minuten freies Sprechen** aufgebaut: Einstieg → **roter Faden** (auswendig lernen) → Erklärung mit Beispielen → Zusammenhänge → Stolpersteine → Prüferfragen → Quellen.

## Übersicht

| # | Themenkorb | Datei | Unterthemen |
|---|-----------|-------|-------------|
| 1 | Theoretische Grundlagen | [01-theoretische-grundlagen.md](01-theoretische-grundlagen.md) | Doku lesen (UML Klassen-/Sequenzdiagramm, ERD, Syntaxdiagramm, Docstrings), relationale Algebra & Mengenlehre, DBMS-Aufbau, O-Notation & Datenstrukturen |
| 2 | Datenmodellierung | [02-datenmodellierung.md](02-datenmodellierung.md) | ERD & Kardinalitäten, Keys & `ON DELETE CASCADE`, Normalformen bis 3NF, Constraints & Trigger, Vererbung (STI/JTI/Concrete) |
| 3 | Abfragesprachen – SQL | [03-abfragesprachen-sql.md](03-abfragesprachen-sql.md) | DDL/DML/DQL/DCL, JOINs, GROUP BY/HAVING/ORDER BY, Subselects, Views (+ INSTEAD-OF-Trigger), Transaktionen, Savepoints, ACID |
| 4 | Methoden der Datenverwaltung | [04-methoden-der-datenverwaltung.md](04-methoden-der-datenverwaltung.md) | **Indizes** (Hauptthema, deine Index-Übung), B-/B+-Baum, Hash-Map, Caching |
| 5 | Realisierung von DB-Anwendungen | [05-realisierung-von-db-anwendungen.md](05-realisierung-von-db-anwendungen.md) | Verbindung & Cursor, `with`/Kontextmanager, Fehlerbehandlung mit DB-Fehlercodes, Decorator, Controller–Service/MVC/NestJS |
| 6 | DB-Schnittstellen | [06-db-schnittstellen.md](06-db-schnittstellen.md) | REST-API, API-Key, Basic Auth, Strategy Pattern, OAuth 2.0 (mit deinem Sequenzdiagramm), JWT/Cookie, CORS, SQL-Injection |
| 7 | ORM | [07-orm.md](07-orm.md) | Grundprinzip, Prisma-Schema & Tools, Code-first vs. Database-first, Prisma-Abfragen, Vor-/Nachteile |
| 8 | NoSQL-Datenbanken | [08-nosql-datenbanken.md](08-nosql-datenbanken.md) | „relational“, NoSQL-Arten, wann NoSQL, JSON/XML/XPath/YAML, MongoDB (find, aggregate, `$group`, `$lookup`), Neo4j/Cypher |

Der Abschnitt „Allgemeine Infos für alles“ aus matura-themen.md (Full Table Scan, Binärsuche) ist in Korb 1 und 4 eingearbeitet.

## Legende (in allen Dateien gleich)

- 📝 = steht so in deiner Mitschrift/deinem Code (mit Link zur Datei)
- 🌐 = aus dem Internet ergänzt (Link direkt bei der Stelle und unter „Quellen“)
- [Allgemeinwissen] = Standard-Fachwissen ohne eigene Quelle, sparsam verwendet
- ⚠️ = Hinweis/Falle, bitte selbst prüfen
- ✅ = war ein Fehler in deinen Unterlagen, ist inzwischen dort ausgebessert (siehe Tabelle unten)
- 📷 FOTO-PLATZHALTER = hier ein eigenes Foto/eine Skizze einfügen; Dateien kommen in den Ordner [bilder/](bilder/) unter dem angegebenen Namen

## Themen, bei denen deine Unterlagen dünn waren (Internet ergänzt)

| Korb | Thema | Was gefehlt hat | Ergänzt aus |
|------|-------|-----------------|-------------|
| 1 | UML, ERD, Syntaxdiagramm | nur Stichworte in matura-themen.md | Wikipedia Klassendiagramm / ER-Modell, sqlite.org Syntaxdiagramme |
| 1 | DBMS-Aufbau | **Präsentation von Anh nicht vorhanden** | sqlite.org/arch.html, Wikipedia DBMS |
| 1 | O-Notation | nur der Text in matura-themen.md | Wikipedia Landau-Symbole |
| 2 | Normalformen | **keine eigene Mitschrift** (laut Lehrer: Wikipedia lesen) | Wikipedia Normalisierung |
| 2 | Keys / `ON DELETE`-Aktionen | nur Stichworte | sqlite.org/foreignkeys.html |
| 2 | Vererbungs-Begriffe | nur matura-themen.md | Martin Fowler (STI / Class Table / Concrete Table) |
| 3 | JOIN-Arten, Subselects, GROUP BY/HAVING | keine eigene Übung zu Subselects und GROUP BY, JOIN-Grafik fehlt | Wikipedia Join (SQL), SQLite-Release-Log; GROUP BY mit Beispielen aus deiner reporting.py |
| 3 | ACID | nur „wissen, was es ist“ | Wikipedia ACID |
| 4 | B+-Baum | dein Referat behandelt den **B-Baum**; **Referat von Anh fehlt** | Wikipedia B+-Baum |
| 4 | Hash-Map in DBs | nur basic.py-Beispiel | Wikipedia Hashtabelle, PostgreSQL-Doku |
| 6 | REST-Prinzipien, JWT-Aufbau, Basic-Auth-Sicherheit, CORS | nur Code, kaum Theorie | Wikipedia REST/OAuth/JWT/SQL-Injection, MDN (Authentication, CORS) |
| 7 | Vor-/Nachteile ORM, andere ORMs | keine Liste in den Unterlagen | Prisma-Doku + [Allgemeinwissen] |
| 8 | XML, XPath, XSLT, YAML | nur Stichworte | Wikipedia XPath / YAML |
| 8 | NoSQL-Arten außer MongoDB/Neo4j | nicht behandelt | Wikipedia NoSQL |
| 8 | Neo4j | **Repo von Simon/Guni nicht verlinkt/vorhanden** | neo4j.com Cypher vs. SQL |

## Gefundene Widersprüche / Fehler – am 02.10.2026 in deinen Dateien ausgebessert

Alle Änderungen sind **nicht committet**. Mit `git diff` im jeweiligen Repo kannst du sie ansehen, mit `git checkout -- <datei>` rückgängig machen.

| Wo | Was war falsch | Jetzt | Datei |
|----|----------------|-------|-------|
| nosql/mitschrift.md | „MongoDB ist eine hierarchische DB“ | „dokumentbasiert“ | 08 |
| neo4js/mitschrift.md | Überschrift „GraphQL“, „Ecken“, JOIN `k1.from_id = k2.to_id` | „Neo4j … Cypher“, „Kanten“, `k1.to_id = k2.from_id` | 08 |
| constraint-trigger/mitschrifft.md | „Rekursion“ beim Budget-Trigger | Satz ergänzt: rekursive Trigger sind in SQLite standardmäßig aus | 02 |
| transaktion/bank.sql | „eine Transaktion auf einer **Tabelle**“ | „eine schreibende Transaktion, SQLite sperrt die ganze Datei“ | 03 |
| math.grundlagen.datenbank.md | „**echte** Teilmenge“ | „Teilmenge“ | 01 |
| matura-themen.md | beide Binärsuchen: kein Abbruch, falsche Position | korrigiert und getestet | 01 |
| matura-themen.md | B+-Baum, aber dein Code ist ein B-Baum | Hinweis auf den Unterschied ergänzt | 04 |
| oauth/mitschritft.md | „Injectable ist ein Interface“ | „@Injectable() ist ein Decorator“ | 05 |
| assigment-indizes | Zeit „mit Index“ hat nur `EXPLAIN QUERY PLAN` gemessen, `LIKE` nutzt keinen Index | Messung mit `=` und echter Ausführung; neue Zahlen in report.md (ca. 50 ms → 0,5 ms bzw. 0,03 ms) | 04 |
| SQLite-Skripte | `PRAGMA foreign_keys = ON` fehlte | eingefügt in constraint-trigger/skript.sql, Bibliothek skript.sql, Lagerverwaltung aufgabe.sql + main.py (getestet) | 02 |
| TIL-DB main.py, Uebung.md | „close passiert, wenn WITH fertig ist“; Platzhalter `{:name}`; `'statment'` | Kommentar korrigiert; `:name`; `'statement'` | 05 |
| TIL-DB server.py, bulmeapi | `__exit__` ohne Parameter; Decorator ohne `return`; `self.post` doppelt | Parameter ergänzt; `return` ergänzt; `self.posts` | 05 |
| oauth google.strategy.ts, app.controller.ts | `clientSecet`; Token mit `user:` statt `email:` | `clientSecret`; `email:` | 06 |
| orm-prisma seed.js | `createMany` mit verschachteltem `create`; `client` statt `prisma` | `create` pro Kurs (weiter auskommentiert); überall `prisma` | 07 |
| Prisma-Versionen | Unterricht 6.19/7.x, aktuelle Doku zeigt Prisma 8 | kein Fehler, nichts geändert – nur Hinweis in 07 | 07 |

## Verwendete Quellen auf deinem Rechner

**db-Ordner:** `htl/1-2/db` und `htl/3/db` (ein `4/db` gibt es nicht).

**Git-Repositories (Commit-Logs gelesen, interessante Diffs angeschaut):**
- `3/db/unterricht` – 161 Commits, 13.10.2025 – 03.07.2026 (Unterrichtsverlauf: Trigger 10/2025, Prisma 11/2025, NestJS 01/2026, OAuth 03/2026, RA 03/2026, MongoDB 04–05/2026, Neo4j 05–06/2026, matura-themen 06–07/2026)
- `3/db/assigment/assigment-indizes`, `…/lagerverwaltung-kiDra94`, `…/bibliothekssystem-kiDra94`
- `3/db/2-test-kiDra94` (Prisma-Test), `3/db/special-queries-kiDra94` (Neo4j), `3/db/mongodb` (Klassenrepo)
- `1-2/db/b-tree` (dein Referat), `1-2/db/TIL-DB`, `1-2/db/decorators-kiDra94`

Nicht inhaltlich verwendet: `3/db/Archive.zip` (Backup des assigment-Ordners), virtuelle Umgebungen, `node_modules`, generierte Prisma-Dateien, die Google-`client_secret…json` (nicht geöffnet).
