(function () {
  function esc(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
  function liList(items) {
    if (!items || !items.length) return "";
    return `<ul>${items.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;
  }
  function safeText(v) {
    const t = (v ?? "").toString().trim();
    return t ? t : "—";
  }
  function getParam(name) {
    try {
      const u = new URL(location.href);
      return u.searchParams.get(name);
    } catch (e) {
      return null;
    }
  }

  // --------- Guard: SERVICES must exist ----------
  if (typeof SERVICES === "undefined") {
    const el = document.getElementById("app");
    if (el) el.innerHTML = `<div style="padding:16px;font-family:tahoma">خطا: فایل services.js بارگذاری نشده است.</div>`;
    return;
  }

  // --------- Styles (shared) ----------
  const style = `
  <style>
    :root{
      --bg:#f5f7fb; --card:#fff; --text:#0f172a; --muted:#475569;
      --border:#e6e8ee; --accent:#0b3b7a; --soft:#f1f5ff;
      --warn:#fff6e5; --warn-border:#ffd89a;
      --shadow:0 10px 30px rgba(2,8,23,.06); --radius:16px;
    }
    *{box-sizing:border-box}
    body{font-family:Tahoma,Arial,sans-serif;margin:0;background:var(--bg);color:var(--text);line-height:1.95}
    .wrap{max-width:860px;margin:18px auto 28px;padding:0 14px}
    .card{background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow)}
    .header{position:relative;padding:18px 16px;background:linear-gradient(180deg,#fff 0%,#f7f9ff 100%);border-bottom:1px solid var(--border)}
    .header::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,rgba(11,59,122,.25),rgba(11,59,122,0))}
    .title{margin:0 0 6px;font-size:22px;color:var(--accent);text-align:center;letter-spacing:-.2px}
    .subtitle{margin:0 auto 12px;font-size:14px;color:var(--muted);max-width:44rem;text-align:center}

    .content{padding:16px 16px 18px}

    /* Home */
    .home-actions{display:grid;grid-template-columns:1fr;gap:10px;margin-top:12px}
    .action{display:flex;align-items:center;justify-content:space-between;gap:10px;
      padding:14px 14px;border-radius:14px;border:1px solid var(--border);background:#fff;text-decoration:none;color:var(--text);font-weight:800}
    .action small{font-weight:600;color:#64748b}
    .action.primary{border-color:#cfe0ff;background:#eaf2ff}
    .grid4{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
    .svc{display:flex;align-items:center;justify-content:center;text-align:center;
      padding:14px;border-radius:14px;border:1px solid var(--border);background:#fff;text-decoration:none;color:var(--text);font-weight:800}
    .block{margin-top:14px;padding:12px;border:1px solid var(--border);border-radius:14px;background:#fff}
    .block h3{margin:0 0 8px;font-size:15px;color:#0f172a}
    .note{background:var(--warn);border:1px solid var(--warn-border);border-radius:14px;padding:12px;font-size:13px;color:#3b2a00}
    .note div{margin:6px 0}

    .search{display:flex;gap:8px}
    .search input{flex:1;padding:12px 12px;border-radius:14px;border:1px solid var(--border);font-size:14px}
    .results a{display:block;padding:10px 10px;border-radius:12px;text-decoration:none;border:1px solid var(--border);margin-top:8px;background:#fff;color:#0f172a;font-weight:700}

    /* Service */
    .top-actions{position:absolute;top:12px;left:12px;z-index:10}
    .back-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:#ffffff;border:1px solid var(--border);color:#0a58ca;text-decoration:none;font-size:14px;font-weight:700;box-shadow:0 6px 16px rgba(2,8,23,.06)}
    .meta{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px}
    .pill{background:var(--soft);border:1px solid var(--border);border-radius:999px;padding:8px 12px;font-size:13px;display:flex;align-items:center;gap:8px;white-space:nowrap}
    details{margin:0}
    summary{cursor:pointer;list-style:none}
    summary::-webkit-details-marker{display:none}
    .fee-box{margin-top:10px;border:1px solid var(--border);border-radius:12px;padding:12px;background:#fff}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border:1px solid var(--border);padding:10px;text-align:center}
    th{background:#f2f5f9;font-weight:700}
    .section-head{margin:14px 0 8px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:#f8fbff;font-size:16px;font-weight:800;color:#0f172a;display:flex;justify-content:space-between;gap:10px}
    .section-head small{font-weight:600;color:#64748b;font-size:12px}
    ul{margin:0;padding-right:20px;font-size:14px}
    li{margin:8px 0}
    .footer{margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-top:8px;border-top:1px dashed #e9edf5}
    .btn{background:#eaf2ff;border:1px solid #cfe0ff;padding:10px 12px;border-radius:14px;font-weight:700;color:#0a58ca;text-decoration:none}
    .hint{font-size:12px;color:#777}
  </style>`;

  // --------- HOME RENDER (based on 30 principles + your business priority) ----------
  function renderHome() {
    // 4 main actions: internet (bold), passport, duty/edu, tracking
    const html = `
      ${style}
      <div class="wrap">
        <div class="card">
          <div class="header">
            <h1 class="title">برای چه کاری به دفتر پلیس +۱۰ مراجعه کرده‌اید؟</h1>
            <div class="subtitle">یکی از گزینه‌های زیر را انتخاب کنید.</div>

            <div class="search">
              <input id="q" placeholder="نام خدمت را بنویسید (مثلاً گذرنامه، نظام وظیفه...)" />
            </div>
            <div class="results" id="results"></div>

            <div class="home-actions">
              <a class="action primary" href="internet.html">
                <span>خدمات اینترنتی (غیرحضوری)</span>
                <small>اولویت دفتر</small>
              </a>

              <a class="action" href="index.html?id=passport">
                <span>گذرنامه</span>
                <small>مدارک و شرایط</small>
              </a>

              <a class="action" href="index.html?id=military">
                <span>نظام وظیفه و معافیت تحصیلی</span>
                <small>مدارک و شرایط</small>
              </a>

              <a class="action" href="tracking.html">
                <span>پیگیری کار قبلی</span>
                <small>پیگیری وضعیت</small>
              </a>
            </div>

            <div class="block">
              <h3>کارهای پرتکرار</h3>
              <div class="grid4">
                <a class="svc" href="index.html?id=passport">گذرنامه</a>
                <a class="svc" href="index.html?id=driving">گواهینامه</a>
                <a class="svc" href="index.html?id=fuel">کارت سوخت</a>
                <a class="svc" href="index.html?id=other">سایر خدمات</a>
              </div>
            </div>

            <div class="note" style="margin-top:14px">
              <div>• حضور متقاضی در برخی خدمات الزامی است.</div>
              <div>• مدارک ناقص ممکن است پذیرش نشود.</div>
              <div>• اطلاعات این سایت به مرور کامل‌تر می‌شود.</div>
            </div>
          </div>

          <div class="content">
            <div class="footer">
              <span class="hint">آدرس و ساعات کاری را اینجا بگذارید</span>
              <a class="btn" href="tel:">تماس</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const app = document.getElementById("app");
    if (app) app.innerHTML = html;

    // Search (simple)
    const input = document.getElementById("q");
    const results = document.getElementById("results");
    if (!input || !results) return;

    input.addEventListener("input", () => {
      const q = (input.value || "").trim();
      if (!q) { results.innerHTML = ""; return; }

      // naive search over SERVICES values
      const all = Object.keys(SERVICES).map(k => ({ key:k, title: SERVICES[k]?.title || k }));
      const hit = all.filter(x => x.title.includes(q) || x.key.includes(q)).slice(0, 8);

      results.innerHTML = hit.map(x =>
        `<a href="index.html?id=${encodeURIComponent(x.key)}">${esc(x.title)}</a>`
      ).join("");
    });
  }

  // --------- SERVICE RENDER (your existing logic, improved key selection) ----------
  function renderService(serviceKey) {
    const key = serviceKey;

    if (!SERVICES[key]) {
      const el = document.getElementById("app");
      if (el) el.innerHTML = `${style}<div class="wrap"><div class="card"><div class="content">این خدمت پیدا نشد.</div></div></div>`;
      return;
    }

    const svc = SERVICES[key];

    // fees optional
    const feeKey = svc?.meta?.feeKey;
    const feeObj = (typeof FEES !== "undefined" && feeKey && FEES[feeKey]) ? FEES[feeKey] : null;

    const feeRows = (svc.feeRows || []).map(r => ({
      title: r.label,
      value: feeObj ? feeObj[r.field] : "—"
    }));

    const feeTable = `
      <details class="pill">
        <summary>هزینه: ${esc(svc?.meta?.feeSummary || "مطابق تعرفه رسمی")} (جزئیات)</summary>
        <div class="fee-box">
          <table>
            <tr><th>عنوان</th><th>مبلغ/توضیح</th></tr>
            ${feeRows.map(r => `<tr><td>${esc(r.title)}</td><td>${esc(safeText(r.value))}</td></tr>`).join("")}
          </table>
        </div>
      </details>
    `;

    const sectionsHtml = (svc.sections || []).map(sec => `
      <div class="section-head">
        <span>${esc(sec.heading || "")}</span>
        <small>${esc(sec.tag || "")}</small>
      </div>
      ${liList(sec.items || [])}
    `).join("");

    const noticeHtml = (svc.notice && svc.notice.length)
      ? `<div class="note"><div style="font-weight:800;margin-bottom:6px">نکات مهم</div>${(svc.notice||[]).map(n => `<div>• ${esc(n)}</div>`).join("")}</div>`
      : "";

    const html = `
      ${style}
      <div class="wrap">
        <div class="card">
          <div class="header" style="padding-top:56px">
            <div class="top-actions">
              <a class="back-btn" href="index.html">بازگشت</a>
            </div>
            <h1 class="title">${esc(svc.title)}</h1>
            <div class="subtitle">${esc(svc.subtitle || "")}</div>

            <div class="meta">
              <div class="pill">زمان معمول: ${esc(svc?.meta?.time || "—")}</div>
              ${feeTable}
              <div class="pill">عکس: ${esc(svc?.meta?.photo || "—")}</div>
            </div>
          </div>

          <div class="content">
            ${sectionsHtml}
            ${noticeHtml}

            <div class="footer">
              <a class="btn" href="index.html">بازگشت به صفحه اصلی</a>
              <span class="hint">این راهنما به مرور کامل‌تر می‌شود</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const app = document.getElementById("app");
    if (app) app.innerHTML = html;
  }

  // --------- Router ----------
  const page = (window.PAGE || "").toLowerCase();
  if (page === "home") {
    renderHome();
    return;
  }

  // service key priority: URL ?id=  then window.SERVICE_KEY
  const urlKey = getParam("id");
  const key = urlKey || window.SERVICE_KEY;

  if (!key) {
    // If no key => better to show home, not default passport (align with principle 30)
    window.PAGE = "home";
    renderHome();
    return;
  }

  renderService(key);
})();
