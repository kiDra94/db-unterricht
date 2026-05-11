from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient

app = Flask(__name__)
# Erlaubt Cross-Origin Requests (damit dein HTML-Frontend auf die API zugreifen kann)
CORS(app)

# 1. Verbindung zur MongoDB herstellen
# Passe den Datenbanknamen 'openalex' und die Collection 'references' ggf. an
client = MongoClient("mongodb://localhost:27017/")
db = client["openalex"]
collection = db["references"]

# Hilfsfunktion: Wandelt das MongoDB-Dokument in BibTeX um
def generate_bibtex(doc):
    # Extrahiere die ID (z.B. aus 'https://openalex.org/W4231671316')
    doc_id = doc.get("id", "")
    citation_key = doc_id.split('/')[-1] if doc_id else "Unknown"
    
    title = doc.get("display_name", "")
    year = doc.get("publication_year", "")
    doi = doc.get("doi", "")
    doi_clean = doi.replace("https://doi.org/", "") if doi else ""
    
    # Sicheres Auslesen verschachtelter Dictionaries in Python
    primary_loc = doc.get("primary_location") or {}
    source = primary_loc.get("source") or {}
    
    publisher = source.get("host_organization_name", "Unbekannt")
    issn_list = source.get("issn", [])
    issn = ", ".join(issn_list) if isinstance(issn_list, list) else ""

    bibtex = f"""@periodical{{{citation_key},
  title     = {{{title}}},
  publisher = {{{publisher}}},
  year      = {{{year}}},
  doi       = {{{doi_clean}}},
  issn      = {{{issn}}},
  url       = {{{doi}}}
}}"""
    return bibtex

# 2. API-Route für die Suche definieren
@app.route("/search", methods=["GET"])
# 2. API-Route für die Suche definieren
@app.route("/search", methods=["GET"])
def search():
    query = request.args.get("q", "")
    
    if query:
        # Den Suchbegriff als Case-Insensitive Regex vorbereiten
        regex_pattern = {"$regex": query, "$options": "i"}
        
        # $or sucht in allen hier aufgelisteten Feldern nach einem Treffer
        search_filter = {
            "$or": [
                {"display_name": regex_pattern},                          # Haupttitel
                {"primary_location.source.display_name": regex_pattern},  # Journal/Quellen-Name
                {"primary_topic.display_name": regex_pattern},            # Hauptthema
                {"topics.display_name": regex_pattern},                   # Weitere Themen (Array)
                {"concepts.display_name": regex_pattern},                 # Konzepte (Array)
                {"keywords.display_name": regex_pattern}                  # Keywords (Array)
            ]
        }
    else:
        search_filter = {} # Wenn leer, nimm einfach die ersten
        
    # Limit auf 10 Ergebnisse setzen (kannst du bei Bedarf erhöhen)
    results = collection.find(search_filter).limit(10)

    # Ergebnisse formatieren und Liste für JSON-Ausgabe vorbereiten
    response_data = []
    for item in results:
        response_data.append({
            "display_name": item.get("display_name", "Kein Titel"),
            "publication_year": item.get("publication_year", "Unbekannt"),
            "bibtex": generate_bibtex(item)
        })

    return jsonify(response_data)

if __name__ == "__main__":
    # Startet den Server auf Port 5000
    app.run(debug=True, port=5000)