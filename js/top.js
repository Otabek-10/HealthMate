/* =====================================================
   HealthMate — yuqori panel (topbar)
   - salomlashuv (vaqtga qarab) + ketma-ket kunlar chipi
   - bildirishnomalar paneli (o'qilgan/o'qilmagan, yangi xabar keladi)
   - profil menyusi (statistika, tahrirlash, chiqish)
   Faqat shu fayl kerak: u css/topbar.css ni o'zi ulaydi.
   ===================================================== */
(function () {
  "use strict";

  var bar = document.querySelector(".topbar");
  if (!bar) return;

  /* ---------- CSS ni o'zi ulaydi ---------- */
  var me = document.currentScript;
  if (me && me.src && !document.querySelector('link[href*="topbar.css"]')) {
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = me.src.replace(/js\/[^\/]*$/, "css/top.css");
    document.head.appendChild(link);
  }

  /* ---------- Yordamchilar ---------- */
  var USER_KEY = "healthmate_user";
  var READ_KEY = "healthmate_read";

  var P = {
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    drop: '<path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    sparkle: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 3v4M17 5h4"/>',
    moon: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V8M18 17v-9"/>',
    run: '<circle cx="14" cy="4.5" r="1.8"/><path d="M8 21l3-6-2.5-2.5L10 8l4 2 3 3M11 15l3 2 1 4M10 8 7 11"/>',
    flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2 2 2 0-3-1-5 1-8z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5M21 12H9"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
  };

  function ic(path, size, sw) {
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' +
      (sw || 2) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>"
    );
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function getUser() {
    return window.HM_USER || { ism: "Madina", familya: "Karimova", yosh: 22 };
  }

  function cap(s) {
    s = s.trim();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function getRead() {
    try {
      return JSON.parse(localStorage.getItem(READ_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function setRead(list) {
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  /* ---------- Foydalanuvchi ma'lumotini sahifada yangilash ---------- */
  function applyUser(u) {
    window.HM_USER = u;
    document.querySelectorAll("[data-user-name]").forEach(function (e) {
      e.textContent = u.ism;
    });
    document.querySelectorAll("[data-user-full]").forEach(function (e) {
      e.textContent = u.ism + " " + u.familya;
    });
    document.querySelectorAll("[data-user-initials]").forEach(function (e) {
      e.textContent = (u.ism.charAt(0) + u.familya.charAt(0)).toUpperCase();
    });
    document.querySelectorAll("[data-user-age]").forEach(function (e) {
      e.textContent = u.yosh;
    });
  }

  /* ---------- Eski tugmalarni olib tashlash ---------- */
  var oldBell = bar.querySelector(".icon-btn");
  var oldAvatar = bar.querySelector(".top-avatar");
  if (oldBell) oldBell.remove();
  if (oldAvatar) oldAvatar.remove();

  var user = getUser();

  /* =====================================================
     1) SALOMLASHUV
     ===================================================== */
  var hour = new Date().getHours();
  var hi =
    hour < 5 ? "Xayrli tun" : hour < 12 ? "Xayrli tong" : hour < 18 ? "Xayrli kun" : "Xayrli kech";

  var greet = el("div", "tb-greet");
  var greetHi = el("div", "tb-greet-hi");
  greetHi.appendChild(document.createTextNode(hi + ", "));
  var gName = el("span", "tb-greet-name", user.ism);
  gName.setAttribute("data-user-name", "");
  greetHi.appendChild(gName);
  greetHi.appendChild(document.createTextNode("!"));
  greet.appendChild(greetHi);
  greet.appendChild(el("div", "tb-greet-sub", "Bugun ham sog‘lom kun bo‘lsin"));
  bar.appendChild(greet);

  /* =====================================================
     2) KETMA-KET KUNLAR CHIPI
     ===================================================== */
  var streak = el("div", "tb-streak");
  streak.title = "Ketma-ket 5 kun maqsadga erishdingiz";
  streak.innerHTML = ic(P.flame, 18, 2.2) + "<span><b>5</b> kun</span>";
  bar.appendChild(streak);

  /* =====================================================
     3) BILDIRISHNOMALAR
     ===================================================== */
  function buildItems(u) {
    return [
      { id: "water", c: "blue", i: P.drop, t: u.ism + ", suv ichish vaqti!", d: "Oxirgi 2 soatda suv ichmadingiz. Bir stakan suv iching.", w: "5 daqiqa oldin", href: "tracker.html" },
      { id: "goal", c: "green", i: P.check, t: "Maqsad bajarildi", d: "Bugungi 6 000 qadam maqsadiga erishdingiz. Barakalla!", w: "1 soat oldin", href: "tracker.html" },
      { id: "ai", c: "purple", i: P.sparkle, t: "Yangi AI tavsiyasi", d: "Kechki ovqatga oqsilli taom qo‘shsangiz, kunlik me’yorga yetasiz.", w: "2 soat oldin", href: "nutrition.html" },
      { id: "sleep", c: "purple", i: P.moon, t: "Uyqu eslatmasi", d: "23:00 gacha uxlashga tayyorlaning.", w: "3 soat oldin", href: "tracker.html", r: true },
      { id: "report", c: "orange", i: P.chart, t: "Haftalik hisobot tayyor", d: "Salomatlik ko‘rsatkichingiz 6 ballga oshdi.", w: "Kecha", href: "reports.html", r: true },
    ];
  }

  var items = buildItems(user);
  var readIds = getRead();

  function isUnread(n) {
    return !n.r && readIds.indexOf(n.id) === -1;
  }

  var bellWrap = el("div", "tb-wrap");
  var bellBtn = el("button", "tb-btn");
  bellBtn.type = "button";
  bellBtn.setAttribute("aria-label", "Bildirishnomalar");
  bellBtn.setAttribute("aria-haspopup", "true");
  bellBtn.setAttribute("aria-expanded", "false");
  bellBtn.innerHTML = ic(P.bell, 20);
  var badge = el("span", "tb-badge", "0");
  bellBtn.appendChild(badge);

  var bellPop = el("div", "tb-pop tb-notifs");
  var nHead = el("div", "tb-pop-head");
  var nTitleBox = el("div");
  nTitleBox.appendChild(el("div", "tb-pop-title", "Bildirishnomalar"));
  var nSub = el("div", "tb-pop-sub", "");
  nTitleBox.appendChild(nSub);
  var markAll = el("button", "tb-link", "Hammasini o‘qilgan qilish");
  markAll.type = "button";
  nHead.appendChild(nTitleBox);
  nHead.appendChild(markAll);
  var nList = el("div", "tb-nlist");
  bellPop.appendChild(nHead);
  bellPop.appendChild(nList);

  bellWrap.appendChild(bellBtn);
  bellWrap.appendChild(bellPop);

  function unreadCount() {
    return items.filter(isUnread).length;
  }

  function renderNotifs() {
    var count = unreadCount();
    badge.textContent = count > 9 ? "9+" : String(count);
    badge.hidden = count === 0;
    nSub.textContent = count ? count + " ta yangi xabar" : "Hammasi o‘qilgan";
    markAll.disabled = count === 0;

    nList.innerHTML = "";
    if (!items.length) {
      var empty = el("div", "tb-empty");
      empty.innerHTML = ic(P.check, 28);
      empty.appendChild(el("p", null, "Yangi bildirishnoma yo‘q"));
      nList.appendChild(empty);
      return;
    }

    items.forEach(function (n) {
      var b = el("button", "tb-nitem" + (isUnread(n) ? " is-unread" : ""));
      b.type = "button";
      var icon = el("span", "tb-nic tb-nic-" + n.c);
      icon.innerHTML = ic(n.i, 18);
      var body = el("span", "tb-nbody");
      body.appendChild(el("span", "tb-ntitle", n.t));
      body.appendChild(el("span", "tb-ntext", n.d));
      body.appendChild(el("span", "tb-ntime", n.w));
      b.appendChild(icon);
      b.appendChild(body);
      b.appendChild(el("span", "tb-ndot"));
      b.addEventListener("click", function () {
        if (isUnread(n)) {
          readIds.push(n.id);
          setRead(readIds);
          renderNotifs();
        }
        if (n.href) {
          window.location.href = n.href;
        }
      });
      nList.appendChild(b);
    });
  }

  markAll.addEventListener("click", function () {
    items.forEach(function (n) {
      if (isUnread(n)) readIds.push(n.id);
    });
    setRead(readIds);
    renderNotifs();
  });

  /* =====================================================
     4) PROFIL MENYUSI
     ===================================================== */
  var pfWrap = el("div", "tb-wrap");
  var pfBtn = el("button", "tb-avatar");
  pfBtn.type = "button";
  pfBtn.setAttribute("aria-label", "Profil menyusi");
  pfBtn.setAttribute("aria-haspopup", "true");
  pfBtn.setAttribute("aria-expanded", "false");
  var pfInit = el("span", "tb-avatar-text", (user.ism.charAt(0) + user.familya.charAt(0)).toUpperCase());
  pfInit.setAttribute("data-user-initials", "");
  pfBtn.appendChild(pfInit);
  pfBtn.appendChild(el("span", "tb-online"));

  var pfPop = el("div", "tb-pop tb-profile");
  pfPop.innerHTML =
    '<div class="tb-pf-head">' +
    '<span class="tb-pf-avatar" data-user-initials></span>' +
    "<div>" +
    '<div class="tb-pf-name" data-user-full></div>' +
    '<div class="tb-pf-sub"><span data-user-age></span> yosh · Shaxsiy reja</div>' +
    "</div></div>" +
    '<div class="tb-pf-stats">' +
    '<div><b>86</b><span>Ball</span></div>' +
    '<div><b>5 kun</b><span>Seriya</span></div>' +
    '<div><b>82%</b><span>Maqsad</span></div>' +
    "</div>" +
    '<div class="tb-menu">' +
    '<a class="tb-mi" href="dashboard.html">' + ic(P.grid, 18) + "Shaxsiy kabinet</a>" +
    '<a class="tb-mi" href="ai.html">' + ic(P.sparkle, 18) + "AI yordamchi</a>" +
    '<button class="tb-mi" type="button" data-pf-edit>' + ic(P.edit, 18) + "Profilni tahrirlash</button>" +
    '<button class="tb-mi tb-mi-danger" type="button" data-pf-logout>' + ic(P.out, 18) + "Chiqish</button>" +
    "</div>";

  pfWrap.appendChild(pfBtn);
  pfWrap.appendChild(pfPop);

  bar.appendChild(bellWrap);
  bar.appendChild(pfWrap);

  applyUser(user);
  renderNotifs();

  /* =====================================================
     5) OCHISH / YOPISH
     ===================================================== */
  var pops = [
    { btn: bellBtn, pop: bellPop },
    { btn: pfBtn, pop: pfPop },
  ];

  function closeAll(except) {
    pops.forEach(function (p) {
      if (p === except) return;
      p.pop.classList.remove("is-open");
      p.btn.setAttribute("aria-expanded", "false");
    });
  }

  pops.forEach(function (p) {
    p.btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !p.pop.classList.contains("is-open");
      closeAll(p);
      p.pop.classList.toggle("is-open", open);
      p.btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) p.btn.classList.remove("is-ringing");
    });
    p.pop.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });

  document.addEventListener("click", function () {
    closeAll(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeAll(null);
      closeEdit();
    }
  });

  /* =====================================================
     6) PROFILNI TAHRIRLASH OYNASI
     ===================================================== */
  var modal = el("div", "tb-modal");
  modal.hidden = true;
  modal.innerHTML =
    '<div class="tb-modal-box" role="dialog" aria-modal="true" aria-labelledby="tb-edit-title">' +
    '<h2 id="tb-edit-title">Profilni tahrirlash</h2>' +
    "<p>Ismingiz butun ilova bo‘ylab yangilanadi.</p>" +
    '<form novalidate>' +
    '<label>Ism<input type="text" name="ism" required /></label>' +
    '<label>Familya<input type="text" name="familya" required /></label>' +
    '<label>Yosh<input type="number" name="yosh" min="1" max="120" required /></label>' +
    '<p class="tb-form-error" role="alert"></p>' +
    '<div class="tb-form-actions">' +
    '<button type="button" class="tb-cancel">Bekor qilish</button>' +
    '<button type="submit" class="tb-save">Saqlash</button>' +
    "</div></form></div>";
  document.body.appendChild(modal);

  var form = modal.querySelector("form");
  var formErr = modal.querySelector(".tb-form-error");

  function openEdit() {
    var u = getUser();
    form.elements.ism.value = u.ism;
    form.elements.familya.value = u.familya;
    form.elements.yosh.value = u.yosh;
    formErr.textContent = "";
    closeAll(null);
    modal.hidden = false;
    form.elements.ism.focus();
  }

  function closeEdit() {
    modal.hidden = true;
  }

  pfPop.querySelector("[data-pf-edit]").addEventListener("click", openEdit);
  modal.querySelector(".tb-cancel").addEventListener("click", closeEdit);
  modal.addEventListener("click", function (e) {
    if (e.target === modal) closeEdit();
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ism = form.elements.ism.value.trim();
    var familya = form.elements.familya.value.trim();
    var yosh = parseInt(form.elements.yosh.value, 10);
    if (!ism || !familya || !(yosh >= 1 && yosh <= 120)) {
      formErr.textContent = "Iltimos, ism, familya va yoshni to‘g‘ri kiriting.";
      return;
    }
    var data = { ism: cap(ism), familya: cap(familya), yosh: yosh };
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(data));
    } catch (err) {}
    applyUser(data);
    items = buildItems(data);
    renderNotifs();
    closeEdit();
  });

  /* ---------- Chiqish ---------- */
  pfPop.querySelector("[data-pf-logout]").addEventListener("click", function () {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(READ_KEY);
    } catch (err) {}
    window.location.href = "../index.html";
  });

  /* =====================================================
     7) 10 soniyadan keyin yangi bildirishnoma keladi
     ===================================================== */
  setTimeout(function () {
    if (readIds.indexOf("live") !== -1) return;
    items.unshift({
      id: "live",
      c: "orange",
      i: P.run,
      t: "Harakat vaqti!",
      d: "Bir joyda uzoq o‘tirdingiz. 5 daqiqa yurib oling.",
      w: "hozirgina",
      href: "tracker.html",
    });
    renderNotifs();
    bellBtn.classList.add("is-ringing");
    badge.classList.add("is-pop");
    setTimeout(function () {
      badge.classList.remove("is-pop");
    }, 600);
  }, 10000);

  // sahifa ochilganda o'qilmagan bo'lsa, qo'ng'iroqcha bir silkinadi
  if (unreadCount() > 0) {
    setTimeout(function () {
      bellBtn.classList.add("is-ringing");
    }, 700);
  }
})();