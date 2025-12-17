// 🔴 WICHTIG: DAS ist die CSV-URL von "Formularantworten 1"
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/export?format=csv&gid=1954522343";

const monteurSelect = document.getElementById("monteurSelect");
const reportList = document.getElementById("reportList");
const statusEl = document.getElementById("status");
const openFormBtn = document.getElementById("openFormBtn");

// 🔗 Google-Formular öffnen
openFormBtn.addEventListener("click", () => {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform",
    "_blank"
  );
});

// 👤 Monteur Auswahl
monteurSelect.addEventListener("change", loadReports);

async function loadReports() {
  const monteur = getSelectedMonteur();

  reportList.innerHTML = "";
  statusEl.textContent = "Lade Berichte…";

  if (!monteur) {
    statusEl.textContent = "Bitte Monteur wählen…";
    return;
  }

  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();

    const rows = parseCSV(text);
    const header = rows[0];

    // Spalten finden (exakt wie im Sheet)
    const idxProjekt = header.indexOf("Projekt/ Baustelle");
    const idxDatum = header.indexOf("Datum");
    const idxMonteur = header.indexOf("Monteur / Team");
    const idxWoche = header.indexOf("Woche / Zeitraum");

    const matches = rows
      .slice(1)
      .filter(r => r[idxMonteur]?.trim() === monteur);

    statusEl.textContent = `${matches.length} Meldung(en) gefunden`;

    if (matches.length === 0) return;

    matches.reverse().forEach(r => {
      const div = document.createElement("div");
      div.className = "report-item";
      div.innerHTML = `
        <strong>${r[idxProjekt]}</strong><br>
        Datum: ${r[idxDatum]}<br>
        Woche: ${r[idxWoche]}
      `;
      reportList.appendChild(div);
    });

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Fehler beim Laden der Berichte";
  }
}

// 🔧 Helfer
function getSelectedMonteur() {
  if (monteurSelect.value === "_other") {
    return document.getElementById("otherMonteur")?.value?.trim();
  }
  return monteurSelect.value;
}

function parseCSV(text) {
  return text
    .split("\n")
    .map(row =>
      row
        .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
        .map(cell => cell.replace(/^"|"$/g, "").trim())
    );
}
