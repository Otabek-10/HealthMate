/* =====================================================
   HealthMate — foydalanuvchi profili (ism, familya, yosh)
   - index.html ochilgach 3 soniyadan keyin modal chiqadi
   - ma'lumot brauzerda (localStorage) saqlanadi
   - sahifalarda data-user-* belgili joylar avtomatik almashadi
   ===================================================== */
(function () {
  "use strict";

  var KEY = "healthmate_user";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function save(user) {
    try {
      localStorage.setItem(KEY, JSON.stringify(user));
    } catch (e) {}
  }

  // Ismni chiroyli yozish: "madina" -> "Madina"
  function cap(s) {
    s = s.trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Sahifadagi hamma joyni yangilash
  function apply(user) {
    window.HM_USER = user;

    document.querySelectorAll("[data-user-name]").forEach(function (el) {
      el.textContent = user.ism;
    });
    document.querySelectorAll("[data-user-full]").forEach(function (el) {
      el.textContent = user.ism + " " + user.familya;
    });
    document.querySelectorAll("[data-user-initials]").forEach(function (el) {
      el.textContent = (user.ism.charAt(0) + user.familya.charAt(0)).toUpperCase();
    });
  }

  var user = load();
  window.HM_USER = user;
  if (user) apply(user);

  /* ---------- Modal (faqat index.html'da) ---------- */
  var modal = document.getElementById("user-modal");
  if (!modal || user) return;

  var form = modal.querySelector("form");
  var error = modal.querySelector(".modal-error");

  function openModal() {
    modal.hidden = false;
    var first = form.querySelector("input");
    if (first) first.focus();
  }

  function closeModal() {
    modal.hidden = true;
  }

  // 3 soniyadan keyin oching
  setTimeout(openModal, 3000);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var ism = form.elements.ism.value.trim();
    var familya = form.elements.familya.value.trim();
    var yosh = parseInt(form.elements.yosh.value, 10);

    if (!ism || !familya || !(yosh >= 1 && yosh <= 120)) {
      error.textContent = "Iltimos, ism, familya va yoshni to‘g‘ri kiriting.";
      return;
    }

    var data = { ism: cap(ism), familya: cap(familya), yosh: yosh };
    save(data);
    apply(data);
    closeModal();
  });
})();