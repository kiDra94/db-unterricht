# Themenkorb 6: DB-Schnittstellen

**Legende:**
📝 = steht so in deiner Mitschrift/deinem Code ·
🌐 = aus dem Internet ergänzt (Link bei der Stelle) ·
[Allgemeinwissen] = Standardwissen ohne eigene Quelle ·
⚠️ = Hinweis/Falle, bitte selbst prüfen ·
✅ = war ein Fehler in deinen Unterlagen, dort am 02.10.2026 ausgebessert

> **Abgrenzung zu Themenkorb 5:** Wie ein Programm intern mit der DB arbeitet (Cursor, `with`, Fehler, Decorator, Controller/Service), steht in [05-realisierung-von-db-anwendungen.md](05-realisierung-von-db-anwendungen.md). Hier geht es um die **Schnittstelle nach außen** und ihre **Sicherheit**.

---

## 1. Worum geht es

> „Datenbanken werden heute fast nie direkt angesprochen, sondern über eine Schnittstelle, meistens eine REST-API. Ich erkläre, wie eine REST-API aufgebaut ist und wie man sie absichert: mit API-Key, Basic Auth und OAuth mit Token. Zum Schluss zeige ich mit SQL-Injection den wichtigsten Angriff auf die Datenbank hinter der API und wie man ihn verhindert.“

---

## 2. Roter Faden für 15 Minuten (auswendig lernen)

| # | Abschnitt | Zeit | Kernaussagen (Stichworte) |
|---|-----------|------|---------------------------|
| 1 | **REST-API** | 2,5 min | Ressourcen über URL (`/member/:id`) · HTTP-Methoden = CRUD: POST (C), GET (R), PATCH/PUT (U), DELETE (D) · JSON · zustandslos · Statuscodes 200, 401, 404 |
| 2 | **Absichern: API-Key & Basic Auth** | 3 min | Authentifizierung (wer bist du) vs. Autorisierung (was darfst du) · API-Key im Header, Guard prüft · Basic: `user:passwort` Base64 im `Authorization`-Header → **nur mit HTTPS** · NestJS: Guards + Passport-Strategien (Strategy Pattern) |
| 3 | **OAuth 2.0** | 4 min | Login an Drittanbieter auslagern (Google) · Rollen: Resource Owner, User Agent, Client, Authorization Server, Resource Server · Authorization Code Grant: Weiterleitung → Login bei Google → Code → Code gegen Access Token tauschen → Ressource mit Token |
| 4 | **Token: JWT, Cookie & CORS** | 2,5 min | JWT = header.payload.signature, Base64url, signiert, **nicht verschlüsselt** · im Header `Authorization: Bearer …` oder als `httpOnly`-Cookie · Server prüft nur die Signatur → zustandslos · CORS: Browser lässt fremde Origins nur zu, wenn der Server es per Header erlaubt; mit Cookies kein `*` |
| 5 | **SQL-Injection** | 3 min | Benutzereingabe wird Teil des SQL-Befehls · `' OR '1'='1` → alle Zeilen · Gegenmittel: Platzhalter / Prepared Statements, Eingaben prüfen, minimale DB-Rechte, keine Fehlerdetails |

---

## 3. Erklärung Schritt für Schritt

### 3.1 REST-API (≈ 2,5 min)

📝 matura-themen.md: „Was ist REST API, wie kann man Sicherheit in diesem Bereich gewährleisten.“

