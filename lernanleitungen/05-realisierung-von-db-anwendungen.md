# Themenkorb 5: Realisierung von DB-Anwendungen

**Legende:**
📝 = steht so in deiner Mitschrift/deinem Code ·
🌐 = aus dem Internet ergänzt (Link bei der Stelle) ·
[Allgemeinwissen] = Standardwissen ohne eigene Quelle ·
⚠️ = Hinweis/Falle, bitte selbst prüfen ·
✅ = war ein Fehler in deinen Unterlagen, dort am 02.10.2026 ausgebessert

> **Abgrenzung zu Themenkorb 6:** Hier geht es darum, *wie ein Programm mit der Datenbank arbeitet* (Verbindung, Cursor, Ressourcen, Fehler, Decorator, Architektur). REST-Prinzipien, Absicherung (API-Key, Basic, OAuth, JWT) und SQL-Injection stehen in [06-db-schnittstellen.md](06-db-schnittstellen.md).

---

## 1. Worum geht es

> „Eine Datenbank allein ist nur ein Speicher – benutzt wird sie über Programme. In diesem Themenkorb zeige ich, wie ein Programm eine Verbindung zur Datenbank aufbaut, was ein Cursor ist, wie man sicherstellt, dass Verbindungen und Transaktionen sauber geschlossen werden, wie man Fehler der Datenbank sinnvoll behandelt und wie man eine Anwendung aufbaut – mit Decorators, einer API und der Trennung in Controller und Service.“

---

## 2. Roter Faden für 15 Minuten (auswendig lernen)

| # | Abschnitt | Zeit | Kernaussagen (Stichworte) |
|---|-----------|------|---------------------------|
| 1 | **Verbindung & Cursor** | 3 min | `connect(datei)` → Connection · `conn.cursor()` → Cursor = „blinkender Zeiger“ auf die aktuelle Zeile · `execute()` + `fetchone()`/`fetchall()` · `commit()` bei Änderungen · Platzhalter `?` / `:name` |
| 2 | **Ressourcen schließen** | 2,5 min | Verbindung nie offen lassen (Sperren, Speicher) · `with` = Kontextmanager, `__enter__`/`__exit__` · eigener Kontextmanager: kein Fehler → COMMIT, Fehler → ROLLBACK · Achtung: `with sqlite3.connect()` schließt **nicht** |
| 3 | **Fehlerbehandlung** | 3 min | `try/except` mit `sqlite3.IntegrityError`, `OperationalError` · Fehlercodes der DB: 19 = Constraint, 5 = database is locked · sinnvolle Meldung für den Nutzer, **keine** internen Details (SQL, Tabellennamen, Stacktrace) |
| 4 | **Decorator** | 3 min | Funktion, die eine Funktion bekommt und eine neue zurückgibt · `@` ist Kurzschreibweise · Einsatz: Logging, Zeitmessung, Rechte, Routen registrieren (`@app.get("/tils")`) · NestJS: `@Controller`, `@Get`, `@Injectable` |
| 5 | **Architektur: API & Design Patterns** | 3,5 min | Client ↔ API ↔ DB · Controller (HTTP) und Service (DB-Logik) getrennt → Service wiederverwendbar · DTO + Validierung · MVC · NestJS: Module, Controller, Service, Dependency Injection |

---

## 3. Erklärung Schritt für Schritt

### 3.1 Verbindung und Cursor (≈ 3 min)

📝 matura-themen.md: „Wie baut man eine Verbindung mit einer DB auf, was macht ein Cursor.“
📝 Dein „MINIMUM ZUM WISSEN“ aus [1-2/db/TIL-DB/geruest/main.py](../../../../1-2/db/TIL-DB/geruest/main.py) (Mai 2025):
> „eine connect Funktion bekommt eine gültige DB-Datei · Cursor wird in der Connection erzeugt · Cursor führt Abfrage aus · bekommt einen Generator (ist iterierbar) zurück“

