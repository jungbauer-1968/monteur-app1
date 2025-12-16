const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/export?format=csv&gid=1954522343";

const monteurSelect = document.getElementById("monteurSelect");
const statusEl = document.getElementById("status");
const reportList = document.getElementById("reportList");

/* Google Formular Button */
document.getElementById("openFormBtn").addEventListener("click", () => {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform",
    "_blank"
  );
});

/* Monteur Auswahl */
monteurSelect.addEventListener("change", () => {
  const name = monteurSelect.value;
  if (!name) {
    statusEl.textContent = "Bitte Monteur wählen…";
    reportList.innerHTML = "";
    return;
  }
  loadReports(name);
});

/* Daten laden */
async function loadReports(monteurName) {
  statusEl.textContent = "Berichte werden geladen…";
  reportList.innerHTML = "";

  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();
    const rows = text.split("\n").map(r => r.split(","));

    const header = rows.shift();

    // Spalten-Indizes
    const col = {
      zeit: header.indexOf("Zeitstempel"),
      projekt: header.indexOf("Projekt / Baustelle"),
      datum: header.indexOf("Datum"),
      monteur: header.indexOf("Monteur / Team"),
      woche: header.indexOf("Woche / Zeitraum"),
      einrichtung: header.indexOf("Baustelleneinrichtung (%)"),
      zuleitung: header.indexOf("Zuleitung & Zählerplätze (%)"),
      rohr: header.indexOf("Rohr- und Tragsysteme (%)"),
    };

    const filtered = rows.filter(
      r => r[col.monteur] && r[col.monteur].trim() === monteurName
    );

    statusEl.textContent = `${filtered.length} Meldung(en) gefunden`;

    if (filtered.length === 0) return;

    filtered.reverse().forEach(r => {
      const div = document.createElement("div");
      div.className = "report-item";
      div.innerHTML = `
        <strong>${r[col.projekt]}</strong><br>
        Datum: ${r[col.datum]}<br>
        Woche: ${r[col.woche]}<br>
        <hr>
        Baustelleneinrichtung: ${r[col.einrichtung] || "–"}<br>
        Zuleitung & Zählerplätze: ${r[col.zuleitung] || "–"}<br>
        Rohr- & Tragsysteme: ${r[col.rohr] || "–"}
      `;
      reportList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Fehler beim Laden der Berichte";
  }
}
