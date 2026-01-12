Erster Schritt:
```bash
npm i -g @nestjs/cli
nest # cli von nest starten um zu schauen welche optionen wir haben
nest new classroom # eine neue nest application wird gestartet
# npm auswaehlen
cd clasroom
nest start
# im browser unter localhost:3000 ein webserver gestarte
```
```bash
npm instal i -D prisma dotenv
npm i @prisma/client @nestjs/mapped-types
npx prisma init --datasource- sqlite
npx prisma migrate dev --name init 
npx prisma generate
npm run start
```

In der src/main.ts passiern 2 importes. Eine Factory (nicht so interesant).
Die AppModule, in der bootstrap function wird eine `const app` erzeugt, die eine verbindung zum server macht.
In der src/app.module.ts. es wird ene classe AppModule exportiere, die einen AppControler und AppService provider bekomme.
In der src/app.controller.ts wird eine get request ueber decoratore geschickt
In der src/app.service.ts sehen wir was der service Macht der in der app.controller.ts aufgerufen wird

```bash
nest g res member #REST API auswahlen und Y
```

Service und Controller werden getrent. Grund:
    - service kuemert sich um die datenbank abfragen
    - controller pack es in eine HTTP request ein
Vorteil ist, das wir den gleichen Service wiederverwenden koennen, auch wenn wir nicht ueber HTTP benutzen.
```bash
nest g mo prisma # modul wird erzeugt
nest g s prisma # service wird erzeugt
npm i @prisma/adapter-better-sqlite3 # wird gebruacht wuer den service
```
Der Prisma client wird benutzt um den findall anzupassen.
Einer der Vorteile waere das ErrorHandling. und das benutzen von prisma in dem service.

```bash
npm i @nestjs/swagger
```

### WICHTIG

Bei der REST API immer POST, PATCH, GET, DELETE. Die Endpoints sind immer gleich /[name]/[id].
dto --> steht fuer Data Transfer Object, ist das was ueber die API geschickt wird. Man kann das von der AXIOS geschickte JSON vorher validieren.

# Aufgabe bis nachste Woche

model Member wie im Bsp

model Course: id, name, members[] --> implementieren als PrismaSchema
dto anshcuen!