# Mathematischen Grundlagen für Datenbanken
## Relationale ALgebra (RA)
- 60er: hirarchische/netzwerk "DBs".
- 70er: Code (Nachname von der Person) -> relationale Algebra, ist keine Implementierung, sondern ein "mathematische Framework".
- RA -> Teilgebit der Mathematik
	- Algebra: definiert Operatoren und deren Anwendung auf math. Objekte
	- Relation: ist ein mathematisches Objekt
- Grundlage der RA ist die Mengenlehre.
	- Menge: Zusammenfassung **wohldefinierter** Objekten zu einem Ganzen (Cantor).
	- 2 Axiome (grundlegende Annahme) der Mengenlehre:
		- Objekte in einer Menge dürfen **nicht mehrfach existieren**.
		- Sie haben **keine Reihenfolge** (weil keine Reinfolge angegeben ist).
	- Extensionalitätsprinzip: Eine Menge A == Menge B, dann wenn **alle Elemnte gleich sind**.\n Menge istdurch ihre Elemente "wohldefiniert". 
	- Operatoren der Mengenlehre:
		- Elementpredikat (element of): in der Informatik ist ein Predikat eine Funktion die ein Element bekommt und dann True/False zurück gibt.
	- Notation:
		- Aufzählend: z.B. {a, b, c}
		- Menge == Zusammenfügen, d.h. Gruppierung nach Eigenschaften. z.B. $$\forall a: a \in A \leftrightarrow \mathcal{E}(a)$$	
		- Komprehensation: Menge B = alle a für gewisse eigenschaften gelten. z.B. "gerade Zahlen". $$B = \{x \mid x \in \mathbb{N} \land x \bmod 2 \equiv 0\}$$
