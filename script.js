// 🔗 Google-Formular-URL
const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSecipezzn5hUo3X_0378a5JCM0eV-a278T_caoqbbkTKphjJg/viewform";

// Button: Google Formular öffnen
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("openFormBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      window.open(GOOGLE_FORM_URL, "_blank");
    });
  }
});
