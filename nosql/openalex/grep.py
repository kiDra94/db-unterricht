from requests import get
from json import loads
import pymongo

client = pymongo.MongoClient("mongodb://localhost:27017/")
collection = client["openalex"]["references"]

start_id = 4231671316

for i in range(13):
    res = get(f"https://api.openalex.org/w{start_id + i}")
    collection.insert_one(loads(res.text))
    print(f"Gespeichert: w{start_id + i}")