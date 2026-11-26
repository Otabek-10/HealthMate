/* =====================================================
   HealthMate — ilova sahifalari skripti (vanilla JS)
   ===================================================== */
(function () {
  "use strict";

  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------- Mobil menyu ---------- */
  var app = $(".app");
  var menuBtn = $(".menu-btn");
  var overlay = $(".overlay");
  if (menuBtn && app) {
    menuBtn.addEventListener("click", function () {
      app.classList.toggle("nav-open");
    });
  }
  if (overlay && app) {
    overlay.addEventListener("click", function () {
      app.classList.remove("nav-open");
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && app) app.classList.remove("nav-open");
  });

  /* ---------- Bugungi sana (o'zbekcha) ---------- */
  var MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];
  var DAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
  var today = new Date();
  $$("[data-today]").forEach(function (el) {
    el.textContent = today.getDate() + "-" + MONTHS[today.getMonth()] + ", " + DAYS[today.getDay()];
  });

  /* ---------- Aylana (ring) ---------- */
  function drawRing(el) {
    var pct = parseFloat(el.getAttribute("data-ring")) || 0;

    // SVG HTML ichida tayyor bo'lsa — shuni ishlatamiz (animatsiya uchun)
    var ready = el.querySelector("svg .bar");
    if (ready) {
      el._bar = ready;
      el._c = 2 * Math.PI * parseFloat(ready.getAttribute("r"));
      ready.setAttribute("stroke-dashoffset", el._c);
      setRing(el, pct);
      return;
    }
    var size = parseFloat(el.getAttribute("data-size")) || 80;
    var stroke = parseFloat(el.getAttribute("data-stroke")) || 8;
    var color = el.getAttribute("data-color");
    var r = (size - stroke) / 2;
    var c = 2 * Math.PI * r;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("aria-hidden", "true");

    var track = document.createElementNS(ns, "circle");
    track.setAttribute("class", "track");
    var bar = document.createElementNS(ns, "circle");
    bar.setAttribute("class", "bar");
    [track, bar].forEach(function (c2) {
      c2.setAttribute("cx", size / 2);
      c2.setAttribute("cy", size / 2);
      c2.setAttribute("r", r);
      c2.setAttribute("stroke-width", stroke);
    });
    bar.setAttribute("stroke-dasharray", c);
    bar.setAttribute("stroke-dashoffset", c);
    if (color) bar.style.stroke = color;
    svg.appendChild(track);
    svg.appendChild(bar);
    el.insertBefore(svg, el.firstChild);
    el._bar = bar;
    el._c = c;
    setRing(el, pct);
  }

  function setRing(el, pct) {
    pct = Math.max(0, Math.min(100, pct));
    el.setAttribute("data-ring", pct);
    // keyingi kadrda — animatsiya ishlashi uchun
    requestAnimationFrame(function () {
      el._bar.setAttribute("stroke-dashoffset", el._c * (1 - pct / 100));
    });
  }

  $$("[data-ring]").forEach(drawRing);

  /* ---------- Silliq chiziqli grafik ---------- */
  function smoothPath(pts) {
    var d = "M" + pts[0][0] + "," + pts[0][1];
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2] || p2;
      var t = 0.18;
      var c1x = p1[0] + (p2[0] - p0[0]) * t;
      var c1y = p1[1] + (p2[1] - p0[1]) * t;
      var c2x = p2[0] - (p3[0] - p1[0]) * t;
      var c2y = p2[1] - (p3[1] - p1[1]) * t;
      d += " C" + c1x + "," + c1y + " " + c2x + "," + c2y + " " + p2[0] + "," + p2[1];
    }
    return d;
  }

  $$("[data-line]").forEach(function (box) {
    var vals = box.getAttribute("data-line").split(",").map(Number);
    var color = box.getAttribute("data-color") || "#2563eb";
    var W = 600;
    var H = parseFloat(box.getAttribute("data-h")) || 160;
    var pad = 12;
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    var span = max - min || 1;
    var pts = vals.map(function (v, i) {
      return [
        (i / (vals.length - 1)) * W,
        pad + (1 - (v - min) / span) * (H - pad * 2),
      ];
    });
    var line = smoothPath(pts);
    var area = line + " L" + W + "," + H + " L0," + H + " Z";
    var id = "g" + Math.random().toString(36).slice(2, 8);
    box.innerHTML =
      '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img" aria-label="Grafik">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.22"/>' +
      '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/>' +
      "</linearGradient></defs>" +
      '<path d="' + area + '" fill="url(#' + id + ')"/>' +
      '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      "</svg>";
  });

  /* ---------- Checklist ---------- */
  function updateChecks(list) {
    var items = $$(".check", list);
    var done = items.filter(function (i) {
      return i.classList.contains("done");
    }).length;
    var scope = list.closest(".card") || document;
    var counter = $("[data-check-count]", scope);
    if (counter) {
      counter.textContent = done + " / " + items.length + " bajarildi";
    }
    var pct = Math.round((done / items.length) * 100);
    var pctEl = $("[data-check-pct]", scope);
    if (pctEl) pctEl.textContent = pct + "%";
    var bar = $("[data-check-bar]", scope);
    if (bar) bar.style.setProperty("--p", pct + "%");
  }

  $$(".checks").forEach(function (list) {
    $$(".check", list).forEach(function (item) {
      item.setAttribute("role", "checkbox");
      item.setAttribute("tabindex", "0");
      item.setAttribute(
        "aria-checked",
        item.classList.contains("done") ? "true" : "false"
      );
      function toggle() {
        item.classList.toggle("done");
        var isDone = item.classList.contains("done");
        item.setAttribute("aria-checked", isDone ? "true" : "false");
        var note = $("small", item);
        if (note) note.textContent = isDone ? "Bajarildi" : "Kutilmoqda";
        updateChecks(list);
      }
      item.addEventListener("click", toggle);
      item.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          toggle();
        }
      });
    });
    updateChecks(list);
  });

  /* ---------- Suv nazorati ---------- */
  var water = $("[data-water]");
  if (water) {
    var total = parseInt(water.getAttribute("data-total"), 10) || 10;
    var cups = parseInt(water.getAttribute("data-cups"), 10) || 0;
    var goalL = parseFloat(water.getAttribute("data-goal")) || 2.5;
    var perCup = goalL / total;
    var glassWrap = $(".glasses", water);
    var ringEl = $("[data-water-ring]", water);
    var countEl = $("[data-water-count]", water);
    var hintEl = $("[data-water-hint]", water);
    var litersEl = $("[data-water-liters]", water);
    var dropSvg =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3z"/></svg>';

    var glasses = [];
    for (var i = 0; i < total; i++) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "glass";
      b.setAttribute("aria-label", i + 1 + "-stakan");
      b.innerHTML = dropSvg;
      (function (idx) {
        b.addEventListener("click", function () {
          cups = cups === idx + 1 ? idx : idx + 1;
          renderWater();
        });
      })(i);
      glassWrap.appendChild(b);
      glasses.push(b);
    }

    function renderWater() {
      glasses.forEach(function (g, idx) {
        g.classList.toggle("full", idx < cups);
      });
      var liters = (cups * perCup).toFixed(1).replace(/\.0$/, "");
      countEl.textContent = cups + " / " + total + " stakan";
      litersEl.textContent = liters + " l";
      var left = total - cups;
      hintEl.textContent =
        left > 0
          ? "Ajoyib! Maqsadgacha yana " + left + " stakan qoldi."
          : "Tabriklaymiz! Bugungi suv maqsadi bajarildi.";
      setRing(ringEl, (cups / total) * 100);
    }

    var addBtn = $("[data-water-add]", water);
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        if (cups < total) {
          cups++;
          renderWater();
        }
      });
    }
    renderWater();
  }

  /* ---------- Ovqat qo'shish tugmalari ---------- */
  var plusSvg =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var okSvg =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  $$(".add-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var on = btn.classList.toggle("on");
      btn.innerHTML = on ? okSvg : plusSvg;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  });


  /* ---------- Taom qo'shish (Ovqatlanish sahifasi) ---------- */
  var addMealBtn = $("[data-add-meal]");
  var mealModal = $("#meal-modal");
  if (addMealBtn && mealModal) {
    var mealForm = $("form", mealModal);
    var mealError = $(".meal-error", mealModal);
    var mealsBox = $(".meals");

    var KCAL_GOAL = 2200;
    var PROTEIN_GOAL = 120;
    var kcal = parseInt($("[data-kcal-num]").textContent, 10) || 0;
    var protein = parseInt($("[data-protein-sub]").textContent, 10) || 0;
    var added = 0;
    var GRADS = ["", "g2", "g3", "g4"];

    var forkIcon =
      '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10"/><path d="M17 21V3c-2.5 1.5-4 4.5-4 8h4"/></svg>';

    function updateTotals() {
      var left = KCAL_GOAL - kcal;
      $("[data-kcal-num]").textContent = kcal;
      $("[data-kcal-label]").textContent = kcal;
      setRing($("[data-kcal-ring]"), (kcal / KCAL_GOAL) * 100);
      $("[data-kcal-left]").innerHTML =
        left >= 0
          ? "Kunlik maqsadgacha <b>" + left + " kkal</b> qoldi"
          : "Kunlik maqsaddan <b>" + -left + " kkal</b> oshdi";

      var pPct = Math.round((protein / PROTEIN_GOAL) * 100);
      $("[data-protein-sub]").textContent = protein + " / " + PROTEIN_GOAL + " g";
      $("[data-protein-pct]").textContent = pPct + "%";
      setRing($("[data-protein-ring]"), pPct);
    }

    function openMeal() {
      mealForm.reset();
      mealError.textContent = "";
      mealModal.hidden = false;
      mealForm.elements.nomi.focus();
    }

    function closeMeal() {
      mealModal.hidden = true;
    }

    addMealBtn.addEventListener("click", openMeal);
    $("[data-meal-cancel]", mealModal).addEventListener("click", closeMeal);
    mealModal.addEventListener("click", function (e) {
      if (e.target === mealModal) closeMeal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMeal();
    });

    mealForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var turi = mealForm.elements.turi.value;
      var nomi = mealForm.elements.nomi.value.trim();
      var k = parseInt(mealForm.elements.kkal.value, 10);
      var o = parseInt(mealForm.elements.oqsil.value, 10);

      if (!nomi || !(k > 0) || !(o >= 0)) {
        mealError.textContent = "Taom nomi, kaloriya va oqsilni to‘g‘ri kiriting.";
        return;
      }

      var card = document.createElement("article");
      card.className = "meal is-new";
      card.innerHTML =
        '<div class="meal-img ' + GRADS[added % GRADS.length] + '"><span style="color:rgba(255,255,255,.95)">' + forkIcon + "</span></div>" +
        '<div class="meal-info"><div class="meal-type"></div><div class="meal-name"></div><div class="meal-meta"></div></div>' +
        '<button class="meal-remove" type="button" aria-label="O‘chirish">×</button>';
      // matnlar textContent orqali (xavfsiz)
      $(".meal-type", card).textContent = turi;
      $(".meal-name", card).textContent = nomi;
      $(".meal-meta", card).textContent = k + " kkal · " + o + " g oqsil";

      $(".meal-remove", card).addEventListener("click", function () {
        kcal -= k;
        protein -= o;
        card.remove();
        updateTotals();
      });

      mealsBox.appendChild(card);
      added++;
      kcal += k;
      protein += o;
      updateTotals();
      closeMeal();
    });
  }

  /* ---------- Hisobotlar: tablar ---------- */
  var DATA = {
    week: {
      water: [38, 62, 46, 78, 56, 100, 70],
      steps: [40, 72, 52, 86, 64, 100, 78],
      labels: ["Du", "Se", "Cho", "Pa", "Ju", "Sha", "Ya"],
      range: "12–18 may, 2025",
      sleep: "7,8,6.5,7.5,6,8.5,7.5",
      energy: "1500,1900,1700,2100,1800,2300,2000",
    },
    month: {
      water: [58, 66, 72, 80],
      steps: [60, 70, 66, 84],
      labels: ["1-hafta", "2-hafta", "3-hafta", "4-hafta"],
      range: "May, 2025",
      sleep: "7,7.2,7.4,7.8",
      energy: "1800,1850,1900,1950",
    },
    year: {
      water: [48, 54, 60, 66, 72, 78, 82, 80, 84, 88, 90, 94],
      steps: [44, 50, 58, 62, 70, 76, 80, 78, 82, 86, 90, 92],
      labels: ["Yan", "Fev", "Mar", "Apr", "May", "Iyn", "Iyl", "Avg", "Sen", "Okt", "Noy", "Dek"],
      range: "2025-yil",
      sleep: "6.8,7,7.1,7.2,7.4,7.5,7.6,7.5,7.7,7.8,7.8,7.9",
      energy: "1700,1750,1800,1820,1850,1880,1900,1890,1920,1940,1960,1980",
    },
  };

  function renderBars(el, vals, labels) {
    var max = Math.max.apply(null, vals);
    var hiIdx = vals.indexOf(max);
    el.innerHTML = vals
      .map(function (v, i) {
        return (
          '<div class="bar-col" title="' + labels[i] + ": " + v + '%">' +
          '<div class="b' + (i === hiIdx ? " hi" : "") + '" style="--h:' + v + '%"></div>' +
          "<span>" + labels[i] + "</span></div>"
        );
      })
      .join("");
  }

  var tabs = $$("[data-tab]");
  if (tabs.length) {
    function showTab(key) {
      var d = DATA[key];
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-tab") === key;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      var rg = $("[data-range]");
      if (rg) rg.textContent = d.range;
      var w = $("[data-bars='water']");
      var s = $("[data-bars='steps']");
      if (w) renderBars(w, d.water, d.labels);
      if (s) renderBars(s, d.steps, d.labels);
      var sl = $("[data-line-id='sleep']");
      var en = $("[data-line-id='energy']");
      if (sl) {
        sl.setAttribute("data-line", d.sleep);
        redrawLine(sl);
      }
      if (en) {
        en.setAttribute("data-line", d.energy);
        redrawLine(en);
      }
    }

    function redrawLine(box) {
      // data-line ni qayta o'qib chizish
      var clone = box.cloneNode(false);
      box.parentNode.replaceChild(clone, box);
      var vals = clone.getAttribute("data-line").split(",").map(Number);
      var color = clone.getAttribute("data-color") || "#2563eb";
      var W = 600,
        H = parseFloat(clone.getAttribute("data-h")) || 160,
        pad = 12;
      var min = Math.min.apply(null, vals),
        max = Math.max.apply(null, vals),
        span = max - min || 1;
      var pts = vals.map(function (v, i) {
        return [(i / (vals.length - 1)) * W, pad + (1 - (v - min) / span) * (H - pad * 2)];
      });
      var line = smoothPath(pts);
      var area = line + " L" + W + "," + H + " L0," + H + " Z";
      var id = "g" + Math.random().toString(36).slice(2, 8);
      clone.innerHTML =
        '<svg viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none" role="img" aria-label="Grafik">' +
        '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0%" stop-color="' + color + '" stop-opacity="0.22"/>' +
        '<stop offset="100%" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
        '<path d="' + area + '" fill="url(#' + id + ')"/>' +
        '<path d="' + line + '" fill="none" stroke="' + color + '" stroke-width="3.5" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>';
    }

    tabs.forEach(function (t) {
      t.addEventListener("click", function () {
        showTab(t.getAttribute("data-tab"));
      });
    });
    showTab("week");
  }

  /* ---------- AI chat ---------- */
  var chat = $("[data-chat]");
  if (chat) {
    var body = $(".chat-body", chat);
    var form = $(".chat-form", chat);
    var input = $("input", form);

    var botSvg =
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z"/><path d="M19 3v4M17 5h4"/></svg>';

    var ANSWERS = [
      {
        k: ["uyqu", "uxla"],
        a: "Uyqu sifatini yaxshilash uchun har kuni bir vaqtda uxlashga yoting, uyqudan 1 soat oldin ekranlardan uzoqlashing va xonani salqin tuting.",
      },
      {
        k: ["ovqat", "kaloriya", "menyu"],
        a: "Bugun oqsil miqdori biroz kam. Kechki ovqatga tovuq go‘shti yoki dukkakli mahsulot qo‘shing, yog‘li taomlarni esa kamaytiring.",
      },
      {
        k: ["suv", "ichish"],
        a: "Kuniga taxminan 2–2,5 litr suv ichish tavsiya etiladi. Har 2 soatda bitta stakan suv ichishni odat qiling.",
      },
      {
        k: ["mashq", "faollik", "qadam", "sport"],
        a: "Har kuni kamida 30 daqiqa harakat qiling: tushlikdan keyin 15 daqiqa piyoda yurish ham yaxshi boshlanish bo‘ladi.",
      },
    ];
    var FALLBACK =
      "Yaxshi savol! Kundalik ko‘rsatkichlaringizga qarab, suv, uyqu va faollikni muvozanatda saqlashga harakat qiling. Aniqroq maslahat uchun mavzuni yozing.";

    function now() {
      var d = new Date();
      return (
        String(d.getHours()).padStart(2, "0") +
        ":" +
        String(d.getMinutes()).padStart(2, "0")
      );
    }

    function esc(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function addMsg(text, who) {
      var m = document.createElement("div");
      m.className = "msg " + who;
      m.innerHTML =
        (who === "bot" ? '<span class="ai-ic">' + botSvg + "</span>" : "") +
        '<div class="bubble">' + esc(text) + '<span class="time">' + now() + "</span></div>";
      body.appendChild(m);
      body.scrollTop = body.scrollHeight;
      return m;
    }

    function answer(q) {
      var low = q.toLowerCase();
      for (var i = 0; i < ANSWERS.length; i++) {
        for (var j = 0; j < ANSWERS[i].k.length; j++) {
          if (low.indexOf(ANSWERS[i].k[j]) !== -1) return ANSWERS[i].a;
        }
      }
      return FALLBACK;
    }

    function send(text) {
      text = text.trim();
      if (!text) return;
      addMsg(text, "me");
      var typing = document.createElement("div");
      typing.className = "msg bot";
      typing.innerHTML =
        '<span class="ai-ic">' + botSvg + '</span><div class="bubble"><span class="typing"><i></i><i></i><i></i></span></div>';
      body.appendChild(typing);
      body.scrollTop = body.scrollHeight;
      setTimeout(function () {
        typing.remove();
        addMsg(answer(text), "bot");
      }, 900);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      send(input.value);
      input.value = "";
    });

    $$(".suggest button", chat).forEach(function (b) {
      b.addEventListener("click", function () {
        send(b.textContent);
      });
    });

    $$(".hist", chat).forEach(function (h) {
      h.addEventListener("click", function () {
        $$(".hist", chat).forEach(function (x) {
          x.classList.remove("is-active");
        });
        h.classList.add("is-active");
      });
    });

    var newChat = $("[data-new-chat]", chat);
    if (newChat) {
      newChat.addEventListener("click", function () {
        body.innerHTML = '<div class="chat-day">Bugun</div>';
        addMsg("Salom, " + (window.HM_USER ? window.HM_USER.ism : "Madina") + "! Men sizning aqlli sog‘liq yordamchingizman. Bugun sizga qanday yordam bera olaman?", "bot");
        input.focus();
      });
    }

    body.scrollTop = body.scrollHeight;
  }
})();