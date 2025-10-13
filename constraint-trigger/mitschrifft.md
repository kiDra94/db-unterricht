## [Constraint](https://sqlite.org/syntax/table-constraint.html)
```sql
CREATE TABLE personen(id INTEGER PRIMARY KEY, name TEXT, age INTEGER);
INSERT INTO personen VALUES(1, 'Alice', 20);
.headers on
.mode column
SELECT * FROM personen;
id  name   age
--  -----  ---
1   Alice  20 
INSERT INTO personen VALUES(2, 'Bob', 'Dreiundzwanzig');
SELECT * FROM personen;
id  name   age           
--  -----  --------------
1   Alice  20            
2   Bob    Dreiundzwanzig
```

Wenn man die Datentypen überprüfen wollen muss man am Ende von CREATE TABLE eine STRICT machen:

```sql
CREATE TABLE personen(id INTEGER PRIMARY KEY, name TEXT, age INTEGER) STRICT;
INSERT INTO personen VALUES(2, 'Bob', 'Dreiundzwanzig');
Runtime error: cannot store TEXT value in INTEGER column personen.age (19)
```

## [Trigger](https://sqlite.org/lang_createtrigger.html)

```sql
CREATE TABLE kunde(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
);

CREATE TABLE bestellung(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kunden_id INTEGER,
    status TEXT CHECK (status IN ('offen', 'bezahlt')),
    FOREIGN KEY (kunden_id) REFERENCES kunde(id)
);

CREATE TRIGGER IF NOT EXISTS trg_keine_doppelten_bestellungen
BEFORE INSERT ON bestellung
FOR EACH ROW
WHEN (
    SELECT COUNT(*)
    FROM bestellung
    WHERE status = 'offen'
    AND kunden_id = NEW.kunden_id
) 
BEGIN 
    SELECT RAISE(ABORT, "Kunde hat bereits eine offene Bestellung");
END;

INSERT INTO kunde(id, name) VALUES(1, 'Alice');
INSERT INTO bestellung(id, kunden_id, status) VALUES(1, 1, 'offen');
INSERT INTO bestellung(id, kunden_id, status) VALUES(2, 1, 'offen');
Runtime error: Kunde hat bereits eine offene Bestellung (19)
```

Die Trigger werden in SQLite so angezeigt:
```sql
    .schema sqlite_master
    select type from sqlite_master;
    table
    table
    table
    trigger
```
### Aufgabe zum testen von Trigger

1. konto(id, name, saldo);
2. Eine log(konto_id, betrag, zeit) Tabelle; (bei zeit einen timestamp nehmen)
3. Trigger: Jedes mal wenn sich der Saldo ändert einen Logeintrag mit:
    - welches konto
    - um wie viel
    - wann

```sql
CREATE TABLE konto(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    saldo DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE log(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    konto_id INTEGER NOT NULL,
    betrag DECIMAL(10,2),
    datum DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (konto_id) REFERENCES konto(id)
);

INSERT INTO konto(id, name, saldo) VALUES(1, 'test', 1000.00);

CREATE TRIGGER IF NOT EXISTS trg_log_eintrag_konto_saldo_bewegung
AFTER UPDATE OF saldo ON konto --geht auch mit BEFOR
FOR EACH ROW
BEGIN
INSERT INTO log(konto_id, betrag) VALUES(NEW.id, (NEW.saldo - OLD.saldo));
END;

UPDATE konto SET saldo=400 WHERE id=1;
SELECT * FROM log;
```

### Gefahr von triggern

Tabelle mit abteilungen(id, name, budget, parant_id).
Beim trigger sagen wir das wir ein budget hat. Die Abteilung unterhalb bekommen ein teil davon. 
Wenn parent abteilung einen verdoppelung kriegt sollen die kinder auch ihre budgets verdoppeln

R&D hat erhoeung von 5000 auf 10000. Die Kinder IT und HW sollen auch verdoppelt werden. Der Trigger kann nur auf die tablle abteilung gelegt werden. da er sich selber immer aendert kommen wir in eine Rekursion

```sql
CREATE TABLE abteilung(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    budget DECIMAL(10,2),
    parent_id INTEGER,
    FOREIGN KEY (parent_id) REFERENCES abteilung(id)
);

INSERT INTO abteilung(id, name, budget) VALUES (1, 'R&D', 5000);
INSERT INTO abteilung(id, name, budget, parent_id) VALUES (2, 'IT', 2000, 1);
INSERT INTO abteilung(id, name, budget, parent_id) VALUES (3, 'HW', 3000, 1);

CREATE TRIGGER IF NOT EXISTS trg_automatische_budget_erhoeung
AFTER UPDATE OF budget ON abteilung
FOR EACH ROW
BEGIN
UPDATE abteilung SET budget=budget*(NEW.budget / OLD.budget) WHERE parent_id = NEW.id;
END;

UPDATE abteilung SET budget=10000 WHERE id=1;
SELECT * FROM abteilung;
id  name  budget  parent_id
--  ----  ------  ---------
1   R&D   10000            
2   IT    4000    1        
3   HW    6000    1  
```