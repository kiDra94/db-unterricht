import re


A = {1, 2, 3} # variable ist gross da es eine Menge ist, ist ein SET

# print(A)

B = set([1, 2, 2, 3,])
# print(B)

C = [1, 2, 2, 3] # eine Liste ist keine Menge da Elemente doppelt drinnen sind
# print(C)

B = {a for a in range(50) if a % 2 == 0} # das ist eine Komprehensation
# print(B)

# Eigenes SET
from pprint import pprint

class MengeGenerell:
    def __init__(self) -> None:
        self.__data = []

    def __contains__(self, x): # die __contains__ kann spaeter mit 'in' aufgerufen werden z.B. 1 in Menge
        for _x in self.__data:
            if x == _x:
                return True
        return False

class MengeNamen:
    def __init__(self) -> None:
        self.__data = [None]*26

    def add(self, item):
        idx = self.hash(item)
        if not self.__data[idx]:
            self.__data[idx] = []
        self.__data[idx].append(item)
        # pprint(self.__data)

    def hash(self, item): # Hashfunktion nimmt einen wert und gibt einen numerischen wert zurueck
        return (ord(item[0].upper()) - ord('A')) % 26 # in ASCII umwandeln - offset von A % 26 damit Oetzie platz hat

m = MengeNamen()

m.add("Anton")
m.add("Albert")
m.add("Alina")
m.add("Robert")
m.add("Martin")
m.add("Ötzie")


# Kreuzprodukt
A = range(1, 5)
B = 'a b c d e f g j k l'.split()
AxB = { (a, b) for a in A for b in B}
# pprint(AxB)

#Relation & Projektionsoperator

class RelationalAlgebra:
    def __init__(self, relations):
        self.rs = relations

    # projektion : pi_I(R) = { (a_i | i in I) forall row in R }
    def projektionsoperator(self, *I): #*I ist Tupel unpacking | SQL wuerde das SELECT FROM nennen
        def _(R):
            yield from (tuple(row[i] for i in I) for row in self.rs[R])
        return _

    # selection : sigma_p(R) = { r forall row in R if p(row) }
    def selectionoperator(self, p):
        def _(R):
            yield from (row for row in self.rs[R] if p(row))
        return _

    def union(self, R, S):
        return self.rs[R] | self.rs[S]
        # seen = set()
        # for r in self.rs[R]:
        #     seen.add(r)
        #     yield r
        # for s in self.rs[S]:
        #     if s not in seen:
        #         yield s


    def minus_except(self, R, S):
        return self.rs[R] - self.rs[S]
        # for r in self.rs[R]:
        #     if r not in self.rs[S]:
        #         yield r

    def kreuzprodukt(self, R, S):
        return { (*r, *s) for r in self.rs[R] for s in self.rs[S] }

ra = RelationalAlgebra({
    "personen": {
        (1, "Max", "Musterman", "m", 1), 
        (2, "Erika", "Musterfrau", "w", 2),
        (3, "Otto", "Normalverbraucher", "m", 1),
        (4, "Anna", "Musterfrau", "w", 2),
        },
    "hobbys": {
        (1, "Fußball"),
        (2, "Volleyball"),
        },
})

# for row in ra.projektionsoperator(0, 1, 2)("personen"): 
#     # 0 ist erste Spalte alse ID, 
#     # 1 ist 2. Spalte also Vorname 
#     # 3. Spalte alse Nachname
#     pprint(row)

# das gleichewie for result in cursor.fetchall(): print(result)

# for row in ra.selectionoperator(lambda row: row[3] == "w")("personen"):
#     pprint(row)

# partiale Applikation
def gender(g):
    def _(row):
        return row[3] in g
    return _

# is_male = gender("m")
# is_femaile = gender("wf")

is_male = lambda row: row[3] == "m"
is_femaile = lambda row: row[3] == "w"

# for row in ra.selectionoperator(gender("m"))("personen"):
#     pprint(row)

# for row in ra.selectionoperator(is_femaile)("personen"):
#     pprint(row)

# for row in ra.union("personen", "hobbys"):
#     pprint(row)

# for row in ra.kreuzprodukt("personen", "hobbys"):
#     pprint(row)

# der JOIN ist ein kreuzprodukt gefolgt von einer Selektion (dem WHERE)
ra.rs["personen_hobbys"] = ra.kreuzprodukt("personen", "hobbys")
for row in ra.selectionoperator(lambda row: row[4] == row[5])("personen_hobbys"):
    pprint(row)