// === KONFIGURATION ===
// WICHTIG: Das ist die ÖFFENTLICHE Google-Sheet-CSV-URL (Formularantworten)
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/export?format=csv&gid=1954522343";

// Google-Formular-Link
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform";

// === DOM ===
const monteurSelect = document.getElementById("monteurSelect");
const reportList = document.getElementById("reportList");
const statusDiv = document.getElementById("status");
const openFormBtn = document.getElementById("openFormBtn");

// === BUTTON: Formular öffnen ===
openFormBtn.addEventListener("click", () => {
  window.open(FORM_URL, "_blank");
});

// === MONTEUR AUSGEWÄHLT ===
monteurSelect.addEventListener("change", () => {
  const monteur = monteurSelect.value.trim();
  reportList.innerHTML = "";

  if (!monteur) {
    statusDiv.textContent = "Bitte Monteur wählen…";
    return;
  }

  statusDiv.textContent = "Lade Berichte…";
  loadReports(monteur);
});

// === CSV LADEN + FILTERN ===
async function loadReports(monteur) {
  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();

    const rows = parseCSV(text);
    const header = rows[0];

    const monteurIndex = header.indexOf("Monteur / Team");
    const projektIndex = header.indexOf("Projekt / Baustelle");
    const datumIndex = header.indexOf("Datum");
    const wocheIndex = header.indexOf("Woche / Zeitraum");

    const dataRows = rows.slice(1).filter(
      (r) => r[monteurIndex]?.trim() === monteur
    );

    if (dataRows.length === 0) {
      statusDiv.textContent = "Keine Meldungen gefunden.";
      return;
    }

    statusDiv.textContent = `${dataRows.length} Meldung(en) gefunden`;

    dataRows
      .reverse() // neueste oben
      .forEach((r) => {
        const card = document.createElement("div");
        card.className = "report-card";

        card.innerHTML = `
          <strong>${r[projektIndex]}</strong><br>
          Datum: ${r[datumIndex]}<br>
          Woche: ${r[wocheIndex]}
        `;

        reportList.appendChild(card);
      });
  } catch (err) {
    console.error(err);
    statusDiv.textContent = "Fehler beim Laden der Daten.";
  }
}

// === CSV PARSER (einfach & stabil) ===
function parseCSV(text) {
  return text
    .split("\n")
    .map((row) =>
      row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map((c) => c.replace(/^"|"$/g, "").trim())
    );
}
