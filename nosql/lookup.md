## Aufgabe 1: Wracks auf derselben Karte finden

Das Szenario: Du möchtest zu jedem Wrack direkt sehen, welche anderen Wracks ebenfalls auf derselben nautischen Karte verzeichnet sind.
Die Aufgabe: Erstelle einen $lookup auf die shipwrecks-Collection selbst. Verknüpfe die Dokumente über das Feld chart. Das bedeutet: Das localField und das foreignField sind identisch (chart). Sammle die Ergebnisse in einem neuen Array namens wracks_auf_gleicher_karte.

## Aufgabe 2: Der bereinigte Self-Join (Sich selbst ausschließen)

Das Szenario: Aufgabe 1 hat einen kleinen Schönheitsfehler: Da das Ausgangswrack natürlich auch auf seiner eigenen Karte liegt, taucht es im angehängten Array als "Kopie" nochmal auf. Das wollen wir verhindern.
Die Aufgabe: Nutze die erweiterte $lookup-Syntax (mit let und pipeline). Verknüpfe wieder über das Feld chart, aber füge in der Pipeline einen $match-Filter hinzu, der sicherstellt, dass die _id der gefundenen Wracks nicht der _id deines Ausgangswracks entspricht.

## Aufgabe 3: Gegensätze anziehen (Sichtbar vs. Untergetaucht)

Das Szenario: Du interessierst dich für Wracks der Kategorie 'Wrecks - Visible' (sichtbar). Du möchtest wissen, ob es auf derselben Karte (chart) auch gefährliche, untergetauchte Wracks ('Wrecks - Submerged, dangerous') gibt.
Die Aufgabe: Filtere deine Hauptabfrage zuerst so, dass nur "Visible"-Wracks durchgelassen werden. Mache dann einen $lookup (mit pipeline), der nach Wracks auf derselben chart sucht, wobei innerhalb des Lookups die Bedingung gilt, dass der feature_type des gefundenen Wracks 'Wrecks - Submerged, dangerous' sein muss.

## Aufgabe 4: Schiffe auf gleicher Tiefe

Das Szenario: Du möchtest Wracks gruppieren, die exakt auf derselben Tiefe (depth) liegen.
Die Aufgabe: Filtere zuerst alle Dokumente heraus, bei denen depth nur ein leerer String "" ist (damit du nicht hunderte Wracks ohne Tiefenangabe sinnlos miteinander joinst). Führe danach einen $lookup aus, der die Wracks über das Feld depth miteinander verknüpft.

## Aufgabe 5: Gemeinsamer Wasserstand und Qualität

Das Szenario: Du möchtest Wracks finden, die sich sowohl den Wasserstand (watlev) als auch den Qualitätsindikator (gp_quality) teilen.
Die Aufgabe: Nutze die erweiterte $lookup-Syntax mit let und pipeline. Übergebe sowohl watlev als auch gp_quality als Variablen (let). In der $match-Stage der Pipeline müssen dann beide Felder über $expr und $and übereinstimmen, damit das gefundene Wrack an das Array des Hauptdokuments angehängt wird.