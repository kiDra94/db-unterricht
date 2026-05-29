Generell sollte man wissen wie man group, join, selct machen kann!
- [neo4js](https://neo4j.com/docs/getting-started/cypher/cypher-sql/)
    - Sprache ist cypher
    - Indexing nicht wichtig
    - Query examples sind wichtig (man kann Patterns MATCHEN!), Nach Spaltennamen, Where 
    - JOINS WICHTIG, ist die stärke
    - syntax muss man nicht im detail wissen, es reicht aus das man in die klammer die datentypen setyt, pfeile die richtungen zeigen, eckige klammern fuer die beiziehung return ist auch wichtig
    - eventuell bekommen wir SQL für das übersetzen oder einen graphen und dann die querry dazu
- [mongodb]()
    - noSQL-Datenbank und Dokumentbasierte DB, JSON als Datenformat für Speichern, JS als sprache --> **es gibt keine eigene Sprache** sondern Funktionen
    - der datentyp der parameter ist JSON, ich uebergebe JSON-Objekte an die funktionen, da gibt es bestimmte regel an die wir uns halten müssen
    - https://www.mongodb.com/docs/manual/reference/sql-comparison/
        - erstes objekt sind die parameter, das 2 die projection was angezeigt wird (bei select)
        - funktionen beginnen mit $ ($ne, $gt usw.)
    - man muss nicht großartig funktionen auswending wissen, wenn die funktion zb $or heisst und wir $oder schreiben ist egal
        - { age: { $gt: 25 } } oder { $gt: { age: 25 } } ist egal
        - logische fehler sind schlimm, nach einem $or kommt eine eckige klammer da es 2 bedingungen hat
    - [**aggregation pipeline ganz wichtig**]()
        - pipline wird als array ubergeben, jedes Stage ist ein Funktion wie $match, $group usw. (man muss sie als objekete weitergeben weil es JS verlangt, es gibt kein array von funktionen, nur objekten die funktionen sind.)
        - pipline wird von oben nach unten verarbeitet
        ```js
        db.movies.aggregate( // diese besipil hat der guni nicht gebracht, habe ich nur raskopiet aus der doku damit die stages erklaert werden
            [
                { // stage 1
                    $match: {
                        $expr: { $gt: [ "$imdb.rating", "$$minRating" ] }} 
                },
                { // stage 2
                    $limit: 3 
                }
            ],
            { let: { minRating: 8.5 } }
        )
        ```
        - was wichtig ist, zu wissen wie man **mit aggregate ein find machen** kann!
        - **group by** bei aggregate ganz wichtig --> **$group**
        - **join** wie man es in mongo mit aggregate machen kann --> **$lookup**
