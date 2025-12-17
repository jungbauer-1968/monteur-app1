const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/export?format=csv&gid=1954522343";

const monteurSelect = document.getElementById("monteurSelect");
const reportList = document.getElementById("reportList");
const statusEl = document.getElementById("status");

monteurSelect.addEventListener("change", loadReports);

async function loadReports() {
  const monteur = getSelectedMonteur();
  reportList.innerHTML = "";

  if (!monteur) {
    statusEl.textContent = "Bitte Monteur wählen…";
    return;
  }

  statusEl.textContent = "Lade Berichte…";

  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();
    const rows = parseCSV(text);

    const header = rows[0];
    const data = rows.slice(1);

    const idxProjekt = header.indexOf("Projekt / Baustelle");
    const idxDatum = header.indexOf("Datum");
    const idxMonteur = header.indexOf("Monteur / Team");
    const idxWoche = header.indexOf("Woche / Zeitraum");

    const meine = data.filter(r => r[idxMonteur] === monteur);

    statusEl.textContent = `${meine.length} Meldung(en) gefunden`;

    if (meine.length === 0) return;

    meine.reverse().forEach(r => {
      const div = document.createElement("div");
      div.className = "report-item";
      div.innerHTML = `
        <strong>${r[idxProjekt]}</strong><br>
        Datum: ${r[idxDatum]}<br>
        Woche: ${r[idxWoche]}
      `;
      reportList.appendChild(div);
    });

  } catch (e) {
    console.error(e);
    statusEl.textContent = "Fehler beim Laden der Berichte";
  }
}

function getSelectedMonteur() {
  if (monteurSelect.value === "_other") {
    return document.getElementById("otherMonteur").value.trim();
  }
  return monteurSelect.value;
}

function parseCSV(text) {
  return text
    .trim()
    .split("\n")
    .map(r => r.split(",").map(v => v.replace(/^"|"$/g, "")));
}
