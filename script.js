const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1dD709i76hdP2VOFGo48oNeOr-YsbAF6ZVBwlQvkY3DM/gviz/tq?tqx=out:json&sheet=Formularantworten%201";

async function loadReports(monteur) {
  const status = document.getElementById("status");
  const list = document.getElementById("reportList");

  status.textContent = "Lade Berichte …";
  list.innerHTML = "";

  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const rows = json.table.rows.map(r =>
      r.c.map(c => (c ? c.v : ""))
    );

    // Header weg
    rows.shift();

    const filtered = rows.filter(r => r[3] === monteur);

    status.textContent = `${filtered.length} Meldung(en) gefunden`;

    if (filtered.length === 0) {
      list.innerHTML = "<p>Keine Meldungen vorhanden.</p>";
      return;
    }

    filtered.reverse().forEach(r => {
      const div = document.createElement("div");
      div.className = "report-item";

      div.innerHTML = `
        <strong>${r[1]}</strong><br>
        Datum: ${r[2]}<br>
        Woche: ${r[4]}<br><br>

        <b>Leistungsfortschritt:</b><br>
        Baustelleneinrichtung: ${r[8]}<br>
        Zuleitung & Zählerplätze: ${r[9]}<br>
        Rohr- & Tragsysteme: ${r[10]}<br>
        Kabel & Leitungen: ${r[11]}
      `;

      list.appendChild(div);
    });

  } catch (e) {
    status.textContent = "Fehler beim Laden der Berichte";
    console.error(e);
  }
}

// Monteur-Auswahl
document.getElementById("monteurSelect").addEventListener("change", e => {
  let name = e.target.value;

  if (name === "_other") {
    document.getElementById("otherMonteurWrapper").classList.remove("hidden");
    document.getElementById("otherMonteur").addEventListener("input", ev => {
      if (ev.target.value.length > 1) {
        loadReports(ev.target.value);
      }
    });
    return;
  }

  document.getElementById("otherMonteurWrapper").classList.add("hidden");

  if (name) loadReports(name);
});