**API** (Application Programming Interface) = definierte Schnittstelle, über die ein Programm ein anderes benutzt. **REST** (Representational State Transfer) ist ein Architekturstil für Web-APIs über HTTP. 🌐 Prinzipien laut [Wikipedia – REST](https://de.wikipedia.org/wiki/Representational_State_Transfer):
- **Client-Server**: Server bietet einen Dienst an, Client fragt an.
- **Zustandslos**: „Jede REST-Nachricht enthält alle Informationen, die für den Server bzw. Client notwendig sind.“ → deshalb muss bei jeder Anfrage der API-Key oder Token mitgeschickt werden.
- **Ressourcen mit URI**: Jede Information hat eine Adresse.
- **Einheitliche Schnittstelle**, Caching, mehrschichtiges System.

**HTTP-Methoden = CRUD** (📝 [api/mitschrift.md](../api/mitschrift.md): „Bei der REST API immer POST, PATCH, GET, DELETE. Die Endpoints sind immer gleich /[name]/[id].“):

| CRUD | HTTP | Pfad (dein `member`-Controller) | Prisma im Service |
|------|------|-------------------------------|-------------------|
| Create | `POST` | `/member` | `create` |
| Read | `GET` | `/member`, `/member/:id` | `findMany`, `findUnique` |
| Update | `PATCH` (Teil) / `PUT` (ganz) | `/member/:id` | `update` |
| Delete | `DELETE` | `/member/:id` | `delete` |

🌐 GET, PUT, DELETE sind **idempotent** (mehrfach ausführen = gleiches Ergebnis), POST nicht (zweimal = zwei Datensätze).

📝 Im 1. Jahrgang hattest du das schon für die TIL-DB entworfen ([doku.md](../../../../1-2/db/TIL-DB/doku.md)) und mit einem selbst gebauten Python-HTTP-Server mit Sockets umgesetzt (`HTTP/1.1 200 OK`, `Content-Type`, Leerzeile, dann Body) – [server.py](../../../../1-2/db/TIL-DB/server.py).

**Statuscodes** [Allgemeinwissen]: 200 OK, 201 Created, 400 Bad Request (z. B. DTO-Validierung schlägt fehl), **401 Unauthorized** (📝 dein curl ohne Passwort: `{"message":"Unauthorized","statusCode":401}`), 404 Not Found (📝 `NotFoundException` im Service), 500 Server-Fehler.

```bash
curl http://localhost:3000/member/1                 # GET → JSON des Members 1
curl -X POST http://localhost:3000/member \
     -H "Content-Type: application/json" \
     -d '{"name": "Alice", "email": "alice@wonder.land"}'
```

### 3.2 Absichern: API-Key und Basic Auth (≈ 3 min)

📝 teststoff-3.md: „Security von der Theorie wissen: welche Methoden es gibt, welche wo angewendet wird.“ Grob wissen: „Injectables, Strategies, Decorator“. Unterricht Februar/März 2026, Projekte [api-key](../api-key/src/api-key.guard.ts) und [apisec](../apisec/mitschrift.md).

**Zwei Begriffe** [Allgemeinwissen]:
- **Authentifizierung** = Wer bist du? (Login)
- **Autorisierung** = Was darfst du? (Rechte)

**a) API-Key** – ein geheimer Schlüssel, den der Client bei jeder Anfrage im Header mitschickt. 📝 Dein Guard:

```typescript
export class ApiKeyGuard implements CanActivate {
   private readonly API_KEY = "1234";

   canActivate(context: ExecutionContext): boolean {
     const request = context.switchToHttp().getRequest();
     const apiKey = request.headers['api-key'];
     if (apiKey != this.API_KEY){
      throw new UnauthorizedException("Nope, you're not allowed");
     }
     return true;
   }
}
```
Am Endpoint: `@UseGuards(ApiKeyGuard)`. Ein **Guard** entscheidet, ob die Anfrage zum Controller durchdarf.
Wo einsetzen? [Allgemeinwissen] Für Programm-zu-Programm-Zugriffe (Server ruft API auf), nicht für einzelne Benutzer – der Key identifiziert eine Anwendung, keinen Menschen. Im echten Projekt gehört der Key in die `.env`, nicht in den Code.

**b) Basic Auth** – Benutzername und Passwort im `Authorization`-Header. 📝 Dein Test:
```text
❯ curl http://localhost:3000
{"message":"Unauthorized","statusCode":401}
❯ curl -u user:secret http://localhost:3000
{"message":"Hello World!","user":{"username":"user"}}
```
🌐 [MDN – HTTP Authentication](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication): Der Header sieht aus wie `Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=`. Das ist nur **Base64-kodiert, nicht verschlüsselt** – „HTTPS/TLS should be used with basic authentication“.

