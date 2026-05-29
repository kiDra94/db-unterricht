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
```

### Test DBs instaliert von [MongoDB Samples](https://github.com/neelabalan/mongodb-sample-dataset)

Instalationsanleitung:
    ZIP herunterladen, extrahieren und das script file ausführen.


### Befehle aus dem Untericht

```bash
use sample_airbnb
const x = db.listingsAndReviews # man kann Konstanten/Variablen anlegen
x.find()
x.find({property_type: 'House'})
x.find({property_type: 'House', "address.suburb": "Jamaica"})
```

**Aufgabe**:

    Die Anzahl aller Apartments
    Die Namen aller Aartments
    Name, Preis und Land aller Apartments, die weniger als 15$/Nacht kosten
    Die Namen aller Apartments, die in Austarlien sind, ein Aufzug haben und weniger als 50$/Nacht kosten

**Lösung**:
```bash
x.find({property_type: 'Apartment'}).count() # 3626
db.listingsAndReviews.find({ property_type: 'Apartment'}, {name: 1, _id: 0}) # mit it geht es weiter da es eine pageination gibt
db.listingsAndReviews.find({ property_type: 'Apartment', price: {$lt: 15}}, {name: 1, _id: 0, price: 1, "address.country": 1}) # ersets Objket sind die Filterbedingungen und das 2 die Zeilen die angezeigt werden
db.listingsAndReviews.find({ property_type: 'Apartment', price: {$lt: 50}, "address.country": "Australia", amenities: "Elevator"}, {name: 1, _id: 0, price: 1, "address.country": 1, amenities: 1})
```

**Aufgabe** 

Mit KI Abfragen erstellen und CheetSheet ratings machen. Danach auf [GitHub](https://github.com/simon-gunacker/mongodb) pushen.