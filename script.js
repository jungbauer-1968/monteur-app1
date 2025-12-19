const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/export?format=csv&gid=1954522343";

// 🔗 DEIN GOOGLE FORMULAR
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform";

const monteurSelect = document.getElementById("monteurSelect");
const reportList = document.getElementById("reportList");
const statusEl = document.getElementById("status");
const openFormBtn = document.getElementById("openFormBtn");

openFormBtn.addEventListener("click", () => {
  window.open(GOOGLE_FORM_URL, "_blank");
});

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

    rows.shift(); // Kopfzeile weg

    const filtered = rows.filter(
      r => (r[3] || "").trim().toLowerCase() === monteur.toLowerCase()
    );

    statusEl.textContent = `${filtered.length} Meldung(en) gefunden`;

    filtered.forEach(r => {
      const card = document.createElement("div");
      card.className = "report-card";

      const bildLink = r[31]; // 🔴 HIER: Spalte mit Bild-Link (anpassen falls nötig)

      card.innerHTML = `
        <strong>${r[1] || "–"}</strong><br>
        Datum: ${r[2] || "–"}<br>
        Kalenderwoche: ${r[4] || "–"}<br><br>

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
        Kommunikation: ${r[22] || "–"}<br>
        Demontagen: ${r[23] || "–"}<br>
        Planung / IB: ${r[24] || "–"}<br>
        Tiefgarage: ${r[25] || "–"}<br>
        Rohinstallation Decke: ${r[26] || "–"}<br>
        Rohinstallation Wände: ${r[27] || "–"}<br>
        Leuchten: ${r[28] || "–"}<br>
        Kabel einziehen: ${r[29] || "–"}<br>
        Gegensprechanlage: ${r[30] || "–"}<br><br>

        ${
          bildLink
            ? `<a href="${bildLink}" target="_blank">📷 Bilder ansehen</a>`
            : `<em>Keine Bilder</em>`
        }
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