**Passport & Strategy Pattern** (📝 [apisec/mitschrift.md](../apisec/mitschrift.md)):
> „Strategy Pattern sind mehrere Ansätze, die man zum Problemlösen benutzen kann. Diese kann man zur Laufzeit dann ändern. Man kann also zur Laufzeit entscheiden, welchen Ansatz wir benutzen [z. B. ApiKey oder BasicAuth].“

📝 [basic.strategy.ts](../apisec/src/basic.strategy.ts): `BasicStrategy extends PassportStrategy(HTTPBasicStrategy)` mit einer Methode `validate(username, password)`. Am Controller wählt man die Strategie per Name: `@UseGuards(AuthGuard('basic'))`, später `AuthGuard('google')` oder `AuthGuard('jwt')`. Gleiche Schnittstelle, austauschbare Strategie.

Als Python-Pseudocode (Idee des Strategy Patterns):
```python
class BasicStrategie:
    def validate(self, anfrage):
        return anfrage["user"] == "user" and anfrage["passwort"] == "secret"

class ApiKeyStrategie:
    def validate(self, anfrage):
        return anfrage["api-key"] == "1234"

def guard(strategie, anfrage):
    if not strategie.validate(anfrage):
        return 401
    return 200

print(guard(ApiKeyStrategie(), {"api-key": "1234"}))   # 200
```

### 3.3 OAuth 2.0 inklusive Sequenzdiagramm (≈ 4 min)

📝 matura-themen.md: „OAuth inklusive Sequenzdiagramm, welche Komponenten mitspielen.“
📝 [oauth/mitschritft.md](../oauth/mitschritft.md) (02.–09.03.2026): „Auslagern von der Security an einen Drittanbieter. Bsp. beim Anmelden über Google kümmert sich Google darum, dass der User, der sich einloggen will, der Echte ist.“

