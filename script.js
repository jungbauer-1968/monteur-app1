const SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1dD709i76hdP2VOFGo48oNeOr-YsbAF6ZVBwlQvkY3DM/edit";

async function loadReports(monteurName) {
  const status = document.getElementById("status");
  const list = document.getElementById("reportList");

  list.innerHTML = "";
  status.textContent = "Lade Berichte…";

  try {
    const res = await fetch(
      `https://opensheet.elk.sh/1dD709i76hdP2VOFGo48oNeOr-YsbAF6ZVBwlQvkY3DM/Formularantworten%201`
    );
    const rows = await res.json();

    // nach Monteur filtern
    const filtered = rows.filter(
      (r) =>
        (r["Monteur / Team"] || "")
          .toLowerCase()
          .trim() === monteurName.toLowerCase().trim()
    );

    if (filtered.length === 0) {
      status.textContent = "Keine Meldungen gefunden.";
      return;
    }

    status.textContent = `${filtered.length} Meldung(en) gefunden`;

    filtered.reverse().forEach((r) => {
      const card = document.createElement("div");
      card.className = "report-card";

      card.innerHTML = `
        <strong>${r["Projekt / Baustelle"] || "—"}</strong><br>
        Datum: ${r["Datum"] || "—"}<br>
        Woche: ${r["Woche / Zeitraum"] || "—"}<br><br>

        <u>Fortschritt:</u><br>
        Baustelleneinrichtung: ${r["Baustelleneinrichtung (%)"] || "—"}<br>
        Zuleitung & Zählerplätze: ${r["Zuleitung & Zählerplätze (%)"] || "—"}<br>
        Rohr- & Tragsysteme: ${r["Rohr- und Tragsysteme (%)"] || "—"}<br>
        Kabel & Leitungen: ${r["Kabel & Leitungen (%)"] || "—"}
      `;

      list.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    status.textContent = "Fehler beim Laden der Berichte.";
  }
}

/* MONTEUR-Auswahl */
document.getElementById("monteurSelect").addEventListener("change", () => {
  const select = document.getElementById("monteurSelect");
  const other = document.getElementById("otherMonteurWrapper");

  let name = select.value;

  if (name === "_other") {
    other.classList.remove("hidden");
    document.getElementById("otherMonteur").focus();
    return;
  } else {
    other.classList.add("hidden");
  }

  if (!name) {
    document.getElementById("status").textContent =
      "Bitte Monteur wählen…";
    document.getElementById("reportList").innerHTML = "";
    return;
  }

  loadReports(name);
});

/* Google-Formular öffnen */
document.getElementById("openFormBtn").addEventListener("click", () => {
  window.open(
    "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform",
    "_blank"
  );
});
