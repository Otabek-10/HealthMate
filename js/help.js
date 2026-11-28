/* HealthMate — Yordam markazi: savol-javob, qidiruv, forma, nusxalash */
(function () {
  "use strict";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- Toast ---------- */
  var toast = $("#toast");
  var toastTimer;
  function showToast(text) {
    toast.textContent = text;
    toast.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-shown"); }, 2200);
  }

  /* ---------- Savol-javob (accordion) ---------- */
  var items = $$(".faq-item");
  items.forEach(function (item) {
    var btn = $(".faq-q", item);
    btn.addEventListener("click", function () {
      var open = !item.classList.contains("is-open");
      items.forEach(function (i) {
        i.classList.remove("is-open");
        $(".faq-q", i).setAttribute("aria-expanded", "false");
      });
      if (open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Qidiruv ---------- */
  var search = $("#faq-search");
  var empty = $("#faq-empty");
  if (search) {
    search.addEventListener("input", function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var ok = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        item.hidden = !ok;
        if (ok) shown++;
      });
      empty.hidden = shown !== 0;
    });
  }

  /* ---------- Nusxalash ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy");
      function done() { showToast("Nusxalandi: " + text); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else {
        done();
      }
    });
  });

  /* ---------- Xabar yuborish formasi ---------- */
  var form = $("#msg-form");
  var msg = $("#form-msg");
  if (form) {
    // ism avtomatik to'ldiriladi (agar ro'yxatdan o'tgan bo'lsa)
    if (window.HM_USER && window.HM_USER.ism) form.elements.ism.value = window.HM_USER.ism;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var ism = form.elements.ism.value.trim();
      var email = form.elements.email.value.trim();
      var mavzu = form.elements.mavzu.value.trim();
      var xabar = form.elements.xabar.value.trim();

      msg.className = "form-msg";
      if (!ism || !mavzu || !xabar) {
        msg.textContent = "Iltimos, barcha maydonlarni to‘ldiring.";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        msg.textContent = "Elektron pochta manzilini to‘g‘ri kiriting.";
        return;
      }
      // Hozircha server yo'q — xabar faqat brauzerda saqlanadi
      try {
        var list = JSON.parse(localStorage.getItem("healthmate_messages")) || [];
        list.push({ ism: ism, email: email, mavzu: mavzu, xabar: xabar, vaqt: Date.now() });
        localStorage.setItem("healthmate_messages", JSON.stringify(list));
      } catch (err) {}
      msg.textContent = "Rahmat, " + ism + "! Xabaringiz qabul qilindi. Tez orada javob beramiz.";
      msg.className = "form-msg ok";
      form.elements.mavzu.value = "";
      form.elements.xabar.value = "";
      showToast("Xabar yuborildi");
    });
  }
})();