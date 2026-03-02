### OAuth

Auslagern von der Security an einen Drittanbieter. Bsp beim Anmeldn über Google, kümmert sich Google darum das der User der sich einlogen will, der Echte ist.

Aufgabe: 
- POC vom Protokoll

https://de.wikipedia.org/wiki/OAuth#/media/Datei:Authorization-Code-Grant-Flow.png

Owner ist der Mensch, UserAgent ist der Browser (Chrom), Client(WebServer von der APP), Auth Server(ist der vom Google, also der outgesourcte), Resource Server (da wo die Sachen liegen)

### Oatuh google
Schriite:
- google cloud console web client anlegen
- .json von dem client herunterladen und die benoetigten daten in die .env
- npm i @nestjs/config, app module config module importieren 