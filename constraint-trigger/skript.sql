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
AFTER UPDATE OF saldo ON konto
FOR EACH ROW
BEGIN
INSERT INTO log(konto_id, betrag) VALUES(NEW.id, (NEW.saldo - OLD.saldo));
END;

UPDATE konto SET saldo=400 WHERE id=1;
SELECT * FROM log;

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
