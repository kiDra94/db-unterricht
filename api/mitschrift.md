Erster Schritt:
```bash
    npm i -g @nestjs/cli
    nest # cli von nest starten
    nest new classroom # eine neue nest application wird gestartet
    # npm auswaehlen
    cd clasroom
    nest start
    # im browser unter localhost:3000 ein webserver gestarte
```
```bash
    npm instal i -D prisma dotenv
    npm i @prisma/client @nestjs/mapped-types
    npx prisma init --datasource-provider sqlite
    npx prisma migrate dev --name init 
    npx prisma generate
    npm run start
```
