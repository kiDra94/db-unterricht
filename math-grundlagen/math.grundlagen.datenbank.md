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
### Kartesische Produkt
- **Das Kreuzprodukt** (jedes mit jedem wird kombiniert).$$A \times B := \{(a,b) \mid a \in A,\; b \in B\}$$ allgemein $$f: A \to B \land (\forall a \in A)(\exists! b \in B)(f(a) = b)$$
- **Relation**
	- eine Relation ist eine echte **Teilmenge** aus dem kart. Produkt von **n-Mengen**. $$R \subseteq A \times A \times \dots \times A$$
	Bsp. Menge A1 = {1, 2, 3, 4} Menge B = {a, b, c} -> R ist eine Teilmenge aus {(1, a), (2, a), (3, a), (4, a), (1, b), ... , (4, c)}.
	Bsp. einer Relation ```{"personen": {(1, "Max", "Musterman"), (2, "Erika", "Musterfrau")}```
	- **Projektionsoperator $\pi$ (Pi)**
	Sei I die Indexmenge {1, 2, ..., n} dann ist $$\pi_I(R) := \{ (a_i \mid i \in I) \mid a \in R \}$$

		BSP: $$pi_1(personen) = \{ (1, \text{"Max"}, \text{"Mustermann"}), (2, \text{"Erika"}, \text{"Musterfrau"}) \}$$
		Der Index **i** ist die **Columns** und die **personen** ist die **Table** bzw die **Relation**.
	- **Selectionsoperator $\sigma$ (sigma)**
		$$\sigma_{\varphi}(R) := \{ t \in R \mid \varphi(t) \}$$
		mit: $$\varphi \colon t \in R \mapsto \{ \text{true, false} \}$$ BSP: Bsp.:
	$$\sigma_{t[0] > 1}(\text{Personen}):$$
	(1, {"Max"}, {"Mustermann"})
	(2, {"Erika"}, {"Musterfrau"}) -> das t ist das Tupel also kommt nur der Datensatz von der Erika da and der stelle [0] vom Tupel die id 2 > 1 ist, in SQL nennen wir es **WHERE**.

### Vereinungsoperator (Union)

$$ R \cup S := \{ t \mid t \in R \cup t \in S \} $$

Beide Zusammen aber das doppelte kommt nur einmal vor.