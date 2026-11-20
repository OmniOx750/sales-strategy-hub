# MEKICS Sales Strategy Hub — 작업 안내 (Claude · 팀원 공용)

대표님과 영업팀이 함께 보는 **제품별 전략 오버뷰 + 영업자료 허브**입니다.
모든 데이터는 Google 기반(Sheets · Drive)이고, 이 저장소는 화면(GitHub Pages)과 Apps Script 원본만 가집니다.

## 구조
| 구성 | 위치 |
|---|---|
| 화면 | `index.html` (단일 파일, GitHub Pages: https://omniox750.github.io/sales-strategy-hub/) |
| 서버 | `apps-script/Code.gs` → mek03@mekics.com 의 Apps Script 프로젝트 "Sales Strategy Hub API" (standalone) |
| 데이터 | Google 시트 "MEKICS Sales Strategy Hub DB" (mek03 소유) |
| 영업자료 원본 | Google Drive `이관용-영업본부 › 0. 사업전략기획 › 1. MARKETING MATERIAL › 02 제품 자료` |

## 시트 탭
- `Products` 제품 · 그룹 · 라이프사이클 단계 · 드라이브 폴더 ID · 포지셔닝 · 특장점(`|` 구분)
- `Strategy` 제품 × 국가/권역 한 줄 (국내/해외, 시장환경 4칸, 시장구분, Player, 포지셔닝, 목표 1~3단계, 접근방법, 매출 목표/실적, Lead·견적·수주·성공률)
- `Demos` 데모 1건 = 1줄 → 화면의 Demo 수는 이 탭을 제품+국가/권역으로 세어서 표시
- `Competitors` 타사 비교 (긴 형식: 제품 · 비교대상 · 자사여부 · 항목 · 값)
- `Activities` 출장 · 학회 · 보고 · 자료
- `Settings` 접속 코드(accessCode) 등
- `_DriveIndex` 자동 생성 (손대지 않음). 매일 06시 `refreshDriveIndex()`가 제품 폴더를 스캔

1행 = 한글 제목, 2행 = API 키(영문, 수정 금지), 3행부터 데이터. `memo`에 "샘플"이 있는 행은 예시 데이터입니다.

## 수정 규칙
1. 화면 수정 → `index.html` 수정 후 `main`에 push하면 GitHub Pages에 자동 반영 (1~2분).
2. 서버 수정 → `apps-script/Code.gs` 수정 + push → Apps Script 편집기에 같은 코드 반영 → **배포 관리 → 기존 배포 수정 → 새 버전**. (새 배포를 만들면 URL이 바뀌므로 금지)
3. 시트 구조(열) 변경 시 `HUB.TABS`, `HUB.HEADER_KO`, 화면의 `applyLive()` 매핑을 함께 수정.
4. 디자인 원칙: MEKICS 글래스 톤 유지, **글자는 한 줄**(길면 … 처리 + 툴팁), 국내/해외 토글 유지.
5. 커밋 메시지는 한국어로 무엇을 바꿨는지 한 줄 요약.
6. 수정 요청은 GitHub Issue로 남기면 다음 작업 때 반영합니다. 처리한 이슈는 커밋에 `#번호`를 적고 닫아 주세요.

## 보안
- 웹 앱 액세스: mekics.com 계정만. 추가로 접속 코드 확인.
- 저장소는 Public입니다. 시트 ID 외의 실제 매출·전략 데이터를 코드에 넣지 마세요.
