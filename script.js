// ====== KONFIG ======
const SHEET_ID = "1dD709i76hdP2VOFGo48oNeOr-YsbAF6ZVBwlQvkY3DM";
const SHEET_NAME = "Formularantworten 1";

// Spaltennummern (A=0, B=1, ...)
const COL_ZEIT = 0;
const COL_PROJEKT = 1;
const COL_KW = 2;
const COL_MONTEUR = 3;

// Prozent-Spalten (anpassen falls nötig)
const PERCENT_COLS = [
  { name: "Rohinstallation", col: 10 },
  { name: "Kabelziehen", col: 11 },
  { name: "Schalter & Steckdosen", col: 12 },
  { name: "Leuchten", col: 13 },
  { name: "Verteiler", col: 14 }
];

// Bilder (Dateiupload – letzte Spalte, AF = 31)
const COL_IMAGES = 31;

// Google Formular
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform";

// ====== BUTTON ======
document.getElementById("openFormBtn").onclick = () => {
  window.open(GOOGLE_FORM_URL, "_blank");
};

// ====== MONTEUR AUSWAHL ======
document.getElementById("monteurSelect").addEventListener("change", loadReports);

// ====== LADEN ======
async function loadReports() {
  const select = document.getElementById("monteurSelect");
  let monteur = select.value;

  if (monteur === "_other") {
    monteur = document.getElementById("otherMonteur").value.trim();
  }

  if (!monteur) return;

  document.getElementById("status").innerText = "Lade Berichte …";
  document.getElementById("reportList").innerHTML = "";

  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(
    SHEET_NAME
  )}`;

  const res = await fetch(url);
  const text = await res.text();
  const json = JSON.parse(text.substring(47, text.length - 2));
  const rows = json.table.rows;

  let count = 0;

  rows.forEach((r) => {
    const cells = r.c;
    if (!cells[COL_MONTEUR] || cells[COL_MONTEUR].v !== monteur) return;

    count++;

    const projekt = cells[COL_PROJEKT]?.v || "";
    const kw = cells[COL_KW]?.v || "";
    const zeit = cells[COL_ZEIT]?.f || "";

    let percentHtml = "";
    PERCENT_COLS.forEach((p) => {
      const val = cells[p.col]?.v;
      if (val !== null && val !== undefined && val !== "")
        percentHtml += `<div><strong>${p.name}:</strong> ${val} %</div>`;
    });

    let imagesHtml = "";
    const imgCell = cells[COL_IMAGES]?.v;
    if (imgCell) {
      imgCell.split(",").forEach((link) => {
        imagesHtml += `<a href="${link.trim()}" target="_blank">📷 Bild öffnen</a><br>`;
      });
    }

    document.getElementById("reportList").innerHTML += `
      <div class="report-card">
        <div><strong>${projekt}</strong></div>
        <div>KW ${kw}</div>
        <div class="small">${zeit}</div>
        <hr>
        ${percentHtml || "<i>Keine Prozentangaben</i>"}
        <hr>
        ${imagesHtml || "<i>Keine Bilder</i>"}
      </div>
    `;
  });

  document.getElementById("status").innerText =
    count === 0 ? "0 Meldungen gefunden" : `${count} Meldungen gefunden`;
}
