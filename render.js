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

  // کلید خدمت
  const key = window.SERVICE_KEY || "passport";

  // دیتا باید از services.js آمده باشد
  if (typeof SERVICES === "undefined" || !SERVICES[key]) {
    const el = document.getElementById("app");
    if (el) el.innerHTML = `<div style="padding:16px;font-family:tahoma">خطا: داده‌های خدمت پیدا نشد.</div>`;
    return;
  }

  const svc = SERVICES[key];

  // هزینه‌ها باید از fees.js آمده باشد (اختیاری؛ اگر نبود، خطا نده)
  const feeKey = svc?.meta?.feeKey;
  const feeObj = (typeof FEES !== "undefined" && feeKey && FEES[feeKey]) ? FEES[feeKey] : null;

  // ردیف‌های جدول هزینه (برای گذرنامه: issue/photo/office)
  // برای خدمات دیگر هم اگر همین کلیدها را بدهی، بدون تغییر کار می‌کند.
  const feeRows = [
    { title: "صدور خدمت", value: feeObj ? feeObj.issue : "—" },
    { title: "عکس/بیومتریک", value: feeObj ? feeObj.photo : "—" },
    { title: "خدمات دفتر", value: feeObj ? feeObj.office : "—" }
  ];

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
    .header{position:relative;padding:56px 16px 16px;background:linear-gradient(180deg,#fff 0%,#f7f9ff 100%);border-bottom:1px solid var(--border)}
    .header::before{content:"";position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,rgba(11,59,122,.25),rgba(11,59,122,0))}
    .top-actions{position:absolute;top:12px;left:12px;z-index:10}
    .back-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:12px;background:#ffffff;border:1px solid var(--border);color:#0a58ca;text-decoration:none;font-size:14px;font-weight:700;box-shadow:0 6px 16px rgba(2,8,23,.06)}
    .title{margin:0 0 6px;font-size:22px;color:var(--accent);text-align:center;letter-spacing:-.2px}
    .subtitle{margin:0 auto 12px;font-size:14px;color:var(--muted);max-width:44rem;text-align:center}
    .meta{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:10px}
    .pill{background:var(--soft);border:1px solid var(--border);border-radius:999px;padding:8px 12px;font-size:13px;display:flex;align-items:center;gap:8px;white-space:nowrap}
    details{margin:0}
    summary{cursor:pointer;list-style:none}
    summary::-webkit-details-marker{display:none}
    .fee-box{margin-top:10px;border:1px solid var(--border);border-radius:12px;padding:12px;background:#fff}
    table{width:100%;border-collapse:collapse;font-size:13px}
    th,td{border:1px solid var(--border);padding:10px;text-align:center}
    th{background:#f2f5f9;font-weight:700}
    .content{padding:16px 16px 18px}
    .section-head{margin:14px 0 8px;padding:12px 14px;border:1px solid var(--border);border-radius:12px;background:#f8fbff;font-size:16px;font-weight:800;color:#0f172a;display:flex;justify-content:space-between;gap:10px}
    .section-head small{font-weight:600;color:#64748b;font-size:12px}
    ul{margin:0;padding-right:20px;font-size:14px}
    li{margin:8px 0}
    .notice{margin-top:16px;background:var(--warn);border:1px solid var(--warn-border);border-radius:14px;padding:12px;font-size:13px;color:#3b2a00}
    .notice strong{display:block;margin-bottom:6px}
    .footer{margin-top:14px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding-top:8px;border-top:1px dashed #e9edf5}
    .btn{background:#eaf2ff;border:1px solid #cfe0ff;padding:10px 12px;border-radius:14px;font-weight:700;color:#0a58ca;text-decoration:none}
    .hint{font-size:12px;color:#777}
  </style>`;

  const feeTable = `
    <details class="pill">
      <summary>💳 هزینه: مطابق تعرفه رسمی (مشاهده جزئیات)</summary>
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
    ? `<div class="notice"><strong>⚠️ نکات مهم</strong>${(svc.notice||[]).map(n => `<div>• ${esc(n)}</div>`).join("")}</div>`
    : "";

  const html = `
    ${style}
    <div class="wrap">
      <div class="card">
        <div class="header">
          <div class="top-actions">
            <a class="back-btn" href="index.html">⬅ بازگشت</a>
          </div>

          <h1 class="title">${esc(svc.title)}</h1>
          <div class="subtitle">${esc(svc.subtitle || "")}</div>

          <div class="meta">
            <div class="pill">⏱ زمان معمول: ${esc(svc?.meta?.time || "—")}</div>
            ${feeTable}
            <div class="pill">📷 عکس: ${esc(svc?.meta?.photo || "—")}</div>
          </div>
        </div>

        <div class="content">
          ${sectionsHtml}
          ${noticeHtml}

          <div class="footer">
            <a class="btn" href="index.html">⬅ بازگشت به صفحه اصلی</a>
            <span class="hint">این راهنما به مرور کامل‌تر می‌شود</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const app = document.getElementById("app");
  if (app) app.innerHTML = html;
})();
