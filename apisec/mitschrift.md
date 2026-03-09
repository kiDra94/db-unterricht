### Passport
npm i @nestjs/passport passport passport-http

Stratagey Pattern sind mehrere Anssaetze die man zum Problemloesen benutzen kann. Diese kann man zur Laufzeit dann aendern. Man kann also zur Laufzeit entscheiden welchen Ansatz wir benutzen [ z.B. ApiKey oder BasicAuth].

Eine Abstrakte Klasse ist eine Klasse die keine Objekte erschaffen kann (also keine Instanzen davon). Sie hat Default implementiereung, welche nicht ueberschrieben werden muessen.
Ein Interface ist eine Liste von Methoden die es gebne muss.
Eine Abstrakte Klasse hat eine construcotr (im gegensatz vom Intreface was keins hat).

extends ist die Erbeung. BasicStrategy erebt von PassportStrategy.

HTTPBasicStrategy hat schon fertige Methoden die den header ueberpruefen und username und passwort spliten, so das wir es benutzen koennen!

Proof: 
❯ curl http://localhost:3000{"message":"Unauthorized","statusCode":401}
unterricht/apisec on  passport [!] via  v22.15.0 
❯ curl -u user:secret http://localhost:3000
Hello World!

Req wird benutzt damit wir req daten abspeichern koennen in z.B. Coockies.
unterricht/apisec on  passport via  v22.15.0 
❯ curl -u user:secret http://localhost:3000
{"message":"Hello World!","user":{"username":"user"}}