- **Connection** = die offene Verbindung zur Datenbank (bei SQLite: zur Datei).
- **Cursor** = 📝 „Cursor kann man sich als einen Blinkenden [vorstellen], der den Beginn von der z. B. Zeile in der Tabelle markiert.“ Er führt das SQL aus und merkt sich, wo man im Ergebnis gerade ist.
- `fetchone()` = nächste Zeile, `fetchall()` = alle restlichen Zeilen.
- Bei INSERT/UPDATE/DELETE: `commit()`, sonst sind die Änderungen nicht gespeichert.

**Beispiel zum Erzählen** – angelehnt an [Uebung.md](../../../../1-2/db/TIL-DB/geruest/uebung-fuer-test/Uebung.md), Aufgabe 3 („Liste aller abgelehnten Bewerber“):

```python
import sqlite3

conn = sqlite3.connect("applicants.db")
cursor = conn.cursor()

stmt = """SELECT a.first, s.name
          FROM applicants AS a
          LEFT JOIN states AS s ON a.state_id = s.id
          WHERE s.name = :status"""

cursor.execute(stmt, {"status": "Abgelehnt"})
for row in cursor.fetchall():
    print(row)

conn.close()
```

**Daten schreiben** – aus deiner Lagerverwaltung ([eb.py](../../assigment/lagerverwaltung-kiDra94/eb.py)), mit `RETURNING`, um die neue id zu bekommen:

```python
cursor.execute("INSERT INTO bestellung (kunde_id) VALUES (?) RETURNING id", (kunden_id,))
bestellung_id = cursor.fetchone()[0]
```

