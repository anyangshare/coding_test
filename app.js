/**
 * 행정정보 통합관리 기본법 - 조항 열람·검색
 * INDEX.HTML / STYLE.CSS / APP.JS
 */

(function () {
  "use strict";

  const cardsContainer = document.getElementById("cardsContainer");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const resultCount = document.getElementById("resultCount");
  const emptyMsg = document.getElementById("emptyMsg");

  let allArticles = [];

  /* ---------- 데이터 로드 ---------- */
  async function loadData() {
    try {
      const res = await fetch("조항데이터.json");
      if (!res.ok) throw new Error("JSON 로드 실패");
      allArticles = await res.json();
      render(allArticles);
    } catch (err) {
      cardsContainer.innerHTML =
        '<p class="empty-msg">조항 데이터를 불러오지 못했습니다.</p>';
      console.error(err);
    }
  }

  /* ---------- 렌더링 ---------- */
  function render(list, keyword = "") {
    cardsContainer.innerHTML = "";
    emptyMsg.hidden = list.length > 0;

    const countText =
      keyword.trim() === ""
        ? `전체 <strong>${list.length}</strong>개 조항`
        : `검색 결과 <strong>${list.length}</strong>개 조항`;
    resultCount.innerHTML = countText;

    list.forEach((item) => {
      const card = document.createElement("article");
      card.className = "card";
      card.dataset.jo = item.조;

      const header = document.createElement("div");
      header.className = "card-header";

      const joEl = document.createElement("span");
      joEl.className = "card-jo";
      joEl.textContent = item.조;

      const titleEl = document.createElement("span");
      titleEl.className = "card-title";
      titleEl.textContent = item.제목;

      header.appendChild(joEl);
      header.appendChild(titleEl);

      const body = document.createElement("div");
      body.className = "card-body";

      // 키워드 하이라이트
      if (keyword.trim()) {
        body.innerHTML = highlight(item.본문, keyword.trim());
      } else {
        body.textContent = item.본문;
      }

      card.appendChild(header);
      card.appendChild(body);
      cardsContainer.appendChild(card);
    });
  }

  /* ---------- 하이라이트 ---------- */
  function highlight(text, keyword) {
    // 특수문자 이스케이프 후 대소문자 무시 매칭
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escaped})`, "gi");
    // XSS 방지를 위해 먼저 텍스트 이스케이프 후 치환
    const safe = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return safe.replace(regex, "<mark>$1</mark>");
  }

  /* ---------- 필터링 ---------- */
  function filterArticles(keyword) {
    const q = keyword.trim().toLowerCase();
    if (!q) {
      render(allArticles);
      return;
    }
    const filtered = allArticles.filter((item) =>
      item.본문.toLowerCase().includes(q)
    );
    render(filtered, keyword);
  }

  /* ---------- 이벤트 ---------- */
  let debounceTimer;
  searchInput.addEventListener("input", () => {
    const val = searchInput.value;
    clearBtn.classList.toggle("visible", val.length > 0);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => filterArticles(val), 180);
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.remove("visible");
    searchInput.focus();
    filterArticles("");
  });

  /* ---------- 시작 ---------- */
  loadData();
})();
