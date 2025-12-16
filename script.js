// >>>>>> HIER DEINE GOOGLE-SHEET-ID <<<<<<
const SHEET_ID = "1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w";

// Name des Tabellenblatts
const SHEET_NAME = "Formularantworten 1";

// CSV-Export-URL (funktioniert nur wenn Sheet öffentlich ist)
const SHEET_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

let allRows = [];

// CSV laden
fetch(SHEET_URL)
  .then(res => res.text())
  .then(csv => {
    const lines = csv.split("\n").map(l => l.split(","));
    const header = lines.shift();

    allRows = lines.map(row => {
      const obj = {};
      header.forEach((h, i) => {
        obj[h.replaceAll('"', "").trim()] =
          (row[i] || "").replaceAll('"', "").trim();
      });
      return obj;
    });

    fillMonteurDropdown();
  });

// Dropdown füllen
function fillMonteurDropdown() {
  const select = document.getElementById("monteurSelect");
  const monteure = [...new Set(allRows.map(r => r["Monteur / Team"]).filter(Boolean))];

  monteure.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    select.appendChild(opt);
  });
}

// Meldungen anzeigen
function showReports() {
  const name = document.getElementById("monteurSelect").value;
  const box = document.getElementById("reportList");
  box.innerHTML = "";

  if (!name) return;

  const filtered = allRows.filter(r => r["Monteur / Team"] === name);

  if (filtered.length === 0) {
    box.innerHTML = "<p>Keine Meldungen gefunden.</p>";
    return;
  }

  filtered.reverse().forEach(r => {
    const div = document.createElement("div");
    div.className = "report";

    div.innerHTML = `
      <strong>${r["Projekt / Baustelle"]}</strong><br>
      Datum: ${r["Datum"]} | Woche: ${r["Woche / Zeitraum"]}<br>
      Baustelleneinrichtung: ${r["Baustelleneinrichtung (%)"] || "-"}<br>
      Zuleitung: ${r["Zuleitung & Zählerplätze (%)"] || "-"}<br>
      Rohr & Tragsysteme: ${r["Rohr- und Tragsysteme (%)"] || "-"}
      <hr>
    `;
    box.appendChild(div);
  });
}