✅ **Korrigiert am 02.10.2026:** In Uebung.md und main.py stand der Platzhalter als `{:statement}` bzw. `{:subject}`. Jetzt steht dort `:statement` / `:subject`. Richtig ist `:name` (benannter Platzhalter) oder `?` (🌐 [Python-Doku sqlite3](https://docs.python.org/3/library/sqlite3.html): „question marks (qmark style) or named placeholders (named style)“). Auch der Schlüssel `'statment'` heißt jetzt `'statement'`, passend zum SQL.

### 3.2 Ressourcen nicht vergessen zu schließen (≈ 2,5 min)

📝 matura-themen.md: „Wie mach ich es, damit ich eine Ressource nicht vergesse zu schließen (with open in Python).“

**Warum schließen?** Eine offene Verbindung hält Speicher und eventuell **Sperren**. 📝 In [bank.sql](../transaktion/bank.sql) hast du gesehen: Solange die erste Verbindung eine Transaktion offen hat, bekommt die zweite `database is locked (5)`.

**Kontextmanager mit `with`:** Python ruft beim Eintreten `__enter__` und beim Verlassen – **auch bei einem Fehler** – `__exit__` auf. Genauso wie `with open("datei.txt") as f:` die Datei automatisch schließt.

**Dein eigener Kontextmanager** (📝 [ev.py](../../assigment/lagerverwaltung-kiDra94/ev.py), Commit `4c56cea`, 04.10.2025):

```python
class ErweiterteValidierung(EinfacheBestellung):

    def __enter__(self):
        print("Entering context!")
        return self

    def __exit__(self, exc_type, exc_value, exc_tb):
        if exc_type is None:
            print("Commiting")
            self.cursor.execute("COMMIT")
            return True
        else:
            print(f"Rollback due to: {exc_type.__name__}: {exc_value}")
            self.cursor.execute("ROLLBACK")
            return False
```

Benutzung (Idee):
```python
with ErweiterteValidierung(1, bestellpositionen, cursor) as bestellung:
    bestellung.transaktion_abwickeln()
# kein Fehler → COMMIT; CHECK verletzt (z. B. Lagerbestand < 0) → ROLLBACK
```

So verbindet man **Transaktion** (Themenkorb 3) und **Ressourcenverwaltung**: Man kann das ROLLBACK nicht mehr vergessen.

⚠️ **Wichtige Falle** (✅ in [main.py](../../../../1-2/db/TIL-DB/geruest/main.py) am 02.10.2026 ausgebessert, dort stand vorher „close passiert, wenn die WITH fertig ist“): Für `sqlite3` stimmt das **nicht**. 🌐 Python-Doku: Die Connection als Kontextmanager macht COMMIT bzw. ROLLBACK, aber „neither implicitly opens a new transaction **nor closes the connection**“. Zum Schließen: `conn.close()` oder `contextlib.closing(...)`.

```python
import sqlite3
from contextlib import closing

with closing(sqlite3.connect("bank.db")) as conn:  # schließt am Ende
    with conn:                                     # COMMIT oder ROLLBACK
        conn.execute("UPDATE konto SET saldo = saldo - ? WHERE id = ?", (100, 1))
        conn.execute("UPDATE konto SET saldo = saldo + ? WHERE id = ?", (100, 2))
```

✅ **Korrigiert am 02.10.2026:** In [server.py](../../../../1-2/db/TIL-DB/server.py) und bulmeapi/server.py stand `def __exit__(self):` ohne die drei Parameter. Python ruft `__exit__` aber immer mit `(exc_type, exc_value, traceback)` auf, sonst gibt es einen `TypeError`. Jetzt sind die Parameter drin, so wie in ev.py.

### 3.3 Fehlerbehandlung (≈ 3 min)

📝 matura-themen.md: „Fehlerhandling ist wichtig, was muss ich abfangen, die Nummern abfangen, die die DB liefert, und sinnvolle Nachrichten an den Nutzer liefern. **Aufpassen, welche Infos ich an den Nutzer liefere.**“

**Welche Fehler liefert die DB?** In deinen Mitschriften stehen die Nummern schon in Klammern:
- `Runtime error: Kunde hat bereits eine offene Bestellung (19)` – Trigger mit `RAISE(ABORT, …)`
- `Runtime error: cannot store TEXT value in INTEGER column personen.age (19)` – STRICT
- `Runtime error: database is locked (5)` – zweite Transaktion

🌐 Bedeutung laut [sqlite.org/rescode.html](https://www.sqlite.org/rescode.html): **19 = SQLITE_CONSTRAINT**, **5 = SQLITE_BUSY**. Es gibt genauere „extended codes“, z. B. 275 = CHECK, 787 = FOREIGN KEY, 2067 = UNIQUE.

**In Python** (🌐 [Python-Doku](https://docs.python.org/3/library/sqlite3.html)): Alle Fehler erben von `sqlite3.Error`. Wichtig: `IntegrityError` (Constraint verletzt), `OperationalError` (z. B. gesperrt, Tabelle fehlt). Seit Python 3.11 haben die Fehler `sqlite_errorcode` und `sqlite_errorname`. Nachgetestet: Ein verletzter CHECK liefert `IntegrityError`, Code 275, `SQLITE_CONSTRAINT_CHECK`.

```python
import sqlite3

def bestellung_anlegen(conn, kunde_id, artikel_id, menge):
    try:
        with conn:   # COMMIT oder ROLLBACK
            conn.execute("UPDATE artikel SET lagerbestand = lagerbestand - ? WHERE id = ?",
                         (menge, artikel_id))
            conn.execute("UPDATE kunde SET aktueller_kredit = aktueller_kredit + ? WHERE id = ?",
                         (menge * 25, kunde_id))
        return "Bestellung gespeichert."
    except sqlite3.IntegrityError as fehler:
        print("LOG:", fehler.sqlite_errorname, fehler)        # Details nur ins Log
        return "Bestellung nicht möglich: zu wenig Lagerbestand oder Kreditlimit erreicht."
    except sqlite3.OperationalError as fehler:
        print("LOG:", fehler.sqlite_errorname, fehler)
        return "Die Datenbank ist gerade beschäftigt, bitte später erneut versuchen."
```
(Beispiel gebaut auf den CHECKs deiner Lagerverwaltung: `CHECK (lagerbestand >= 0)`, `CHECK (aktueller_kredit <= kreditlimit)`.)

**Was der Nutzer sehen darf und was nicht** [Allgemeinwissen]:
- ✅ verständliche Meldung, was er tun kann.
- ❌ SQL-Text, Tabellen-/Spaltennamen, Stacktrace, Datenbankversion – das hilft Angreifern (→ SQL-Injection, Themenkorb 6).
- 📝 NestJS-Beispiel aus [member.service.ts](../api/classrome/src/member/member.service.ts): `throw new NotFoundException(\`Member with ID ${id} not found\`)` → der Client bekommt sauber **404** statt eines Absturzes.

### 3.4 Decorator (≈ 3 min)

📝 matura-themen.md: „Decorator“ ist das erste Stichwort des Korbs. Unterricht 1. Jahrgang: Assignment [decorators-kiDra94](../../../../1-2/db/decorators-kiDra94/Assignments.pdf) (Simon Gunacker, April 2025) und TIL-DB.

**Grundlage: Funktionen sind Werte** (📝 [functional.py](../../../../1-2/db/TIL-DB/geruest/myLibTest/functional.py)): Man kann eine Funktion einer Variablen zuweisen, als Parameter übergeben und aus einer Funktion zurückgeben.

**Decorator** = Funktion, die eine Funktion bekommt und eine **neue Funktion** zurückgibt, die etwas davor/danach macht. `@log` über einer Funktion ist nur eine Kurzschreibweise für `funktion = log(funktion)`.

📝 Dein Beispiel aus functional.py:

```python
def log(function):
    def inner():
        print("Vorher")
        function()
        print("Nachher")
    return inner

@log
def hallo():
    print("Hallo")

hallo()
# Vorher
# Hallo
# Nachher
```

**Wofür in DB-Anwendungen?**
- Logging, Zeitmessung (📝 Assignment 5.1.2 „Messung der Laufzeit einer Funktion“).
- Zugriffsrechte prüfen (📝 Assignment 5.3.1 „Decorator für Zugriffsrechte“).
- Caching (📝 Assignment 5.2.2 „Caching mit functools.lru_cache nachbauen“).
- **Routen registrieren**: 📝 In deinem eigenen Mini-Framework `bulmeapi` ([app.py](../../../../1-2/db/TIL-DB/geruest/bulmeapi/app.py), [main.py](../../../../1-2/db/TIL-DB/geruest/main.py)) wird mit `@app.get("/tils")` die Funktion in ein Dictionary „Pfad → Funktion“ eingetragen. Der Server schaut bei einer Anfrage in dieses Dictionary.

Vereinfacht und korrigiert (so funktioniert die Idee):

```python
class App:
    def __init__(self):
        self.get_routen = {}

    def get(self, pfad):
        def registrieren(funktion):
            self.get_routen[pfad] = funktion
            return funktion
        return registrieren

app = App()

@app.get("/tils")
def alle_tils():
    return "SELECT * FROM tils"

print(app.get_routen)   # {'/tils': <function alle_tils>}
```

✅ **Korrigiert am 02.10.2026:** In deiner app.py fehlte in `get()` und `post()` das `return` vor `self.route(...)`. Ohne `return` ist der Decorator `None` und die Funktion danach weg. Außerdem hießen Attribut `self.post` und Methode `post` gleich, das Attribut heißt jetzt `self.posts`. Gut zu wissen für die Prüfung: Ein Decorator muss immer eine Funktion zurückgeben.

**Decorators in NestJS** (TypeScript, gleiche Idee) – 📝 [member.controller.ts](../api/classrome/src/member/member.controller.ts): `@Controller('member')`, `@Get()`, `@Post()`, `@Body()`, `@Param('id')`; bei der Sicherheit `@UseGuards(...)` (Themenkorb 6).

### 3.5 Architektur: API und Design Patterns (≈ 3,5 min)

📝 matura-themen.md: „API (REST API, NestJS). Designpattern (MVC, Controller-Service usw.)“
📝 Unterricht ab 12.01.2026: [api/mitschrift.md](../api/mitschrift.md), Projekt `api/classrome`.

**Warum eine API zwischen Client und DB?** [Allgemeinwissen] Der Browser/die App soll **nicht direkt** mit der DB reden (Zugangsdaten, Sicherheit, Validierung). Die API ist die einzige Stelle, die SQL ausführt.

```text
Client (Browser, App)  ──HTTP/JSON──▶  API (Controller → Service)  ──SQL/ORM──▶  Datenbank
```

**Controller–Service-Trennung** (📝 api/mitschrift.md):
> „Service und Controller werden getrennt. Grund: Service kümmert sich um die Datenbankabfragen, Controller packt es in eine HTTP-Request ein. Vorteil ist, dass wir den gleichen Service wiederverwenden können, auch wenn wir nicht über HTTP benutzen.“

📝 Dein Code:
```typescript
@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.memberService.findOne(+id);
  }
}

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) { }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({ where: { id: id } });
    if(!member) { throw new NotFoundException(`Member with ID ${id} not found`); }
    return member;
  }
}
```

**Dasselbe mit FastAPI + SQLAlchemy** [Allgemeinwissen, 🌐 [fastapi.tiangolo.com – SQL Databases](https://fastapi.tiangolo.com/tutorial/sql-databases/)] – nur ein GET. `Member` ist das SQLAlchemy-Modell, `get_db` liefert eine Session:

```python
# Service – nur die Datenbank (SQLAlchemy)
def find_member(db: Session, id: int):
    return db.get(Member, id)          # SELECT * FROM member WHERE id = ?


# Controller – nur HTTP
@app.get("/member/{id}")
def get_member(id: int, db: Session = Depends(get_db)):
    member = find_member(db, id)       # ruft den Service auf
    if member is None:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"id": member.id, "name": member.name, "email": member.email}
```

**Aufbau einer NestJS-Anwendung** (📝 api/mitschrift.md):
- `main.ts`: `bootstrap()` erzeugt die App und startet den Server.
- `app.module.ts`: **Modul** bündelt Controller und Provider (Services).
- `nest g res member` erzeugt Controller, Service, Module und DTOs auf einmal.
- **DTO** (Data Transfer Object): „ist das, was über die API geschickt wird. Man kann das … geschickte JSON vorher validieren.“ 📝 [create-member.dto.ts](../api/classrome/src/member/dto/create-member.dto.ts): `@IsNotEmpty`, `@IsString`, `@MinLength(2)`, `@IsEmail`.

**Dependency Injection** (🌐 [docs.nestjs.com/providers](https://docs.nestjs.com/providers)): `@Injectable()` markiert eine Klasse, „that can be managed by the Nest IoC container“. Nest sieht im Konstruktor `private memberService: MemberService` und **übergibt automatisch** eine Instanz – man schreibt kein `new`.
✅ **Korrigiert am 02.10.2026:** In [oauth/mitschritft.md](../oauth/mitschritft.md) stand „Injectable ist ein Interface für eine Klasse“. Jetzt steht dort richtig: `@Injectable()` ist ein **Decorator**, kein Interface.

**MVC** (🌐 [Wikipedia – Model View Controller](https://de.wikipedia.org/wiki/Model_View_Controller)):
- **Model**: „enthält Daten, die von der Ansicht dargestellt werden. Es ist von Ansicht und Steuerung unabhängig.“ → bei uns: Prisma-Modelle/Entities.
- **View**: „Darstellung der Daten“ → bei einer REST-API das JSON bzw. das Frontend.
- **Controller**: wird über Benutzerinteraktionen informiert, wertet sie aus, passt an → NestJS-Controller.
- Vorteil: Teile können getrennt geändert werden.


---

## 4. Zusammenhänge (zum Weiterführen des Gesprächs)

- **Kontextmanager ↔ Transaktionen (Themenkorb 3)**: `__exit__` macht COMMIT/ROLLBACK.
- **Fehlercodes ↔ Constraints/Trigger (Themenkorb 2)**: Code 19 kommt von CHECK, UNIQUE, FK, `RAISE(ABORT)`.
- **Platzhalter ↔ SQL-Injection (Themenkorb 6)**.
- **Decorator ↔ Sicherheit (Themenkorb 6)**: `@UseGuards(ApiKeyGuard)`, `@UseGuards(AuthGuard('jwt'))`.
- **Service ↔ ORM (Themenkorb 7)**: Im Service steht `this.prisma.member.findMany()` statt SQL.
- **Decorator ↔ Caching (Themenkorb 4)**: `lru_cache` als Decorator.
- **Strategy Pattern (Themenkorb 6)**: weiteres Design Pattern aus [apisec/mitschrift.md](../apisec/mitschrift.md).

## 5. Typische Fehler und Stolpersteine

- **`commit()` vergessen** → Änderungen weg.
- **`with sqlite3.connect()` schließt nicht** → `close()` oder `closing()`.
- **SQL mit f-Strings zusammenbauen** → SQL-Injection; immer Platzhalter.
- **Platzhalter falsch**: `?` oder `:name`, nicht `{:name}`.
- **Zu allgemein abfangen** (`except Exception: pass`) → Fehler verschwinden still.
- **Fehlermeldung mit internen Details an den Nutzer**.
- **Decorator ohne `return`** → Funktion ist danach `None`.
- **`__exit__` ohne die drei Parameter**.
- **DB-Logik im Controller** statt im Service → nicht wiederverwendbar.

## 6. Mögliche Nachfragen der Prüfer

**Was ist ein Cursor?**
Ein Objekt, das von der Verbindung erzeugt wird, SQL ausführt und sich merkt, an welcher Stelle im Ergebnis man ist. Mit `fetchone()` hole ich die nächste Zeile, mit `fetchall()` alle.

**Warum soll man `with` verwenden?**
Weil `__exit__` auch bei einem Fehler aufgerufen wird. So kann man das Schließen bzw. das ROLLBACK nicht vergessen.

**Welche Fehler fängst du ab?**
`IntegrityError` für verletzte Constraints (Code 19, z. B. CHECK oder UNIQUE) und `OperationalError`, z. B. wenn die DB gesperrt ist (Code 5). Dem Nutzer zeige ich eine verständliche Meldung, die Details schreibe ich ins Log.

**Was ist ein Decorator?**
Eine Funktion, die eine andere Funktion bekommt und eine erweiterte Funktion zurückgibt. Das `@` ist nur die Kurzschreibweise für `f = decorator(f)`. Typisch: Logging, Rechte prüfen, Routen registrieren.

**Warum trennt man Controller und Service?**
Der Controller kümmert sich nur um HTTP – Pfad, Parameter, Statuscode. Der Service enthält die Logik und die DB-Zugriffe. Dadurch kann ich den Service auch ohne HTTP wiederverwenden und einzeln testen.

**Was ist ein DTO?**
Ein Data Transfer Object beschreibt, welche Daten über die API kommen. Mit Validierungs-Decorators wie `@IsEmail` prüft man sie, bevor sie in die DB gehen.

**Was ist Dependency Injection?**
Die Klasse erzeugt ihre Abhängigkeiten nicht selbst mit `new`, sondern bekommt sie über den Konstruktor vom Framework. In NestJS markiert man dafür den Service mit `@Injectable()`.

## 7. Quellen

**Deine Dateien:**
- [matura-themen.md](../matura-themen.md)
- [1-2/db/TIL-DB/](../../../../1-2/db/TIL-DB/doku.md): geruest/main.py, geruest/bulmeapi/app.py, server.py, geruest/myLibTest/functional.py, api.py, db.py, geruest/uebung-fuer-test/Uebung.md (Commits 28.04.–12.05.2025, z. B. `334fa6a` „still pseudo code, but secure against sql injections“, `7ba29bf` „secure against sql-injections“, `53936aa`)
- [1-2/db/decorators-kiDra94/](../../../../1-2/db/decorators-kiDra94/ue4.py) Assignments.pdf, ue4.py (Commits 31.03.–01.04.2025)
- [3/db/assigment/lagerverwaltung-kiDra94/](../../assigment/lagerverwaltung-kiDra94/README.md) eb.py, ev.py (Commit `4c56cea`)
- [api/mitschrift.md](../api/mitschrift.md), [api/classrome/src/member/](../api/classrome/src/member/member.service.ts) (Commit `189acb0` „#init api“, 12.01.2026)
- [oauth/mitschritft.md](../oauth/mitschritft.md)
- [transaktion/bank.sql](../transaktion/bank.sql), [constraint-trigger/mitschrifft.md](../constraint-trigger/mitschrifft.md) (Fehlercodes)

**Internet:**
- https://docs.python.org/3/library/sqlite3.html
- https://www.sqlite.org/rescode.html
- https://docs.nestjs.com/providers
- https://fastapi.tiangolo.com/tutorial/sql-databases/
- https://de.wikipedia.org/wiki/Model_View_Controller
