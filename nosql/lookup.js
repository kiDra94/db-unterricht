// Aufgabe 1
db.shipwrecks.aggregate([
    {
        $lookup:
        {
            from: "shipwrecks",
            localField: "chart",
            foreignField: "chart",
            as: "wracks_auf_gleicher_karte"
        }
    }
])

// Aufgabe 2
db.shipwrecks.aggregate([
    {
        $lookup:
        {
            from: "shipwrecks",
            localField: "chart",
            foreignField: "chart",
            let: { id: "$_id" },
            pipeline: [
                {
                    $match:
                    {
                        $expr:
                            { $not: [{ $eq: ["$_id", "$$id"] }] }
                    }
                },
            ],
            as: "wracks_auf_gleicher_karte"
        }
    }
])

// Aufgabe 3
db.shipwrecks.aggregate([
    {
        $match: {
            feature_type: "Wrecks - Visible"
        }
    },
    {
        $lookup:
        {
            from: "shipwrecks",
            localField: "chart",
            foreignField: "chart",
            pipeline: [
                {
                    $match:
                    {
                        feature_type: "Wrecks - Submerged, dangerous"
                    }
                },
            ],
            as: "wracks_submerged_und_dangerous_auf_gleicher_karte"
        }
    }
])

// Aufgabe 4
db.shipwrecks.aggregate([
    {
        $match: {
            depth: { $ne: "" }
        }
    },
    {
        $lookup: {
            from: "shipwrecks",
            localField: "depth",
            foreignField: "depth",
            let: { id: "$_id" },
            pipeline: [
                {
                    $match:
                    {
                        $expr:
                            { $not: [{ $eq: ["$_id", "$$id"] }] }
                    }
                },
            ],
            as: "wrecks_gleiche_tiefe"
        }
    }
])

// Aufgabe 5 ACHTUNG DAUERT ETWAS LAENGER

db.shipwrecks.aggregate([
    {
        $lookup: {
            from: "shipwrecks",
            let: { 
                wasserstand: "$watlev", 
                qualitaet: "$gp_quality",
                start_id: "$_id" 
            },
            pipeline: [
                {
                    $match: {
                         $expr: {
                            $and: [
                                { $eq: ["$watlev", "$$wasserstand"] },
                                { $eq: ["$gp_quality", "$$qualitaet"] },
                                { $ne: ["$_id", "$$start_id"] } 
                            ]
                        }
                    }
                }
            ],
            as: "wracks_mit_gleichem_status"
        }
    }
])