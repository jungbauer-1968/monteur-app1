// 🔗 HIER DEIN GOOGLE FORM LINK
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform";

// 📄 CSV-Export des Antwort-Sheets (Formularantworten 1)
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1ayC-9NWv1k4jFUtnxDQ5P8tenYfVsI5IOIp6lffPP0w/export?format=csv&gid=1954522343";

const monteurSelect = document.getElementById("monteurSelect");
const reportList = document.getElementById("reportList");
const status = document.getElementById("status");
const openFormBtn = document.getElementById("openFormBtn");

// 🔴 BUTTON: Google Formular öffnen
openFormBtn.addEventListener("click", () => {
  window.open(GOOGLE_FORM_URL, "_blank");
});

// 🔄 Reaktion auf Monteur-Auswahl
monteurSelect.addEventListener("change", () => {
  const name =
    monteurSelect.value === "_other"
      ? document.getElementById("otherMonteur").value.trim()
      : monteurSelect.value;

  if (!name) {
    status.textContent = "Bitte Monteur wählen…";
    reportList.innerHTML = "";
    return;
  }

  loadReports(name);
});

// 📥 Reports laden
async function loadReports(monteurName) {
  status.textContent = "Lade Meldungen…";
  reportList.innerHTML = "";

  try {
    const res = await fetch(SHEET_CSV_URL);
    const text = await res.text();
    const rows = parseCSV(text);

    const header = rows[0];
    const data = rows.slice(1);

    const monteurIndex = header.indexOf("Monteur / Team");
    const projektIndex = header.indexOf("Projekt / Baustelle");
    const datumIndex = header.indexOf("Datum");
    const wocheIndex = header.indexOf("Woche / Zeitraum");

    const prozentColumns = header
      .map((h, i) => ({ h, i }))
      .filter(col => col.h.includes("(%)"));

    const gefiltert = data.filter(
      r => r[monteurIndex]?.trim() === monteurName
    );

    status.textContent = `${gefiltert.length} Meldung(en) gefunden`;

    if (gefiltert.length === 0) {
      reportList.innerHTML = "<em>Keine Meldungen gefunden.</em>";
      return;
    }

    gefiltert.reverse().forEach(row => {
      const div = document.createElement("div");
      div.className = "report-item";

      let html = `
        <strong>${row[projektIndex]}</strong><br>
        Datum: ${row[datumIndex]}<br>
        Woche: ${row[wocheIndex]}<br>
      `;

      // 📊 Prozentanzeige
      html += "<br><strong>Leistungsfortschritt:</strong><br>";
      prozentColumns.forEach(col => {
        const val = row[col.i];
        if (val) {
          html += `${col.h.replace("(%)", "")}: ${val}<br>`;
        }
      });

      div.innerHTML = html;
      reportList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    status.textContent = "Fehler beim Laden der Berichte";
  }
}

// 📑 CSV Parser (stabil)
function parseCSV(text) {
  const rows = [];
  let row = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && next === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
    } else if (char === "\n" && !inQuotes) {
      row.push(current);
      rows.push(row);
      row = [];
      current = "";
    } else {
      current += char;
    }
  }
  row.push(current);
  rows.push(row);
  return rows;
}
