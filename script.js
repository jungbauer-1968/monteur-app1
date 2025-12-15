const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/gviz/tq?tqx=out:csv&gid=1954522343";

async function ladeMeldungen() {
  const response = await fetch(SHEET_CSV_URL);
  const text = await response.text();

  const rows = text.split("\n").map(r =>
    r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v =>
      v.replace(/^"|"$/g, "").trim()
    )
  );

  const header = rows.shift();

  const idx = {
    zeit: header.indexOf("Zeitstempel"),
    projekt: header.indexOf("Projekt / Baustelle"),
    datum: header.indexOf("Datum"),
    monteur: header.indexOf("Monteur / Team"),
    woche: header.indexOf("Woche / Zeitraum"),
  };

  window._meldungen = rows.map(r => ({
    zeit: r[idx.zeit],
    projekt: r[idx.projekt],
    datum: r[idx.datum],
    monteur: r[idx.monteur],
    woche: r[idx.woche],
  }));

  befuellenMonteure();
}

function befuellenMonteure() {
  const select = document.getElementById("monteurSelect");
  const namen = [...new Set(window._meldungen.map(m => m.monteur))].sort();

  namen.forEach(n => {
    const o = document.createElement("option");
    o.value = n;
    o.textContent = n;
    select.appendChild(o);
  });
}

function filterMeldungen() {
  const name = document.getElementById("monteurSelect").value;
  const box = document.getElementById("liste");
  box.innerHTML = "";

  window._meldungen
    .filter(m => m.monteur === name)
    .reverse()
    .forEach(m => {
      const div = document.createElement("div");
      div.className = "eintrag";
      div.innerHTML = `
        <b>${m.projekt}</b><br>
        ${m.datum} – ${m.woche}<br>
        <small>${m.zeit}</small>
      `;
      box.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", ladeMeldungen);
