# NoSQL

## MongoDB

Ist eine hirarchische Datenbank.

Instalation https://www.mongodb.com/docs/v8.0/tutorial/install-mongodb-on-debian/ , oder https://www.mongodb.com/products/tools/compass .

Zum starten folgenden Befehl in der Shell eingeben. 
```shell
sudo systemctl start mongod
sudo systemctl status mongod
mongosh
```

Die SH ist eine JS-Console!

Befehle wenn es läugt:
```shell
help
show dbs
show collections # show tables ist der gleiche befehl
use [collections name]
db.first.insertOne({hello: 'world'}) # fuegt einen Eintrag ein, immer als JSON-Format, und erzeugt automatisch die collections wenn es keine gibt
show collections
db.first.find() # ist der select *
db.first.insertMany( [ {hello: 'austria'}, {vorname: 'hansi',nachname: 'meier'} ] ) # fuegt meherer sachen ein
db.first.find({vorname: 'hansi'})
db.first.find({ $and: [ { vorname: 'hansi' }, { nachname: 'meier'} ] }) # funktinonen werden mit $[funktionsname] eingefuegt
```

### Aufgabe 

- Neue Datenbank anlegen (Name: **schueler**)
- Folgende Objekte in eine collection *'schueler'* einfügen:
    - name: 'anna', klasse: '3a', noten: [1, 2, 2]
    - name: 'ben', klasse: '3a', noten: [2, 3, 2]
    - name: 'clara', klasse: '3a', noten: [1, 1, 1]


**Lösung**:
```bash
db.schueler.insertMany([ {name: 'anna', klasse: '3a', noten: [1, 2, 2]}, {name: 'ben', klasse: '3a', noten: [2, 3, 2]}, {name: 'clara', klasse: '3a', noten: [1, 1, 1]} ])
