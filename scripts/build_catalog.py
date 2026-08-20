#!/usr/bin/env python3
"""Generate BND → Spider-Geddon catalog. Facts live here, not in the UI."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"


def issue(id_, series, number, year, title, arc, era, priority="required", **extra):
    rec = {
        "id": id_,
        "series": series,
        "number": number,
        "year": year,
        "title": title,
        "arc": arc,
        "era": era,
        "priority": priority,
        "eventTags": extra.get("eventTags", []),
        "spoiler": extra.get("spoiler", False),
        "blurb": extra.get("blurb", ""),
        "gcdSearch": extra.get(
            "gcdSearch",
            f"{series} {number}".replace(" ", "+"),
        ),
        "readingOrder": extra["readingOrder"],
    }
    return rec


def add_range(out, series, start, end, year, title, arc, era, ro0, **kw):
    ids = []
    ro = ro0
    for n in range(start, end + 1):
        iid = f"{series.lower().replace(' ', '-')}-{n}"
        out.append(
            issue(
                iid,
                series,
                n,
                year,
                title,
                arc,
                era,
                readingOrder=ro,
                **kw,
            )
        )
        ids.append(iid)
        ro += 1
    return ids, ro


def main():
    issues = []
    ro = 1

    # --- Brand New Day ---
    chunks = [
        (546, 551, 2008, "Brand New Day opens", "Kraven's First Hunt / new status quo", "bnd", "required",
         "Peter starts over. Aunt May lives. No one knows he's Spider-Man. Kraven's family is already circling."),
        (552, 558, 2008, "New Ways to Die", "New Ways to Die", "bnd", "required",
         "Norman Osborn, Mac Gargan as Venom, and the first appearance of Anti-Venom. Must-read BND."),
        (559, 563, 2008, "Crime and Punishment", "Menace / Crime", "bnd", "recommended",
         "Street-level BND: Menace, the old neighborhood, the paper."),
        (564, 567, 2008, "Death of a Menace", "Death of a Menace", "bnd", "recommended", ""),
        (568, 573, 2008, "Secret Invasion tie-in", "Secret Invasion", "bnd", "optional",
         "Optional event detour. Skip if you are not reading Secret Invasion."),
        (574, 577, 2008, "Character Assassination lead-in", "Run-up", "bnd", "recommended", ""),
        (578, 583, 2009, "Character Assassination", "Character Assassination", "bnd", "required",
         "The Bugle turns on Spider-Man. Reputation damage that still matters later."),
        (584, 588, 2009, "Red-Headed Stranger", "Red-Headed Stranger", "bnd", "recommended",
         "Mary Jane, now outside the marriage, and the cost of Brand New Day."),
        (589, 594, 2009, "Old friends", "American Son / Mysterio", "bnd", "recommended", ""),
        (595, 599, 2009, "Return of the Black Cat", "Black Cat", "bnd", "recommended", ""),
        (600, 611, 2009, "24/7 and the last quiet stretch", "ASM 600 / 24-7", "bnd", "recommended",
         "Anniversary issue and the last breath before The Gauntlet."),
        (612, 616, 2010, "The Gauntlet begins", "The Gauntlet", "bnd", "required",
         "Classic villains, rebuilt. Direct on-ramp to Grim Hunt."),
        (617, 626, 2010, "The Gauntlet continues", "The Gauntlet", "bnd", "required", ""),
        (627, 629, 2010, "Shed", "Shed", "bnd", "required", "The Lizard, rewritten. Ugly and essential."),
        (630, 637, 2010, "Grim Hunt", "Grim Hunt", "bnd", "required",
         "The Kraven family finale of Brand New Day. On-ramp into Big Time."),
        (638, 647, 2010, "One Moment in Time / epilogue", "One Moment in Time", "bnd", "recommended",
         "How Brand New Day happened, and the last pages of this costume of the run."),
    ]
    bnd_ids = []
    si_ids = []
    for start, end, year, title, arc, era, pri, blurb in chunks:
        tags = ["secret-invasion"] if "Secret Invasion" in arc else []
        ids, ro = add_range(
            issues, "Amazing Spider-Man", start, end, year, title, arc, era, ro,
            priority=pri, eventTags=tags, blurb=blurb,
        )
        if "Secret Invasion" in arc:
            si_ids.extend(ids)
        else:
            bnd_ids.extend(ids)

    # --- Big Time ---
    bt_ids = []
    chunks_bt = [
        (648, 651, 2010, "Big Time", "Big Time", "big-time", "required",
         "Horizon Labs. A more confident Peter. New costume, new job."),
        (652, 656, 2010, "No One Dies / Origin of the Species", "Big Time", "big-time", "required", ""),
        (657, 660, 2011, "The Fantastic Spider-Man / return pieces", "Uncollected stretch", "big-time", "recommended",
         "No omnibus yet — trades and singles only."),
        (661, 665, 2011, "Spider-Island prelude", "Uncollected stretch", "big-time", "recommended", ""),
        (666, 673, 2011, "Spider-Island", "Spider-Island", "big-time", "required",
         "Everyone in New York gets spider-powers. One of the better event runs of this era."),
        (674, 676, 2011, "Flying Blind", "Uncollected stretch", "big-time", "recommended", ""),
        (677, 681, 2011, "Danger Zone / Alpha", "Uncollected stretch", "big-time", "optional", ""),
        (682, 687, 2012, "Ends of the Earth", "Ends of the Earth", "big-time", "required",
         "Doc Ock's endgame. Required if you care about Dying Wish."),
        (688, 697, 2012, "Lizard / Goblin stretch", "Uncollected stretch", "big-time", "recommended",
         "Green Goblin returns. Still no omnibus for most of this."),
    ]
    gap_ids = []
    island_ids = []
    bigtime_omni_ids = []
    for start, end, year, title, arc, era, pri, blurb in chunks_bt:
        ids, ro = add_range(
            issues, "Amazing Spider-Man", start, end, year, title, arc, era, ro,
            priority=pri, blurb=blurb, eventTags=["spider-island"] if "Island" in arc else [],
        )
        bt_ids.extend(ids)
        if start <= 656:
            bigtime_omni_ids.extend(ids)
        elif 666 <= start <= 673:
            island_ids.extend(ids)
        else:
            gap_ids.extend(ids)

    # Dying Wish — issues also belong to Superior Omni Vol 1
    dw_ids, ro = add_range(
        issues, "Amazing Spider-Man", 698, 700, 2012,
        "Dying Wish", "Dying Wish", "dying-wish", ro,
        priority="required", spoiler=True,
        blurb="Otto Octavius swaps bodies with Peter. The last three issues of this Amazing run. Collected in Superior Spider-Man Omnibus Vol. 1 — not a standalone book.",
    )

    # Superior
    sup_ids = []
    for start, end, year, title, arc, pri, blurb in [
        (1, 5, 2013, "A Different Shade of Spider-Man", "Superior opens", "required",
         "Otto tries to be a better Spider-Man. Darker, more ruthless, Peter's memories bleeding through."),
        (6, 10, 2013, "A Troubled Mind", "Superior mid", "required", ""),
        (11, 16, 2013, "No Escape / necessary evil", "Superior mid", "required", ""),
        (17, 21, 2014, "Goblin Nation lead-in", "Goblin Nation", "required", ""),
        (22, 31, 2014, "Goblin Nation", "Goblin Nation", "required",
         "The original Superior run ends. Otto's city, Norman's war."),
    ]:
        ids, ro = add_range(
            issues, "Superior Spider-Man", start, end, year, title, arc, "superior-i", ro,
            priority=pri, spoiler=True, blurb=blurb,
        )
        sup_ids.extend(ids)

    # Annuals as single issues
    for n, year in [(1, 2013), (2, 2014)]:
        iid = f"superior-spider-man-annual-{n}"
        issues.append(issue(
            iid, "Superior Spider-Man Annual", n, year,
            "Superior Annual", "Annuals", "superior-i",
            readingOrder=ro, spoiler=True, priority="recommended",
        ))
        sup_ids.append(iid)
        ro += 1

    av_ids = []
    issues.append(issue(
        "avenging-spider-man-15.1", "Avenging Spider-Man", "15.1", 2013,
        "Otto tie-in", "Avenging", "superior-i",
        readingOrder=ro, priority="optional", spoiler=True,
        blurb="Collected in Superior Spider-Man Returns Omnibus, not Vol. 1.",
    ))
    av_ids.append("avenging-spider-man-15.1")
    ro += 1
    ids, ro = add_range(
        issues, "Avenging Spider-Man", 16, 22, 2013,
        "Otto tie-in", "Avenging", "superior-i", ro,
        priority="optional", spoiler=True,
    )
    av_ids.extend(ids)

    tu_ids, ro = add_range(
        issues, "Superior Spider-Man Team-Up", 1, 12, 2013,
        "Team-ups", "Team-Up", "superior-i", ro,
        priority="optional", spoiler=True,
        blurb="Otto versus the wider Marvel U. Returns omnibus, not Vol. 1.",
    )

    # Spider-Verse
    ev_ids = []
    for series, start, end, year, title in [
        ("Edge of Spider-Verse", 1, 5, 2014, "Edge of Spider-Verse"),
        ("Amazing Spider-Man 2014", 9, 15, 2014, "Spider-Verse"),
        ("Spider-Verse", 1, 2, 2014, "Spider-Verse"),
    ]:
        ids, ro = add_range(
            issues, series, start, end, year, title, "Spider-Verse", "spider-verse", ro,
            priority="required", eventTags=["spider-verse"], spoiler=True,
            blurb="Every Spider-person versus the Inheritors. Peter returns to his own body here.",
        )
        ev_ids.extend(ids)

    # Worldwide gap — honest length: 2015 ASM 1–50-ish through Red Goblin
    ww_ids = []
    for start, end, year, title, pri, blurb in [
        (1, 11, 2015, "Worldwide opens", "required", "2015 relaunch. No omnibus yet — trades only."),
        (12, 19, 2016, "Clone Conspiracy adjacent", "optional", ""),
        (20, 32, 2017, "Worldwide mid", "recommended", ""),
        (33, 49, 2018, "Threat Level: Red / Red Goblin", "required",
         "Go Down Swinging. Still trades, not an omnibus."),
        (50, 50, 2018, "Amazing finale of this numbering", "recommended", ""),
    ]:
        ids, ro = add_range(
            issues, "Amazing Spider-Man 2015", start, end, year, title, "Worldwide", "spider-verse", ro,
            priority=pri, blurb=blurb,
        )
        ww_ids.extend(ids)

    # Superior Vol. 2 / Otto returns (2018–2023 material in Returns omni)
    s2_ids, ro = add_range(
        issues, "Superior Spider-Man 2018", 1, 12, 2018,
        "Otto's return", "Superior II", "superior-ii", ro,
        priority="recommended", spoiler=True,
        blurb="Years later Otto is his own hero. Same Returns omnibus that also holds Team-Up and Avenging.",
    )
    issues.append(issue(
        "superior-spider-man-returns-1", "Superior Spider-Man Returns", 1, 2023,
        "Returns", "Superior II", "superior-ii",
        readingOrder=ro, priority="optional", spoiler=True,
    ))
    s2_ids.append("superior-spider-man-returns-1")
    ro += 1
    ids, ro = add_range(
        issues, "Superior 2023", 1, 8, 2023,
        "Superior (2023)", "Superior II", "superior-ii", ro,
        priority="optional", spoiler=True,
    )
    s2_ids.extend(ids)

    # Spider-Geddon — actual issue map, not "+ tie-ins"
    ged_ids = []
    issues.append(issue(
        "spider-geddon-0", "Spider-Geddon", 0, 2018, "Spider-Geddon",
        "Spider-Geddon", "spider-geddon", readingOrder=ro, priority="required",
        eventTags=["spider-geddon"], spoiler=True,
        blurb="The Inheritors return. Sequel to Spider-Verse. Closes this tracker era.",
    ))
    ged_ids.append("spider-geddon-0")
    ro += 1
    ids, ro = add_range(
        issues, "Spider-Geddon", 1, 5, 2018, "Spider-Geddon",
        "Spider-Geddon", "spider-geddon", ro,
        priority="required", eventTags=["spider-geddon"], spoiler=True,
    )
    ged_ids.extend(ids)
    for series, start, end in [
        ("Vault of Spiders", 1, 2),
        ("Spider-Girls", 1, 3),
        ("Superior Octopus", 1, 1),
    ]:
        ids, ro = add_range(
            issues, series, start, end, 2018, f"{series} tie-in",
            "Spider-Geddon", "spider-geddon", ro,
            priority="optional", eventTags=["spider-geddon"], spoiler=True,
        )
        ged_ids.extend(ids)

    issues.sort(key=lambda x: x["readingOrder"])

    collections = [
        {
            "id": "bnd-omni-1",
            "type": "omnibus",
            "title": "Brand New Day Omnibus Vol. 1",
            "era": "bnd",
            "year": 2008,
            "msrp": 99.99,
            "msrpAsOf": "2024",
            "isbn": "978-1302923679",
            "issueIds": [i["id"] for i in issues if i["series"] == "Amazing Spider-Man" and isinstance(i["number"], int) and 546 <= i["number"] <= 583 and i["arc"] != "Secret Invasion"]
            + si_ids,
            "blurb": "Kraven's First Hunt, New Ways to Die, Secret Invasion as an optional extra.",
            "coverHue": 0,
            "links": {
                "gcd": "https://www.comics.org/searchNew/?q=Brand+New+Day+Omnibus+Vol.+1",
                "marvel": "https://www.marvel.com/comics/discover",
            },
        },
        {
            "id": "bnd-omni-2",
            "type": "omnibus",
            "title": "Brand New Day Omnibus Vol. 2",
            "era": "bnd",
            "year": 2009,
            "msrp": 99.99,
            "msrpAsOf": "2024",
            "isbn": "978-1302928513",
            "issueIds": [i["id"] for i in issues if i["series"] == "Amazing Spider-Man" and isinstance(i["number"], int) and 584 <= i["number"] <= 611],
            "blurb": "Character Assassination, Red-Headed Stranger, run-up to The Gauntlet.",
            "coverHue": 12,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Brand+New+Day+Omnibus+Vol.+2"},
        },
        {
            "id": "bnd-omni-3",
            "type": "omnibus",
            "title": "Brand New Day Omnibus Vol. 3",
            "era": "bnd",
            "year": 2010,
            "msrp": 150.00,
            "msrpAsOf": "2024",
            "isbn": "978-1302947699",
            "issueIds": [i["id"] for i in issues if i["series"] == "Amazing Spider-Man" and isinstance(i["number"], int) and 612 <= i["number"] <= 647],
            "blurb": "The Gauntlet, Shed, Grim Hunt. Direct on-ramp into Big Time.",
            "coverHue": 24,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Brand+New+Day+Omnibus+Vol.+3"},
        },
        {
            "id": "big-time-omni",
            "type": "omnibus",
            "title": "Big Time Omnibus",
            "era": "big-time",
            "year": 2010,
            "msrp": 74.99,
            "msrpAsOf": "2024",
            "issueIds": bigtime_omni_ids,
            "blurb": "Horizon Labs and the costume change. Does not include Spider-Island or Ends of the Earth.",
            "coverHue": 210,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Amazing+Spider-Man+Big+Time+Omnibus"},
        },
        {
            "id": "spider-island-omni",
            "type": "omnibus",
            "title": "Spider-Island Omnibus",
            "era": "big-time",
            "year": 2011,
            "msrp": 74.99,
            "msrpAsOf": "2024",
            "issueIds": island_ids,
            "blurb": "Everyone in NYC gets spider-powers.",
            "coverHue": 140,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Spider-Island+Omnibus"},
        },
        {
            "id": "big-time-gap",
            "type": "gap",
            "title": "Big Time — no omnibus yet",
            "era": "big-time",
            "year": 2011,
            "issueIds": gap_ids,
            "blurb": "Ends of the Earth, Alpha, Goblin return. Trades and singles only. This card cannot be owned.",
            "coverHue": 0,
            "links": {},
        },
        {
            "id": "superior-omni-1",
            "type": "omnibus",
            "title": "Superior Spider-Man Omnibus Vol. 1",
            "era": "superior-i",
            "year": 2013,
            "msrp": 99.99,
            "msrpAsOf": "2024",
            "mustRead": True,
            "issueIds": dw_ids + [i for i in sup_ids],
            "blurb": "One physical book: Dying Wish (ASM 698–700) through Superior #31 and both Annuals.",
            "coverHue": 280,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Superior+Spider-Man+Omnibus+Vol.+1"},
        },
        {
            "id": "superior-returns-omni",
            "type": "omnibus",
            "title": "Superior Spider-Man Returns Omnibus",
            "era": "superior-ii",
            "year": 2018,
            "msrp": 99.99,
            "msrpAsOf": "2024",
            "issueIds": av_ids + tu_ids + s2_ids,
            "blurb": "One physical book spanning 2013 Team-Up / Avenging through 2023. Own it once.",
            "coverHue": 300,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Superior+Spider-Man+Returns+Omnibus"},
        },
        {
            "id": "spider-verse-omni",
            "type": "omnibus",
            "title": "Spider-Verse Omnibus",
            "era": "spider-verse",
            "year": 2014,
            "msrp": 100.00,
            "msrpAsOf": "2024",
            "issueIds": ev_ids,
            "blurb": "Edge of Spider-Verse, the 2014 Amazing issues, and the two-issue event book.",
            "coverHue": 330,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Spider-Verse+Omnibus"},
        },
        {
            "id": "worldwide-gap",
            "type": "gap",
            "title": "Worldwide / Red Goblin — trades only",
            "era": "spider-verse",
            "year": 2015,
            "issueIds": ww_ids,
            "blurb": "Post–Spider-Verse Slott through Go Down Swinging. Not #1–32 only — this gap runs through #50.",
            "coverHue": 40,
            "links": {},
        },
        {
            "id": "spider-geddon-tpb",
            "type": "tpb",
            "title": "Spider-Geddon",
            "era": "spider-geddon",
            "year": 2018,
            "msrp": 39.99,
            "msrpAsOf": "2024",
            "issueIds": ged_ids,
            "blurb": "Core #0–5 plus named tie-ins (Vault of Spiders, Spider-Girls, Superior Octopus).",
            "coverHue": 350,
            "links": {"gcd": "https://www.comics.org/searchNew/?q=Spider-Geddon"},
        },
    ]

    eras = [
        {"id": "bnd", "label": "Brand New Day", "years": "2007–2010"},
        {"id": "big-time", "label": "Big Time", "years": "2010–2012"},
        {"id": "dying-wish", "label": "Dying Wish", "years": "2012"},
        {"id": "superior-i", "label": "Superior", "years": "2013–2014"},
        {"id": "spider-verse", "label": "Spider-Verse / Worldwide", "years": "2014–2018"},
        {"id": "superior-ii", "label": "Otto returns", "years": "2018–2023"},
        {"id": "spider-geddon", "label": "Spider-Geddon", "years": "2018"},
    ]

    DATA.mkdir(exist_ok=True)
    payload = {
        "schemaVersion": 1,
        "spine": "Brand New Day → Spider-Geddon",
        "eras": eras,
        "issues": issues,
        "collections": collections,
    }
    (DATA / "catalog.json").write_text(json.dumps(payload, indent=2))
    (DATA / "issues.json").write_text(json.dumps(issues, indent=2))
    (DATA / "collections.json").write_text(json.dumps(collections, indent=2))
    print(f"issues={len(issues)} collections={len(collections)}")
    for c in collections:
        print(f"  {c['id']}: {len(c['issueIds'])} issues type={c['type']}")


if __name__ == "__main__":
    main()
