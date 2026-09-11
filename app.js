// 로컬 파일 더블클릭(file://) 실행 시 CORS 방지용 내장 데이터 백업
const FALLBACK_DATA = [
  {
    "장": "1",
    "제목": "개요",
    "본문": "본 보고서는 행정안전부 안전정책총괄과가 2026년 상반기 실시한 종합 안전점검 결과를 정리한 자료다.\n\n총 점검 건수는 **450건**이며, 지적사항 **120건** 중 시정 완료율은 **85%**이다. 예산 집행률은 **92%**, 총괄책임자는 **권혁수** 안전정책총괄과장이다."
  },
  {
    "장": "2",
    "제목": "분야별 결과",
    "본문": "분야별 점검은 시설안전·교통안전·재난안전·산업안전 4개 분야로 진행됐다. 분야별 총합은 **450건**과 일치한다.\n\n지적사항 **115건** 중 80% 이상이 1분기 내 시정되었으며, 누적 시정 완료율은 **85%**으로 집계됐다."
  },
  {
    "장": "3",
    "제목": "예산 운용",
    "본문": "상반기 예산 집행률 **90%**은 전년 동기 대비 5%p 상승한 수치다. 총괄 운영은 **권혁수** 과장이 직접 주재했고, 분기별 점검회의 5회를 개최했다."
  },
  {
    "장": "4",
    "제목": "향후 계획",
    "본문": "상반기 실적을 되짚어 보면, 총 점검 건수는 **440건**으로 마감됐고 시정 완료율은 **82%**로 집계됐다.\n\n이를 바탕으로 하반기에는 미시정 과제 해소와 취약 분야 재점검을 중심으로 점검 체계를 보강할 계획이다."
  },
  {
    "장": "5",
    "제목": "결론",
    "본문": "행정안전부 안전정책총괄과는 2026년 상반기 동안 **450건**의 안전점검을 차질 없이 완료했다. 총괄 책임은 **권혁주** 과장이 맡았으며, 향후에도 분기별 점검 체계를 강화한다."
  }
];

let reportData = [];

const searchInput = document.getElementById('searchInput');
const clearBtn = document.getElementById('clearBtn');
const resultCount = document.getElementById('resultCount');
const cardsContainer = document.getElementById('cardsContainer');
const emptyState = document.getElementById('emptyState');

// 1. 데이터 로드 (장데이터.json 읽기)
async function loadData() {
  try {
    const response = await fetch('장데이터.json');
    if (!response.ok) throw new Error('네트워크 응답 오류');
    reportData = await response.json();
  } catch (error) {
    console.warn('장데이터.json 직접 fetch 실패 (file:// 프로토콜 등). 폴백 데이터를 사용합니다.', error);
    reportData = FALLBACK_DATA;
  }
  renderCards(reportData, '');
}

// 2. 텍스트 포맷터: HTML 이스케이프 + 마크다운 Bold(**) 변환 + 키워드 하이라이트(<mark>)
function formatText(rawText, keyword) {
  if (!rawText) return '';

  // 기본 특수문자 이스케이프 (XSS 방지)
  let text = rawText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 마크다운 **굵은 글씨** 태그 변환
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 검색어 하이라이트 (HTML 태그 내부 속성 침범 방지)
  if (keyword && keyword.trim() !== '') {
    const escapedKw = keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedKw})(?![^<]*>)`, 'gi');
    text = text.replace(regex, '<mark>$1</mark>');
  }

  // 줄바꿈 변환
  return text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
}

// 3. 카드 렌더링 함수
function renderCards(dataList, keyword) {
  cardsContainer.innerHTML = '';

  // 결과 건수 업데이트
  const total = reportData.length;
  const matched = dataList.length;

  if (keyword.trim() === '') {
    resultCount.innerHTML = `전체 <strong>${total}</strong>개 장 표시 중`;
  } else {
    resultCount.innerHTML = `검색 결과: 전체 ${total}개 중 <strong>${matched}</strong>건 일치`;
  }

  // 검색 결과 없을 때
  if (matched === 0) {
    cardsContainer.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  cardsContainer.style.display = 'grid';
  emptyState.style.display = 'none';

  // 카드 DOM 동적 생성
  dataList.forEach(item => {
    const cardEl = document.createElement('article');
    cardEl.className = 'card';

    const formattedTitle = formatText(item.제목, keyword);
    const formattedBody = formatText(item.본문, keyword);

    cardEl.innerHTML = `
      <div class="card-header">
        <span class="chapter-badge">제 ${item.장} 장</span>
        <h2 class="card-title">${formattedTitle}</h2>
      </div>
      <div class="card-body">
        <p>${formattedBody}</p>
      </div>
    `;
    cardsContainer.appendChild(cardEl);
  });
}

// 4. 검색 필터링 이벤트
searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  const trimmed = query.trim().toLowerCase();

  // 지우기 버튼 토글
  clearBtn.style.display = query.length > 0 ? 'block' : 'none';

  // 제목 또는 본문에 키워드가 포함된 카드 필터링
  const filtered = reportData.filter(item => {
    const inTitle = item.제목.toLowerCase().includes(trimmed);
    const inBody = item.본문.toLowerCase().includes(trimmed);
    return inTitle || inBody;
  });

  renderCards(filtered, query.trim());
});

// 검색어 초기화 버튼
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.style.display = 'none';
  renderCards(reportData, '');
  searchInput.focus();
});

// 페이지 초기화
document.addEventListener('DOMContentLoaded', loadData);