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

    // Kopfzeile raus
    rows.shift();

    const filtered = rows.filter(
      r => (r[3] || "").trim().toLowerCase() === monteur.toLowerCase()
    );

    statusEl.textContent = `${filtered.length} Meldung(en) gefunden`;

    filtered.forEach(r => {
      const card = document.createElement("div");
      card.className = "report-card";

      card.innerHTML = `
        <strong>${r[1] || "–"}</strong><br>
        Datum: ${r[2] || "–"}<br>
        Woche: ${r[4] || "–"}<br><br>

        <u>Leistungsfortschritt:</u><br>
        Baustelleneinrichtung: ${r[8] || "–"}<br>
        Zuleitung & Zählerplätze: ${r[9] || "–"}<br>
        Rohr- & Tragsysteme: ${r[10] || "–"}<br>
        Kabel & Leitungen: ${r[11] || "–"}<br>
        Schalt- & Steckgeräte: ${r[12] || "–"}<br>
        PV-Anlage: ${r[13] || "–"}<br>
        Beleuchtung: ${r[14] || "–"}<br>
        Außenbeleuchtung: ${r[15] || "–"}<br>
        Antennenanlage: ${r[16] || "–"}<br>
        Brandrauchmelder: ${r[17] || "–"}<br>
        Dokumentation: ${r[18] || "–"}<br>
        Allgemeinkosten: ${r[19] || "–"}<br>
        NSP Verteilung: ${r[20] || "–"}<br>
        Erdung & Blitzschutz: ${r[21] || "–"}<br>
        Kommunikationsanlagen: ${r[22] || "–"}<br>
        Demontagen & Montagen: ${r[23] || "–"}<br>
        Planung / Inbetriebnahme: ${r[24] || "–"}<br>
        Tiefgarage: ${r[25] || "–"}<br>
        Rohinstallation Decke: ${r[26] || "–"}<br>
        Rohinstallation Wände: ${r[27] || "–"}<br>
        Leuchten: ${r[28] || "–"}<br>
        Kabel einziehen: ${r[29] || "–"}<br>
        Gegensprechanlage: ${r[30] || "–"}
      `;

      reportList.appendChild(card);
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
    .split("\n")
    .map(r => r.split(",").map(c => c.replace(/^"|"$/g, "").trim()));
}
