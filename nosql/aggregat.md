Aggregate ist historisch nur das GROUP BY, praktisch ist es die Lösung für alles. Mit aggregate kann man jeden find auch lösen.

Aggregate bekomm piplines übergeben. Die pipline leitet inputs/outputs um, in "Kastel" wo sie weiter verarbeitet werden kann.

```
Bsp fuer pipline wäre ls | grep 'Visual' | grep '2025'
```

### Aggregat Beispiele

```
# group by feature_type
db.shipwrecks.aggregate( [ {$group: { _id: "$feature_type" } } ] )

# count how many feature type there are
db.shipwrecks.aggregate( [ 
    {
    $group: { _id: "$feature_type" } 
    },
    {
    $count: "count"
    }
] )

#count how many types pro feature_type
db.shipwrecks.aggregate([
    {
        $group: {
            _id: "$feature_type",
            "feature_pro_type": { $sum: 1}
        }
    }
])

#count how many types pro feature_type and the avg lat and londec
db.shipwrecks.aggregate([
    {
        $group: {
            _id: "$feature_type",
            "feature_pro_type": { $sum: 1 },
            "avg_latdec": { $avg: "$latdec" },
            "avg_londec": { $avg: "$londec" }
        }
    }
])

#count all latdec gte 10 and lt 10
db.shipwrecks.aggregate(  [
   {
      $group: {
          _id: {
            $cond: {
              if: { $gte: [ "$latdec", Decimal128("10") ] },
              then: "Latdec >= 10",
              else: "Latdec < 10"
            }
          },
          count: { $sum: 1 }
      }
   }
]  )

#count all wracks with Y-Coordinate gte 10 and lt 10
db.shipwrecks.aggregate(  [
   {
      $group: {
          _id: {
            $cond: {
              if: { $gte: [{ $arrayElemAt: ["$coordinates", 1] }, 10] },
              then: "Y-Coordinate >= 10",
              else: "Y-Coordinate < 10"
            }
          },
          count: { $sum: 1 }
      }
   }
]  )
```