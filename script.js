const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/gviz/tq?tqx=out:json";

async function loadReports(monteurName) {
  const status = document.getElementById("status");
  const list = document.getElementById("reportList");

  status.textContent = "Lade Berichte …";
  list.innerHTML = "";

  try {
    const res = await fetch(SHEET_URL);
    const text = await res.text();

    const json = JSON.parse(text.substring(47).slice(0, -2));
    const cols = json.table.cols.map(c => c.label);
    const rows = json.table.rows;

    // Spaltenindex per Name finden
    const idx = name => cols.indexOf(name);

    const iProjekt = idx("Projekt / Baustelle");
    const iDatum = idx("Datum");
    const iMonteur = idx("Monteur / Team");
    const iWoche = idx("Woche / Zeitraum");

    // Prozent-Spalten
    const percentCols = cols
      .map((c, i) => c.includes("(%)") ? { name: c, index: i } : null)
      .filter(Boolean);

    const myRows = rows.filter(r =>
      r.c[iMonteur] &&
      r.c[iMonteur].v.toLowerCase() === monteurName.toLowerCase()
    );

    status.textContent = `${myRows.length} Meldung(en) gefunden`;

    if (myRows.length === 0) return;

    myRows.reverse().forEach(r => {
      const card = document.createElement("div");
      card.className = "report-card";

      let html = `
        <strong>${r.c[iProjekt]?.v || "–"}</strong><br>
        Datum: ${r.c[iDatum]?.v || "–"}<br>
        Woche: ${r.c[iWoche]?.v || "–"}<br><br>
        <u>Leistungsstand:</u><br>
      `;

      percentCols.forEach(p => {
        const val = r.c[p.index]?.v;
        if (val !== null && val !== undefined && val !== "")
          html += `${p.name}: <b>${val}</b><br>`;
      });

      card.innerHTML = html;
      list.appendChild(card);
    });

  } catch (err) {
    console.error(err);
    status.textContent = "❌ Fehler beim Laden der Berichte";
  }
}

// Monteur-Auswahl
document.getElementById("monteurSelect").addEventListener("change", () => {
  const sel = document.getElementById("monteurSelect").value;
  if (sel) loadReports(sel);
});

// Google Formular Button
document.getElementById("openFormBtn").onclick = () => {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform",
    "_blank"
  );
};
