server in watcht mode starten und dann probieren!

apisec on  main via  v22.15.0 
❯ curl http://localhost:3000/
{"message":"Missing Basic authorization header","error":"Unauthorized","statusCode":401}
apisec on  main via  v22.15.0 
❯ git status
On branch main
nothing to commit, working tree clean

apisec on  main via  v22.15.0 
❯ curl -u user:password http://localhost:3000/
Hello World!
apisec on  main via  v22.15.0 
❯ 

Antwort vom server wenn wir curl -u user:password http:/localhost:3000/
Nest application successfully started +2ms
Received Basic auth header: dXNlcjpwYXNzd29yZA==

nach dem decodieren
Nest application successfully started +8ms
Received Basic auth header: dXNlcjpwYXNzd29yZA==
Decoded credentials: user:password

username und password gesplitet
Nest application successfully started +8ms
Received Basic auth header: dXNlcjpwYXNzd29yZA==
Decoded credentials: user:password

Nach dem ueberpruefen ob das username und password gleich sind
apisec on  main [!] via  v22.15.0 
❯ curl -u drazen:pass123 http://localhost:3000/
{"message":"Invalid credentials","error":"Unauthorized","statusCode":401}

### Aufgabe den bisherigen code als guard machen

der Guard nur auf die getHello:
❯ curl http://localhost:3000/
{"message":"Missing Basic authorization header","error":"Unauthorized","statusCode":401}
unterricht on  main [!?] 
❯ 
❯ curl http://localhost:3000/code
Code
unterricht on  main [!?] 
❯ 

