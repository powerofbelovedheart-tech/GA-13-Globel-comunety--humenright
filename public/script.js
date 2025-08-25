// ====== Hjelpere som må finnes (antakelig allerede) ======
// auth.user(), auth.header(), etc. finnes fra før i din fil.
// Hvis ikke, kopier fra tidligere svar.

// ------------------ LISTE / SØK / PAGINERING ------------------
const adsGrid = document.getElementById("adsGrid");
const qInput = document.getElementById("q");
const pageSizeSel = document.getElementById("pageSize");
const btnSearch = document.getElementById("btnSearch");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let adsState = { q: "", page: 1, pageSize: 12, total: 0 };

async function loadAds() {
  if (!adsGrid) return;
  const params = new URLSearchParams({
    q: adsState.q,
    page: String(adsState.page),
    pageSize: String(adsState.pageSize),
  });
  const res = await fetch("/api/ads?" + params.toString());
  const data = await res.json();
  const items = data.items || [];
  adsState.total = data.total || 0;

  const loggedIn = !!(auth.header().Authorization);

  adsGrid.innerHTML = items.map(ad => `
    <article class="ad">
      ${ad.imageUrl ? `<img src="${ad.imageUrl}" alt="">` : `<div style="height:160px;background:#0c1018;"></div>`}
      <div class="p">
        <h4>${ad.title}</h4>
        <small>${ad.price ? ad.price + " kr" : "Pris ikke oppgitt"}</small><br/>
        <small>${new Date(ad.createdAt).toLocaleString()}</small>
        ${loggedIn ? `
          <div class="tools">
            <button class="btn-sm" data-edit="${ad.id}">Rediger</button>
            <button class="btn-sm danger" data-del="${ad.id}">Slett</button>
          </div>` : ``}
      </div>
    </article>
  `).join("");

  const maxPage = Math.max(1, Math.ceil(adsState.total / adsState.pageSize));
  pageInfo && (pageInfo.textContent = `Side ${adsState.page} / ${maxPage} – ${adsState.total} treff`);

  // Knapper:
  adsGrid.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-edit");
      window.location.href = `edit-ad.html?id=${encodeURIComponent(id)}`;
    });
  });
  adsGrid.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-del");
      if (!confirm("Slette denne annonsen?")) return;
      const res = await fetch(`/api/ads/${id}`, {
        method: "DELETE",
        headers: { ...auth.header() }
      });
      if (!res.ok) return alert("Kunne ikke slette.");
      loadAds();
    });
  });
}

if (adsGrid) {
  // init
  const url = new URL(window.location.href);
  adsState.q = url.searchParams.get("q") || "";
  adsState.page = parseInt(url.searchParams.get("page") || "1", 10);
  adsState.pageSize = parseInt(url.searchParams.get("pageSize") || "12", 10);
  if (qInput) qInput.value = adsState.q;
  if (pageSizeSel) pageSizeSel.value = String(adsState.pageSize);

  loadAds();

  btnSearch && btnSearch.addEventListener("click", () => {
    adsState.q = (qInput && qInput.value || "").trim();
    adsState.pageSize = parseInt(pageSizeSel.value || "12", 10);
    adsState.page = 1;
    // oppdater URL
    const sp = new URLSearchParams({
      q: adsState.q, page: String(adsState.page), pageSize: String(adsState.pageSize)
    });
    history.replaceState({}, "", "ads.html?" + sp.toString());
    loadAds();
  });
  prevPageBtn && prevPageBtn.addEventListener("click", () => {
    if (adsState.page > 1) {
      adsState.page--;
      const sp = new URLSearchParams({
        q: adsState.q, page: String(adsState.page), pageSize: String(adsState.pageSize)
      });
      history.replaceState({}, "", "ads.html?" + sp.toString());
      loadAds();
    }
  });
  nextPageBtn && nextPageBtn.addEventListener("click", () => {
    const maxPage = Math.max(1, Math.ceil(adsState.total / adsState.pageSize));
    if (adsState.page < maxPage) {
      adsState.page++;
      const sp = new URLSearchParams({
        q: adsState.q, page: String(adsState.page), pageSize: String(adsState.pageSize)
      });
      history.replaceState({}, "", "ads.html?" + sp.toString());
      loadAds();
    }
  });
}

// ------------------ REDIGER SIDE ------------------
const editForm = document.getElementById("editForm");
if (editForm) {
  (async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) { alert("Mangler id"); return; }

    const out = document.getElementById("editOut");
    const imgWrap = document.getElementById("currentImageWrap");

    // last eksisterende
    const res = await fetch(`/api/ads/${id}`);
    const ad = await res.json();
    if (res.ok) {
      editForm.elements.title.value = ad.title || "";
      editForm.elements.price.value = ad.price || 0;
      imgWrap.innerHTML = ad.imageUrl
        ? `<div style="margin-bottom:6px"><img src="${ad.imageUrl}" alt="" style="max-width:320px;border-radius:12px"/></div>`
        : `<small>Ingen bilde</small>`;
    } else {
      out.textContent = (ad && ad.error) || "Fant ikke annonsen";
      return;
    }

    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(editForm);
      try {
        const resUp = await fetch(`/api/ads/${id}`, {
          method: "PUT",
          headers: { ...auth.header() }, // må være innlogget
          body: formData
        });
        const data = await resUp.json();
        if (!resUp.ok) { out.textContent = data.error || "Feil ved oppdatering."; return; }
        out.textContent = "Oppdatert.\n" + JSON.stringify(data, null, 2);
        setTimeout(() => (window.location.href = "ads.html"), 900);
      } catch (err) {
        out.textContent = "Feil: " + err.message;
      }
    });
  })();
}
const adForm = document.getElementById("adForm");
if (adForm) {
  adForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const out = document.getElementById("adOut");
    out.textContent = "Laster...";
    try {
      const fd = new FormData(adForm); // inneholder session_id + evt. bilde
      const res = await fetch("/api/ads", {
        method: "POST",
        headers: { ...auth.header() }, // må være innlogget
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Feil");
      out.textContent = "Publisert!\n" + JSON.stringify(data, null, 2);
      // tømm “en gangs” kvittering slik at neste annonse krever ny betaling
      localStorage.removeItem("ga13_last_paid_session");
      setTimeout(()=> location.href = "ads.html", 800);
    } catch (err) {
      out.textContent = err.message;
    }
  });
}