**Die Rollen** (📝 Mitschrift, ergänzt 🌐 [Wikipedia – OAuth](https://de.wikipedia.org/wiki/OAuth)):
- **Resource Owner** – „der Mensch“, dem die Daten gehören.
- **User Agent** – „der Browser (Chrome)“.
- **Client** – „WebServer von der App“, die auf die Daten zugreifen will.
- **Authorization Server** – „der von Google, also der ausgelagerte“; prüft den Login und stellt Tokens aus.
- **Resource Server** – „da wo die Sachen liegen“; prüft den Token.

**Das Sequenzdiagramm aus deinem Ordner** (Wikipedia-Grafik, liegt in [oauth/Authorization-Code-Grant-Flow.png](../oauth/Authorization-Code-Grant-Flow.png)):

![OAuth 2.0 Authorization Code Grant – Sequenzdiagramm](bilder/06-oauth.png)

**Ablauf in eigenen Worten** (Beispiel der Grafik: Druckdienst D will Fotos vom Fotodienst F drucken):
1.–2. Der Mensch will über den Browser eine Ressource vom Client (Druckdienst).
3. Der Client hat keinen Token → **HTTP 302**-Weiterleitung zum Authorization Server.
4.–6. Der Browser holt die Login-/Zustimmungsseite des Authorization Servers und zeigt sie an.
7.–8. Der Mensch loggt sich ein und bestätigt, dass der Druckdienst zugreifen darf. **Das Passwort sieht nur der Authorization Server, nie der Client.**
9.–10. Der Authorization Server schickt per 302 einen kurzlebigen **Authorization Code** über den Browser an den Client.
11.–12. Der Client tauscht den Code **direkt** (Server zu Server) gegen einen **Access Token** und optional einen **Refresh Token**.
13.–14. Der Client holt mit dem Access Token die Ressource vom Resource Server.
15.–17. Der Client liefert das Ergebnis an den Browser, der es anzeigt.

🌐 Wikipedia: **Access Token** ist kurzlebig und geht bei jeder Anfrage mit, **Refresh Token** ist langlebig und holt ohne neuen Login einen neuen Access Token.

📝 **In deinem Code** ([withGoogle/google/src](../oauth/withGoogle/google/src/app.controller.ts)):
- `GoogleStrategy` mit `clientID`, Client-Secret und `callbackURL` aus der `.env`, `scope: ['openid', 'email', 'profile']`.
- `GET auth/google` mit `@UseGuards(AuthGuard('google'))` → leitet zu Google weiter (Schritt 3).
- `GET auth/google/callback` → Google schickt den Code hierher, Passport tauscht ihn und liefert in `validate()` das Profil (Schritte 10–12).
- Danach erzeugt dein Server einen **eigenen JWT** und setzt ihn als Cookie → siehe 3.4.
- 📝 Dein [oatuh.py](../oauth/oatuh.py) ist dasselbe Diagramm als Klassen (eine Klasse pro Lebenslinie) – noch mit `#TODO: funktionen implementieren`.

**OAuth vs. Login** (🌐 Wikipedia): OAuth regelt eigentlich die **Autorisierung** (Zugriff erlauben). Für das reine **Anmelden** (Authentifizierung) gibt es darauf aufbauend **OpenID Connect** – deshalb steht in deinem Scope `openid`.

### 3.4 Token: JWT, Cookie und CORS (≈ 2,5 min)

📝 Commits 06.–09.03.2026: „geruest fuer jwt strategy“, „implemented jwt logic in the callback endpoint“, „imported&implemnted cookieparser“, „implemented cors credentials“.

**Ganz einfach erklärt** (ohne Fachbegriffe) [Allgemeinwissen]:

| Begriff | Was ist das? | Vergleich aus dem Alltag |
|---|---|---|
| **JWT** | Ein **Ausweis**, den der Server nach dem Login ausstellt. Darauf steht, wer du bist und wie lange er gilt. Der Server setzt eine Unterschrift darauf, die nur er machen kann. | **Festival-Armband**: Am Eingang zeigst du einmal dein Ticket (Login). Danach schauen die Ordner nur noch auf das Armband. Jeder kann lesen, was darauf steht, aber fälschen kann man es nicht. |
| **Cookie** | Ein kleiner **Zettel**, den der Server dem Browser gibt. Der Browser hebt ihn auf und schickt ihn bei **jeder** Anfrage an diesen Server **automatisch** mit. | **Garderobenmarke**: Du bekommst sie einmal und hast sie dann immer dabei. Du musst nicht jedes Mal daran denken. |
| **CORS** | Eine **Gästeliste**, die der Server dem Browser mitgibt: „Nur diese Webseiten dürfen meine Antworten lesen.“ Der **Browser** hält sich daran und blockiert alle anderen. | **Türsteher mit Gästeliste**: Wer nicht draufsteht, kommt nicht rein. Der Türsteher steht aber nur vor dem Browser. Wer ohne Browser kommt (z. B. mit `curl`), wird gar nicht kontrolliert. |

**Wie die drei zusammenspielen** – ganz simples Beispiel. Das Frontend läuft auf `http://localhost:5173`, die API auf `http://localhost:3000`:

```text
1. LOGIN
   Browser → API:   GET /auth/google/callback            (Login über Google ist fertig)
   API → Browser:   Set-Cookie: accesToken=eyJhbGci...; HttpOnly
                    → der JWT liegt jetzt als Cookie im Browser

2. SPÄTERE ANFRAGE
   Browser → API:   GET /hello
                    Cookie: accesToken=eyJhbGci...        ← schickt der Browser von selbst mit
   API:             prüft die Unterschrift im JWT → gültig
   API → Browser:   200  "Hallo anna@schule.at"
                    (ohne Cookie oder mit gefälschtem JWT → 401 Unauthorized)

3. CORS (weil 5173 und 3000 verschiedene Origins sind)
   API → Browser:   Access-Control-Allow-Origin: http://localhost:5173
                    Access-Control-Allow-Credentials: true
   Browser:         „5173 steht auf der Liste“ → das Frontend darf die Antwort lesen
   Eine fremde Seite (z. B. http://boese.at) ruft /hello auf
                    → steht nicht auf der Liste → der Browser blockiert die Antwort
```

Kurz gesagt: **JWT** = wer bin ich, **Cookie** = wo der Browser den JWT aufhebt und automatisch mitschickt, **CORS** = welche Webseiten im Browser überhaupt mit der API reden dürfen.

⚠️ In deinem [main.ts](../oauth/withGoogle/google/src/main.ts) läuft die API auf Port 3000, und `origin` ist auch `http://localhost:3000`. Das ist **derselbe** Origin, CORS wird dabei also gar nicht gebraucht. Interessant wird es erst, wenn das Frontend woanders läuft, z. B. mit Vite auf 5173. Dann muss genau dieser Origin in `origin` stehen.

**JWT** (JSON Web Token) – 🌐 [Wikipedia – JSON Web Token](https://en.wikipedia.org/wiki/JSON_Web_Token):
- Drei Teile, mit Punkt getrennt: `header.payload.signature`, jeweils **Base64url**-kodiert.
- Header = Algorithmus (z. B. HS256), Payload = Daten (Claims, z. B. E-Mail, Ablaufzeit), Signature = mit dem **Secret** signiert.
- Payload ist **nicht verschlüsselt**, jeder kann sie lesen – die Signatur beweist nur, dass niemand sie verändert hat. → Keine Passwörter in den JWT.
- **Zustandslos**: Der Server muss sich keine Sessions merken, er prüft nur die Signatur.

**JWT als Pseudocode** [Allgemeinwissen, Aufbau nach 🌐 [RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519)]. Teil 1 passiert bei dir im Callback, also **nach Schritt 12** im OAuth-Diagramm oben. Teil 2 passiert bei jeder späteren Anfrage, z. B. auf `/hello`:

```text
// 1. JWT ERSTELLEN (Server, nach dem Login)
header    = { "alg": "HS256", "typ": "JWT" }
payload   = { "id": 42, "email": "anna@schule.at", "exp": jetzt + 1 Stunde }

teil1     = base64url(header)
teil2     = base64url(payload)
signatur  = HMAC_SHA256(teil1 + "." + teil2, SECRET)   // SECRET kennt nur der Server
jwt       = teil1 + "." + teil2 + "." + base64url(signatur)

setze Cookie "accesToken" = jwt   (httpOnly)


// 2. JWT PRÜFEN (Server, bei jeder Anfrage)
jwt = aus Header "Authorization: Bearer <jwt>"  ODER  aus Cookie "accesToken"
wenn kein jwt                                   → 401 Unauthorized

[teil1, teil2, signatur] = jwt.split(".")
wenn HMAC_SHA256(teil1 + "." + teil2, SECRET) != signatur
                                                → 401   // Token wurde verändert
payload = json(base64url_decode(teil2))
wenn payload.exp < jetzt                        → 401   // Token abgelaufen

sonst: Anfrage erlauben, angemeldeter User = payload.email
```

So sieht so ein Token wirklich aus. Ich habe ihn mit dem Payload von oben und `SECRET = "geheim"` erzeugt, die drei Teile sind durch Punkte getrennt:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NDIsImVtYWlsIjoiYW5uYUBzY2h1bGUuYXQiLCJleHAiOjE3OTAwMDAwMDB9.Msk2xvNSR-JqDkztcqrh0qJVmzl-ywdpvqDX_cvKhys
```

Den mittleren Teil kann jeder zurück in `{"id":42,"email":"anna@schule.at","exp":1790000000}` umwandeln, z. B. auf jwt.io. Darum gehören keine Passwörter in den Payload. Ändert jemand die E-Mail im Payload, passt die Signatur nicht mehr, und der Server antwortet mit 401.

📝 Dein Ablauf: Callback → `this.jwtService.sign({ id, user, name })` → `res.cookie('accesToken', jwt, { httpOnly: true, sameSite: 'lax', maxAge: 3600000 })` → `JwtStrategy` liest den Token aus `Authorization: Bearer …` **oder** aus dem Cookie → `@UseGuards(AuthGuard('jwt'))` schützt `/hello`.
- `httpOnly` [Allgemeinwissen]: JavaScript im Browser kann das Cookie nicht lesen → schützt vor Diebstahl durch eingeschleustes Script.
- 📝 Kommentar in deinem Code: `secure: false // In production, set this to true` → Cookie nur über HTTPS.

**CORS – warum `app.enableCors(...)` in deinem main.ts steht** (📝 Commit `a08dc65` „implemented cors credentials“):
```typescript
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent with requests
})
```
- 🌐 [MDN – CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS): Browser halten sich an die **Same-Origin-Policy**. JavaScript auf einer Seite darf mit `fetch()` nur Antworten vom **gleichen Origin** lesen. Ein Origin ist **Schema + Domain + Port**, also ist `http://localhost:5173` ein anderer Origin als `http://localhost:3000`.
- **CORS** (Cross-Origin Resource Sharing) heißt: Der Server sagt mit HTTP-Headern, welche fremden Origins trotzdem dürfen. Der wichtigste Header ist `Access-Control-Allow-Origin`.
- `credentials: true` → Header `Access-Control-Allow-Credentials: true`, damit der Browser das **Cookie mit dem JWT** mitschickt. 🌐 MDN: Dann darf der Server **nicht** `*` als Origin angeben, sondern muss den Origin genau nennen – deshalb steht in deinem Code `origin: 'http://localhost:3000'`.
- Wichtig [Allgemeinwissen]: CORS wird nur **vom Browser** durchgesetzt. `curl` oder ein anderer Server kümmern sich nicht darum. CORS ersetzt also **keine** Authentifizierung, es schützt nur Benutzer im Browser davor, dass fremde Seiten in ihrem Namen Daten auslesen.

✅ **Korrigiert am 02.10.2026:** Zwei Fehler im OAuth-Code:
1. In [google.strategy.ts](../oauth/withGoogle/google/src/google.strategy.ts) stand `clientSecet`, jetzt steht dort `clientSecret`.
2. Im Callback wurde der Token mit `user: req.user.email` signiert, die [jwt.strategy.ts](../oauth/withGoogle/google/src/jwt.strategy.ts) prüft aber `payload.email`. Jetzt wird mit `email: req.user.email` signiert, beide Seiten passen zusammen.
(Der kompilierte Ordner `dist/` ist noch der alte Stand, er wird beim nächsten `npm run build` neu erzeugt.)

### 3.5 SQL-Injection (≈ 3 min)

📝 matura-themen.md: „SQL Injection (einen Code sollte man wissen, man kann einen frei erfinden, bzw. wissen, wie man eine basic SQL Injection schreibt).“

**Was ist das?** 🌐 [Wikipedia – SQL-Injection](https://de.wikipedia.org/wiki/SQL-Injection): Der Fehler entsteht, weil „das Anwendungsprogramm die Eingabedaten nicht als reine Daten an die Datenbank weiterreicht, sondern aus diesen Daten die Datenbankabfrage erzeugt.“ Zeichen wie `'` oder `;` werden dann als SQL verstanden.

**Basic-Beispiel (selbst erfunden, wie erlaubt):**

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE nutzer (name TEXT, passwort TEXT)")
conn.execute("INSERT INTO nutzer VALUES ('admin', 'geheim')")

# UNSICHER: Eingabe wird in den SQL-Text geklebt
eingabe_name = "admin' --"
eingabe_pw = "egal"
sql = "SELECT * FROM nutzer WHERE name = '" + eingabe_name + "' AND passwort = '" + eingabe_pw + "'"
print(sql)
# SELECT * FROM nutzer WHERE name = 'admin' --' AND passwort = 'egal'
print(conn.execute(sql).fetchall())     # [('admin', 'geheim')]  → Login ohne Passwort!
```
- `'` beendet den String, `--` macht den Rest zum **Kommentar** → die Passwortprüfung verschwindet.
- Klassiker: Eingabe `' OR '1'='1` → `WHERE name = '' OR '1'='1'` ist immer wahr → **alle** Zeilen.
- `'; DROP TABLE nutzer; --` → Tabelle löschen. [Allgemeinwissen, nachgetestet:] Python-`execute()` führt nur **ein** Statement aus und wirft bei mehreren einen Fehler – andere Treiber/`executescript()` nicht. Darauf darf man sich also nicht verlassen.

**Sicher – mit Platzhalter (Prepared Statement):**
```python
sql = "SELECT * FROM nutzer WHERE name = ? AND passwort = ?"
print(conn.execute(sql, (eingabe_name, eingabe_pw)).fetchall())   # []  → kein Login
```
Die Eingabe wird nur noch als **Wert** behandelt, nie als SQL-Code.

📝 Genau das hast du in TIL-DB umgesetzt (Commits `334fa6a` „still pseudo code, but secure against sql injections“, `7ba29bf` „secure against sql-injections“): Kommentar in [main.py](../../../../1-2/db/TIL-DB/geruest/main.py) „absicherung gegen SQL-Injections mit Platzhalter (Prepared-stmt)“. Auch dein [eb.py](../../assigment/lagerverwaltung-kiDra94/eb.py) nutzt durchgehend `?`.

**Weitere Gegenmaßnahmen** (🌐 Wikipedia):
- **Eingaben prüfen** (z. B. nur Ziffern für eine PLZ) → in NestJS über DTO-Validierung (`@IsEmail`).
- **Minimale Datenbankrechte** für den Benutzer der Anwendung (→ DCL, Themenkorb 3).
- **Keine Fehlerdetails** an den Benutzer (→ Themenkorb 5).
- ORMs wie Prisma verwenden intern Platzhalter [Allgemeinwissen] → Themenkorb 7.

> 📷 FOTO-PLATZHALTER: Skizze: Eingabefeld „admin' --“ → zusammengesetzter SQL-String mit markiertem Kommentarteil, daneben die sichere Variante mit ?
> ![](bilder/06-schnittstellen-sql-injection.png)

---

## 4. Zusammenhänge (zum Weiterführen des Gesprächs)

- **Sequenzdiagramm → Themenkorb 1 (UML)**: Die OAuth-Grafik ist ein Sequenzdiagramm.
- **Decorators → Themenkorb 5**: `@UseGuards`, `@Controller`, `@Get` sind Decorators.
- **Controller/Service → Themenkorb 5**: Sicherheit sitzt vor dem Controller (Guard), DB-Zugriff im Service.
- **Platzhalter/Fehlermeldungen → Themenkorb 5**.
- **DCL/Views → Themenkorb 3**: DB-Rechte als zweite Verteidigungslinie.
- **ORM → Themenkorb 7**: Der Service nutzt Prisma, das schützt vor einfacher SQL-Injection.
- **JSON → Themenkorb 8**: REST-APIs sprechen JSON, MongoDB speichert JSON-artige Dokumente.

## 5. Typische Fehler und Stolpersteine

- **Base64 für Verschlüsselung halten** – ist nur Kodierung.
- **Basic Auth oder Cookies ohne HTTPS**.
- **Secrets im Code** (`API_KEY = "1234"`) statt in der `.env` – und `.env` nicht ins Git (📝 dein `.gitignore` in oauth).
- **JWT-Payload für geheim halten** – sie ist lesbar.
- **CORS mit `origin: '*'` und `credentials: true`** – das erlaubt der Browser nicht.
- **CORS für eine Sicherheitsmaßnahme gegen Angreifer halten** – `curl` ignoriert CORS, die API braucht trotzdem Authentifizierung.
- **OAuth = Login?** Eigentlich Autorisierung; Login darüber ist OpenID Connect.
- **Authorization Code ≠ Access Token**: Der Code ist nur zum Eintauschen da.
- **SQL mit `+` oder f-String bauen** → Injection.
- **POST für Änderungen, GET für Löschen** → REST-Regeln brechen; GET darf nichts verändern.

## 6. Mögliche Nachfragen der Prüfer

**Was ist der Unterschied zwischen PUT und PATCH?**
PUT ersetzt die ganze Ressource, PATCH ändert nur einzelne Felder. NestJS erzeugt bei `nest g res` standardmäßig PATCH.

**Warum ist REST zustandslos und was bedeutet das für die Sicherheit?**
Jede Anfrage muss alles enthalten, was der Server braucht. Deshalb schickt der Client bei jeder Anfrage den API-Key oder Token mit.

**Was ist der Unterschied zwischen API-Key und OAuth?**
Ein API-Key identifiziert eine Anwendung mit einem festen Geheimnis. Bei OAuth gibt ein Benutzer einer Anwendung zeitlich begrenzten Zugriff über einen Token, ohne ihr sein Passwort zu verraten.

**Warum tauscht man bei OAuth zuerst einen Code und nicht gleich den Token?**
Der Code geht über den Browser und ist damit leichter abzufangen. Der Token wird erst im direkten Server-zu-Server-Aufruf geholt, bei dem sich der Client mit seinem Client-Secret ausweist.

**Was steht in einem JWT?**
Header mit Algorithmus, Payload mit Daten wie E-Mail und Ablaufzeit, und die Signatur. Die Payload ist nur Base64url-kodiert, die Signatur verhindert Änderungen.

**Was ist CORS und warum brauchst du es?**
Der Browser lässt JavaScript nur Antworten vom gleichen Origin (Schema, Domain, Port) lesen. Läuft mein Frontend auf einem anderen Port als die API, muss die API mit CORS-Headern erlauben, dass dieser Origin zugreifen darf. Mit `credentials: true` werden auch Cookies mitgeschickt, dann muss der Origin genau angegeben sein, `*` geht nicht.

**Wie verhinderst du SQL-Injection?**
Mit Platzhaltern bzw. Prepared Statements, damit Eingaben nie als SQL interpretiert werden. Zusätzlich Eingaben validieren, der Anwendung nur minimale DB-Rechte geben und keine Fehlerdetails ausgeben.

**Schreib eine SQL-Injection.**
Login-Feld `admin' --` → aus `WHERE name = '…' AND passwort = '…'` wird `WHERE name = 'admin' --' AND …`, die Passwortprüfung ist auskommentiert.

## 7. Quellen

**Deine Dateien:**
- [matura-themen.md](../matura-themen.md), [teststoff-3.md](../teststoff-3.md) (Commit `51ecb93`, 09.03.2026)
- [api/mitschrift.md](../api/mitschrift.md), [api/classrome/src/member/](../api/classrome/src/member/member.controller.ts)
- [api-key/src/api-key.guard.ts](../api-key/src/api-key.guard.ts), [api-key/src/app.controller.ts](../api-key/src/app.controller.ts)
- [apisec/mitschrift.md](../apisec/mitschrift.md), [apisec/src/basic.strategy.ts](../apisec/src/basic.strategy.ts)
- [oauth/mitschritft.md](../oauth/mitschritft.md), [oauth/oatuh.py](../oauth/oatuh.py), [oauth/Authorization-Code-Grant-Flow.png](../oauth/Authorization-Code-Grant-Flow.png), [oauth/withGoogle/google/src/](../oauth/withGoogle/google/src/app.controller.ts) (Commits `61ea3b8` 02.03. bis `a08dc65` 09.03.2026)
- [1-2/db/TIL-DB/](../../../../1-2/db/TIL-DB/doku.md) doku.md, server.py, geruest/main.py
- [3/db/assigment/lagerverwaltung-kiDra94/eb.py](../../assigment/lagerverwaltung-kiDra94/eb.py)

**Internet:**
- https://de.wikipedia.org/wiki/Representational_State_Transfer
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Authentication
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS
- https://de.wikipedia.org/wiki/OAuth
- https://en.wikipedia.org/wiki/JSON_Web_Token
- https://de.wikipedia.org/wiki/SQL-Injection
- Bild: Wikipedia-Grafik „Authorization-Code-Grant-Flow.png“ (laut deiner Mitschrift von https://de.wikipedia.org/wiki/OAuth#/media/Datei:Authorization-Code-Grant-Flow.png), lokal in `oauth/`
