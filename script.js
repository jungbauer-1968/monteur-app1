// URL deines Google-Sheets als CSV (0 = erstes Tabellenblatt)
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1dD709i76hdP2VOFGo48oNeOr-YsbAF6ZVBwlQvkY3DM/export?format=csv&gid=0";

// Link zum Google-Formular
const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform";

// Wie heißen die Spalten im Sheet?
// -> Diese Texte müssen mit der ERSTEN ZEILE in deinem Google-Sheet übereinstimmen.
const COLS = {
  timestamp: "Zeitstempel",
  monteur: "Monteur",                    // z.B. "Monteur" oder "Monteur / Team"
  baustelle: "Baustelle",               // z.B. "Projekt / Baustelle"
  zeitraum: "Woche / Zeitraum",
  details: "Beschreibung / Details",
  regie: "Regieaufwand / Materialbedarf",
  probleme: "Probleme / Verzögerungen",
  koordination: "Koordination mit anderen Gewerken"
};

const monteurSelect = document.getElementById("monteurSelect");
const otherMonteurWrapper = document.getElementById("otherMonteurWrapper");
const otherMonteurInput = document.getElementById("otherMonteur");
const statusEl = document.getElementById("status");
const reportListEl = document.getElementById("reportList");
const openFormBtn = document.getElementById("openFormBtn");

// Google-Formular öffnen
openFormBtn.addEventListener("click", () => {
  window.open(FORM_URL, "_blank");
});

// Monteur-Auswahl
monteurSelect.addEventListener("change", () => {
  const value = monteurSelect.value;
  if (value === "_other") {
    otherMonteurWrapper.classList.remove("hidden");
    otherMonteurInput.focus();
  } else {
    otherMonteurWrapper.classList.add("hidden");
    loadReports();
  }
});

otherMonteurInput.addEventListener("blur", () => {
  if (monteurSelect.value === "_other") {
    loadReports();
  }
});

// CSV laden und filtern
async function loadReports() {
  let monteurName = "";

  if (monteurSelect.value === "") {
    statusEl.textContent = "Bitte Monteur wählen…";
    reportListEl.innerHTML = "";
    return;
  }

  if (monteurSelect.value === "_other") {
    monteurName = (otherMonteurInput.value || "").trim();
    if (!monteurName) {
      statusEl.textContent = "Bitte eigenen Namen eingeben…";
      reportListEl.innerHTML = "";
      return;
    }
  } else {
    monteurName = monteurSelect.value;
  }

  statusEl.textContent = "Lade Daten…";
  reportListEl.innerHTML = "";

  try {
    const resp = await fetch(SHEET_CSV_URL);
    if (!resp.ok) {
      statusEl.textContent = "Konnte Daten nicht laden (Freigabe prüfen).";
      return;
    }
    const csvText = await resp.text();
    const rows = parseCSV(csvText);
    if (rows.length === 0) {
      statusEl.textContent = "Noch keine Einträge vorhanden.";
      return;
    }

    const header = rows[0];
    const dataRows = rows.slice(1);

    const idx = {
      timestamp: header.indexOf(COLS.timestamp),
      monteur: header.indexOf(COLS.monteur),
      baustelle: header.indexOf(COLS.baustelle),
      zeitraum: header.indexOf(COLS.zeitraum),
      details: header.indexOf(COLS.details),
      regie: header.indexOf(COLS.regie),
      probleme: header.indexOf(COLS.probleme),
      koordination: header.indexOf(COLS.koordination)
    };

    // einfache Prüfung
    if (idx.monteur === -1 || idx.baustelle === -1) {
      statusEl.textContent = "Spaltennamen im Sheet stimmen nicht mit dem Script überein.";
      return;
    }

    // filtern auf Monteur
    const filtered = dataRows
      .map(cells => {
        return {
          timestamp: cells[idx.timestamp] || "",
          monteur: cells[idx.monteur] || "",
          baustelle: cells[idx.baustelle] || "",
          zeitraum: idx.zeitraum >= 0 ? (cells[idx.zeitraum] || "") : "",
          details: idx.details >= 0 ? (cells[idx.details] || "") : "",
          regie: idx.regie >= 0 ? (cells[idx.regie] || "") : "",
          probleme: idx.probleme >= 0 ? (cells[idx.probleme] || "") : "",
          koordination: idx.koordination >= 0 ? (cells[idx.koordination] || "") : ""
        };
      })
      .filter(r => {
        // einfache, nicht-case-sensitive Prüfung
        return r.monteur.toLowerCase().includes(monteurName.toLowerCase());
      });

    if (filtered.length === 0) {
      statusEl.textContent = "Keine Meldungen für diesen Monteur gefunden.";
      reportListEl.innerHTML = "";
      return;
    }

    // Sortieren (neueste zuerst): wir nehmen hier einfach die Reihenfolge im Sheet umgekehrt
    filtered.reverse();

    statusEl.textContent = `Gefundene Meldungen für "${monteurName}": ${filtered.length} Stück`;

    // Anzeigen
    renderReports(filtered);

  } catch (err) {
    console.error(err);
    statusEl.textContent = "Fehler beim Laden der Daten.";
  }
}

// Einfache CSV-Parser-Funktion
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== "");
  return lines.map(line => {
    // sehr einfacher Parser, reicht, solange du keine Kommas IN Antworten hast
    return line.split(",").map(cell => cell.replace(/^"|"$/g, ""));
  });
}

function renderReports(reports) {
  reportListEl.innerHTML = "";

  reports.forEach(r => {
    const card = document.createElement("div");
    card.className = "report-card";

    const header = document.createElement("div");
    header.className = "report-header";

    const b = document.createElement("div");
    b.className = "baustelle";
    b.textContent = r.baustelle || "(ohne Baustellenname)";

    const d = document.createElement("div");
    d.className = "datum";
    d.textContent = r.timestamp || r.datum || "";

    header.appendChild(b);
    header.appendChild(d);

    const meta = document.createElement("div");
    meta.className = "report-meta";
    meta.textContent = r.zeitraum ? `Zeitraum: ${r.zeitraum}` : "";

    const text = document.createElement("div");
    text.className = "report-text";

    const parts = [];
    if (r.details) parts.push(`Details: ${r.details}`);
    if (r.regie) parts.push(`Regie: ${r.regie}`);
    if (r.probleme) parts.push(`Probleme: ${r.probleme}`);
    if (r.koordination) parts.push(`Koordination: ${r.koordination}`);

    text.textContent = parts.join(" | ");

    card.appendChild(header);
    if (meta.textContent) card.appendChild(meta);
    if (text.textContent) card.appendChild(text);

    reportListEl.appendChild(card);
  });
}
