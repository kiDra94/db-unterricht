CREATE TABLE konto (
    id INTEGER PRIMARY KEY,
    name TEXT,
    saldo DECIMAL(10,2)
);

INSERT INTO konto VALUES(1, 'Alice', 1000.00);
INSERT INTO konto VALUES(2, 'Bob', 500.00);
INSERT INTO konto VALUES(3, 'Charlie', 200.00);

UPDATE konto SET saldo = saldo - 100 WHERE id = 1;
UPDATE konto SET saldo = saldo + 100 WHERE id = 2;

UPDATE konto SET saldo = saldo - 300 WHERE id = 2;
UPDATE konto SET saldo = saldo + 300 WHERE id = 3;

BEGIN TRANSACTION;
UPDATE konto SET saldo = saldo - 300 WHERE id = 2;
UPDATE konto SET saldo = saldo + 300 WHERE id = 3;
COMMIT; -- end of transactions

BEGIN TRANSACTION;
UPDATE konto SET saldo = saldo - 300 WHERE id = 2;
ROLLBACK; -- undo/schritt zurueck

BEGIN TRANSACTION; --erste Verbindung
UPDATE konto SET saldo = saldo - 300 WHERE id = 2;

BEGIN TRANSACTION; --zweite Verbindung
UPDATE konto SET saldo = saldo - 300 WHERE id = 2;
-- Runtime error: database is locked (5)
-- DB garantiert das man nur eine Transaktion auf einer Tabelle gleichzeitig offen haben kann
-- wenn wir die erste Verbindung schliessen wird ein rollback gemacht und die Tabelle ist wieder offen

-- Bei einer Transaktion wird eine journal-Datei erzeugt. Die Datei kopiert nur relevante teile der .db
-- journal ist ein altes dateimodell mit 
PRAGMA journal_mode=WAL;
-- es werden 2 Datein erzeugt eine shm (shared memory) wo der Arbeitsspeicher geteilt wird
-- und eine -wal die extrem klein ist!
-- sollang die Verbindung offen ist, bestehn diese Dataien, d.h. nach dem schliessen werden sie geloescht

BEGIN TRANSACTION;

ALTER TABLE konto ADD COLUMN kontorahmen DECIMAL(10,2) DEFAULT 0;
UPDATE konto SET kontorahmen = -500 WHERE id = 1;
UPDATE konto SET kontorahmen = -300 WHERE id = 3;
-- man kann kein add constraint in sqlite machen daher die kopie
CREATE TABLE konto1 (
    id INTEGER PRIMARY KEY,
    name TEXT,
    saldo DECIMAL(10,2),
    kontorahmen DECIMAL(10,2) DEFAULT 0,
    CHECK(saldo >= kontorahmen)
);

INSERT INTO konto1 SELECT * FROM konto;
DROP TABLE konto;
ALTER TABLE konto1 RENAME TO konto;

BEGIN TRANSACTION;
UPDATE konto SET saldo = saldo + 7000 WHERE id = 2;
UPDATE konto SET saldo = saldo - 7000 WHERE id = 1;
ROLLBACK; -- mann konnte theorethisch ein commit machen und geld 'erschaffen'

-- funktioniert nicht da wir keine LOG-Tabelle haben!!!!!!!
-- man kann in einer Transaction selects schreiebn und dann sagen
-- wenn der amount > 700 ist soll ein rollback kommen.
BEGIN TRANSACTION;
SELECT amount FROM log WHERE sender = 1 and reciver = 2;

-- in einer Transaction kann man auch savepoinst setzen sihe link
-- https://www.sqlite.org/lang_savepoint.html
-- wird in der praxis aber selten benutzt da wir solche sachen oft in code schon loesen
