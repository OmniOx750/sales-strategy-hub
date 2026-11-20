/**
 * MEKICS Sales Strategy Hub — Google Sheets + Drive 백엔드
 * 화면: GitHub Pages (OmniOx750/sales-strategy-hub)
 *
 * 처음 1회: setup() 실행 → 시트 생성 + 샘플 데이터 + 드라이브 인덱스 + 매일 자동 갱신 트리거
 * 웹 앱 배포: 실행 계정 = 나(mek03), 액세스 = 모든 사용자 → 접속 코드로 보호
 * 드라이브에 자료를 올리면 refreshDriveIndex()가 (매일 자동, 또는 수동 실행) 목록을 갱신합니다.
 */
const HUB = Object.freeze({
  VERSION: '1.0.0',
  TITLE: 'MEKICS Sales Strategy Hub DB',
  TZ: 'Asia/Seoul',
  TABS: {
    Products: ['id','group','name','model','icon','stage','driveFolderId','position','usp','active','order'],
    Strategy: ['id','product','scope','region','flag','stage','owner','bid','insurance','purchase','payment','segment','players','positioning','goal1','goal2','goal3','approach','target','actual','lead','quote','won','winRate','memo','updatedAt'],
    Demos: ['date','product','scope','region','customer','owner','result','memo'],
    Competitors: ['product','competitor','isUs','item','value','itemOrder','colOrder'],
    Activities: ['date','type','product','region','title','desc','result','status'],
    Settings: ['key','value','note'],
    _DriveIndex: ['product','folderCode','folderName','folderId','fileName','fileId','mimeType','updated','size']
  },
  HEADER_KO: {
    Products: ['ID','그룹','제품명','모델/설명','아이콘','라이프사이클(1론칭 2개량 3확산)','드라이브 폴더 ID','포지셔닝 문장','특장점( | 구분)','사용','정렬'],
    Strategy: ['ID','제품ID','국내/해외','국가·권역','국기','진행단계(1~3)','담당','입찰','보험체계','구매형태','지불방식','시장 구분','주요 Player','포지셔닝','목표 1단계','목표 2단계','목표 3단계','접근 방법','매출 목표(백만원)','매출 실적(백만원)','Lead','견적','수주','성공률(%)','메모','업데이트'],
    Demos: ['날짜','제품ID','국내/해외','국가·권역','병원/고객','담당','결과','메모'],
    Competitors: ['제품ID','비교 대상','자사 여부','항목','값','항목 순서','열 순서'],
    Activities: ['날짜','유형(출장/학회/보고/자료)','제품ID','국가·권역','제목','내용','결과','상태(예정/완료)'],
    Settings: ['키','값','설명'],
    _DriveIndex: ['제품ID','폴더코드','폴더명','폴더ID','파일명','파일ID','형식','수정일','크기']
  },
  MAX_FILES_PER_FOLDER: 40,
  SEED: {"Products":[["omniox","산소치료","OmniOx","HFT750 · HFT751 · HFT700 고유량 산소치료기","🫁",3,"18A-z8Ifax8gm0uZgQ9YoCx6oGqec_fao","ICU 산소치료의 Value Premium — 글로벌 브랜드급 성능, 합리적 가격","2~80 L/min 광범위 유량 | HF · IV · NIV 라인업 | 일체형 가습 | 보험 인정 기준 대응 | 방사선종양과 호흡관리","TRUE",1],["mv50","인공호흡기","MV50","범용 인공호흡기 · ICU / 이송","🩺",2,"1Z_MiPXTrKOvcTQka4mupAm7H645IM1Cy","ICU 확충 국가의 공공 입찰 표준 장비 — 이송 · ICU 겸용","침습 · 비침습 겸용 | 이송 사용 | 교체형 배터리 | 경량 설계 | HFNC 모드","TRUE",2],["mv2000","인공호흡기","MV2000","인공호흡기","🫀",3,"1K8TCPzRymxMX3knkv6jFrrxbkmNB_7O4","","","TRUE",3],["mtv1000","인공호흡기","MTV1000","이송용 인공호흡기","🚑",3,"1zmvn8UwdLJP15Dp7aP7xuSnD4QTksscS","","","TRUE",4],["mv3000","인공호흡기","MV3000","인공호흡기","🫀",1,"1oTq72RFOk3SmEtLeQEXPTHjbvdutWP08","","","TRUE",5],["lf100","산소치료","LF100","","💨",2,"1pJPyG-EX83cfNetR07vOg57iwh1uoHVs","","","TRUE",6],["humidi","산소치료","Humidi","가습기","💧",2,"1ymyIA5xZc2AaN8wbZ-y--CMPWAZIj0Qg","","","TRUE",7],["pms","환자감시","PMS","환자감시장치 (New · Old)","📈",2,"1rJhL8Pmb36fnavE03F8WXzkGrzXSvDrr","","","TRUE",8],["cms","환자감시","CMS","중앙감시시스템","🖥",2,"1dzgy5aBaa_dB880EVma_GCsWh6gz90Dz","","","TRUE",9],["mp110p","환자감시","Pulse Oximeter","MP110P","📟",1,"1L-gLCHefw53663lziT618w6Ce3iFC0sU","OmniOx · MV50 번들 액세서리 + 단독 보급형","SpO2 · PR 측정 | OLED 디스플레이 | 저전력","TRUE",10],["spo2","환자감시","SpO2 Sensor","","🔌",2,"13RPM8SHMEOCdAOK4fZpBLWJvDs5iWarE","","","TRUE",11],["circuit","소모품 · 액세서리","Circuit","호흡 회로","🧷",2,"157uPZHXzJKys-49_uuweksHP5QX46SNZ","","","TRUE",12],["cannula","소모품 · 액세서리","Cannula","비강 캐뉼라","🧷",2,"1My9RTLPFe1cHRehSlMfDuJgY1RYfpDyS","","","TRUE",13],["nebulizer","소모품 · 액세서리","Nebulizer","","🌫",2,"1qUWHZXzKdHUP0z8Ut0mFAfnWfBKWRv-R","","","TRUE",14],["pfs001","소모품 · 액세서리","PFS001","","📦",1,"14gxrb1QQJ61skwu6HcX0Cb3SwObO5wSO","","","TRUE",15]],"Strategy":[["S1","omniox","국내","상급종합 (수도권)","🇰🇷",3,"국내영업1팀","병원별 구매 심의 · 일부 조달청","HFNC 행위 급여 · 보험인정기준 적용","대리점 경유 납품 · 장비 심의위원회","월말 정산 60~90일","중환자실 / 호흡기내과 / 소아청소년과","수도권 대리점 3곳 · 빅5 병원 KOL · 경쟁사 A 직판","글로벌 브랜드 대체 · 보험 인정 기준 완벽 대응","빅5 레퍼런스 확보","상급종합 점유 확대","751 신모델 전환","KOL 임상 데이터 + 보험인정기준 자료로 교체 수요 공략",2200,2050,40,12,6,52,"샘플","2026-11-19"],["S2","omniox","국내","지방 거점병원","🇰🇷",2,"국내영업2팀","조달청 · 지방의료원 입찰","HFNC 행위 급여","지역 대리점 납품","월말 정산","지방의료원 / 종합병원 / 요양병원","지역 대리점 7곳 (대리점 운영 TOOL)","가격 대비 성능 · A/S 접근성","권역별 대리점 정비","지방의료원 입찰 대응","요양병원 채널","대리점 운영 TOOL로 월별 실적 · 재고 관리",1300,980,35,11,4,41,"샘플","2026-11-17"],["S3","omniox","국내","방사선종양과 · 동물병원","🇰🇷",1,"전략기획팀","병원별 직구매","비급여 / 해당 없음","과별 예산 · 동물병원 원장 결정","일시불 · 리스","대학병원 방사선종양과 / 2차 동물병원","대학병원 3곳 문의 · 동물 응급학회","신규 적응: 호흡 관리(Respiratory Motion) · 수의 HFNC","플라이어 · 학회 광고","데모 3곳","적응증 레퍼런스","학회 광고 + 데모 장비 순회",300,60,14,4,1,20,"샘플","2026-11-11"],["S4","mv50","국내","공공 · 군 병원","🇰🇷",1,"국내영업1팀","조달청 · 국방 조달","인공호흡기 행위 급여","공공 입찰","정부 회계 규정","군 병원 / 공공의료원 / 이송","공공 입찰 대리점","이송 · ICU 겸용 국산 장비","조달 등록","군 병원 시연","공공의료원 입찰","국산 장비 · 신속 A/S 강조",500,120,10,3,0,15,"샘플","2026-11-06"],["S5","omniox","해외","베트남","🇻🇳",2,"장현호","공공 입찰 중심 (성 단위, 연 2회)","VSS 보험 · HFNC 행위 급여","등록 대리점 경유 입찰","L/C 60일 · 대금 지연 주의","Tier1 상급병원 / Tier2 성급 / Tier3 지방","Hanoi Medical Supply(대리점) · Bach Mai(KOL) · 경쟁사 A 직판","Tier1 프리미엄 대체 · 가격 -25%","Tier1 레퍼런스 3곳","성급 입찰 10건·4건 수주","MV50 동반 진입","독점 대리점 + 서비스 파트너, ICU 산소치료 표준화 메시지",1800,1530,62,19,7,38,"샘플","2026-11-18"],["S6","omniox","해외","인도","🇮🇳",1,"김성원","GeM 공공조달 + 사립 체인","PM-JAY · 장비비 미포함","병원 체인 본사 일괄 구매","T/T 선금 30%","Corporate 체인 / Public GeM / Mid-size 사립","MedLine India(대리점) · Apollo 구매위원회","TCO(소모품 절감) 중심 가성비","체인 1곳 평가 장비","체인 내 5개 병원","GeM 등록 · CKD 검토","체인 본사 직접 영업 + 지역 서브딜러",1200,610,48,14,3,22,"샘플","2026-11-15"],["S7","omniox","해외","폴란드","🇵🇱",1,"장현호","병원별 개별 입찰 (EU 조달)","NFZ 공보험 · 장비 병원 예산","병원 입찰 · 유럽 브랜드 선호","T/T 30~60일","대학병원 / 지역병원 / 소아병원","MedPol(대리점 후보) · Warsaw Univ. Hospital","유럽 브랜드 대비 -20% Value Premium","Warsaw Expo · 대리점 3곳 미팅","대학병원 평가 2대","체코·헝가리 확장","전시회 리드 F/U 기반 대리점 발굴",600,180,26,8,1,15,"샘플","2026-11-12"],["S8","omniox","해외","멕시코","🇲🇽",1,"김성원","IMSS · ISSSTE 연방 통합 구매","IMSS 공보험","COFEPRIS 등록 필수","T/T · 지연 가능","Federal / State / Private 그룹","Grupo Salud MX(대리점 후보)","노후 ICU 장비 교체 제안","COFEPRIS 착수","민간 그룹 2곳 시연","IMSS 입찰","인허가 대행 + 민간 우선 진입",500,120,15,5,1,12,"샘플","2026-11-11"],["S9","mv50","해외","이집트","🇪🇬",2,"장현호","UPA 통합조달청 대형 입찰","UHI 단계 도입","정부 입찰 + 군 병원 별도","L/C 90일 · 외화 리스크","Public UPA / Military / Private","Nile Medical Trading(대리점) · UPA · 경쟁사 B 저가","경쟁사 대비 -10~15% 입찰 밴드","EDA 등록·대리점","UPA 2건 수주·군 병원 시연","OmniOx 번들 입찰","ICU 확충 패키지 (인공호흡기+HFNC)",900,860,30,9,4,44,"샘플","2026-11-10"],["S10","mv50","해외","페루","🇵🇪",2,"장현호","EsSalud · MINSA 공공 입찰","EsSalud 근로자 보험","대리점 경유 입찰","T/T 45일","Public / Regional 이송 / Private","Andes Medical(대리점)","고지대 · 이송 겸용 운용성","DIGEMID 등록·첫 수주","EsSalud 재구매","OmniOx 동반","입찰 전문 대리점 + A/S 패키지",400,390,18,5,2,41,"샘플","2026-11-08"],["S11","mv50","해외","베트남","🇻🇳",1,"장현호","공공 입찰 (성 단위)","VSS","OmniOx 대리점 활용","L/C 60일","Tier1 ICU / 이송","Hanoi Medical Supply","OmniOx 고객 대상 교차 판매","등록 신청","OmniOx 고객 시연","번들 입찰","기존 OmniOx 채널 교차 판매",300,40,9,3,0,10,"샘플","2026-11-05"],["S12","mp110p","국내","국내 전체","🇰🇷",1,"국내영업","조달청 · 병원 직구매","해당 없음","대리점 · 온라인","월말 정산","병원 번들 / 재택","국내 대리점 7곳","OmniOx 번들 액세서리","등록 완료","번들 판매","해외 확장","OmniOx · MV50 납품 시 번들",150,20,12,4,0,0,"샘플","2026-11-02"]],"Demos":[["2026-01-05","omniox","국내","상급종합 (수도권)","샘플 병원 1","국내영업1팀","견적 진행","샘플"],["2026-08-08","omniox","국내","상급종합 (수도권)","샘플 병원 2","국내영업1팀","추가 검토","샘플"],["2026-04-11","omniox","국내","상급종합 (수도권)","샘플 병원 3","국내영업1팀","평가 장비 투입","샘플"],["2026-11-14","omniox","국내","상급종합 (수도권)","샘플 병원 4","국내영업1팀","견적 진행","샘플"],["2026-07-17","omniox","국내","상급종합 (수도권)","샘플 병원 5","국내영업1팀","추가 검토","샘플"],["2026-03-20","omniox","국내","상급종합 (수도권)","샘플 병원 6","국내영업1팀","평가 장비 투입","샘플"],["2026-10-23","omniox","국내","상급종합 (수도권)","샘플 병원 7","국내영업1팀","견적 진행","샘플"],["2026-06-26","omniox","국내","상급종합 (수도권)","샘플 병원 8","국내영업1팀","추가 검토","샘플"],["2026-02-06","omniox","국내","상급종합 (수도권)","샘플 병원 9","국내영업1팀","평가 장비 투입","샘플"],["2026-09-09","omniox","국내","상급종합 (수도권)","샘플 병원 10","국내영업1팀","견적 진행","샘플"],["2026-05-12","omniox","국내","상급종합 (수도권)","샘플 병원 11","국내영업1팀","추가 검토","샘플"],["2026-01-15","omniox","국내","상급종합 (수도권)","샘플 병원 12","국내영업1팀","평가 장비 투입","샘플"],["2026-08-18","omniox","국내","상급종합 (수도권)","샘플 병원 13","국내영업1팀","견적 진행","샘플"],["2026-04-21","omniox","국내","상급종합 (수도권)","샘플 병원 14","국내영업1팀","추가 검토","샘플"],["2026-11-24","omniox","국내","상급종합 (수도권)","샘플 병원 15","국내영업1팀","평가 장비 투입","샘플"],["2026-07-27","omniox","국내","상급종합 (수도권)","샘플 병원 16","국내영업1팀","견적 진행","샘플"],["2026-03-07","omniox","국내","상급종합 (수도권)","샘플 병원 17","국내영업1팀","추가 검토","샘플"],["2026-10-10","omniox","국내","상급종합 (수도권)","샘플 병원 18","국내영업1팀","평가 장비 투입","샘플"],["2026-01-05","omniox","국내","지방 거점병원","샘플 병원 1","국내영업2팀","견적 진행","샘플"],["2026-08-08","omniox","국내","지방 거점병원","샘플 병원 2","국내영업2팀","추가 검토","샘플"],["2026-04-11","omniox","국내","지방 거점병원","샘플 병원 3","국내영업2팀","평가 장비 투입","샘플"],["2026-11-14","omniox","국내","지방 거점병원","샘플 병원 4","국내영업2팀","견적 진행","샘플"],["2026-07-17","omniox","국내","지방 거점병원","샘플 병원 5","국내영업2팀","추가 검토","샘플"],["2026-03-20","omniox","국내","지방 거점병원","샘플 병원 6","국내영업2팀","평가 장비 투입","샘플"],["2026-10-23","omniox","국내","지방 거점병원","샘플 병원 7","국내영업2팀","견적 진행","샘플"],["2026-06-26","omniox","국내","지방 거점병원","샘플 병원 8","국내영업2팀","추가 검토","샘플"],["2026-02-06","omniox","국내","지방 거점병원","샘플 병원 9","국내영업2팀","평가 장비 투입","샘플"],["2026-09-09","omniox","국내","지방 거점병원","샘플 병원 10","국내영업2팀","견적 진행","샘플"],["2026-05-12","omniox","국내","지방 거점병원","샘플 병원 11","국내영업2팀","추가 검토","샘플"],["2026-01-05","omniox","국내","방사선종양과 · 동물병원","샘플 병원 1","전략기획팀","견적 진행","샘플"],["2026-08-08","omniox","국내","방사선종양과 · 동물병원","샘플 병원 2","전략기획팀","추가 검토","샘플"],["2026-04-11","omniox","국내","방사선종양과 · 동물병원","샘플 병원 3","전략기획팀","평가 장비 투입","샘플"],["2026-11-14","omniox","국내","방사선종양과 · 동물병원","샘플 병원 4","전략기획팀","견적 진행","샘플"],["2026-01-05","mv50","국내","공공 · 군 병원","샘플 병원 1","국내영업1팀","견적 진행","샘플"],["2026-08-08","mv50","국내","공공 · 군 병원","샘플 병원 2","국내영업1팀","추가 검토","샘플"],["2026-04-11","mv50","국내","공공 · 군 병원","샘플 병원 3","국내영업1팀","평가 장비 투입","샘플"],["2026-01-05","omniox","해외","베트남","샘플 병원 1","장현호","견적 진행","샘플"],["2026-08-08","omniox","해외","베트남","샘플 병원 2","장현호","추가 검토","샘플"],["2026-04-11","omniox","해외","베트남","샘플 병원 3","장현호","평가 장비 투입","샘플"],["2026-11-14","omniox","해외","베트남","샘플 병원 4","장현호","견적 진행","샘플"],["2026-07-17","omniox","해외","베트남","샘플 병원 5","장현호","추가 검토","샘플"],["2026-03-20","omniox","해외","베트남","샘플 병원 6","장현호","평가 장비 투입","샘플"],["2026-10-23","omniox","해외","베트남","샘플 병원 7","장현호","견적 진행","샘플"],["2026-06-26","omniox","해외","베트남","샘플 병원 8","장현호","추가 검토","샘플"],["2026-02-06","omniox","해외","베트남","샘플 병원 9","장현호","평가 장비 투입","샘플"],["2026-09-09","omniox","해외","베트남","샘플 병원 10","장현호","견적 진행","샘플"],["2026-05-12","omniox","해외","베트남","샘플 병원 11","장현호","추가 검토","샘플"],["2026-01-15","omniox","해외","베트남","샘플 병원 12","장현호","평가 장비 투입","샘플"],["2026-08-18","omniox","해외","베트남","샘플 병원 13","장현호","견적 진행","샘플"],["2026-04-21","omniox","해외","베트남","샘플 병원 14","장현호","추가 검토","샘플"],["2026-01-05","omniox","해외","인도","샘플 병원 1","김성원","견적 진행","샘플"],["2026-08-08","omniox","해외","인도","샘플 병원 2","김성원","추가 검토","샘플"],["2026-04-11","omniox","해외","인도","샘플 병원 3","김성원","평가 장비 투입","샘플"],["2026-11-14","omniox","해외","인도","샘플 병원 4","김성원","견적 진행","샘플"],["2026-07-17","omniox","해외","인도","샘플 병원 5","김성원","추가 검토","샘플"],["2026-03-20","omniox","해외","인도","샘플 병원 6","김성원","평가 장비 투입","샘플"],["2026-10-23","omniox","해외","인도","샘플 병원 7","김성원","견적 진행","샘플"],["2026-06-26","omniox","해외","인도","샘플 병원 8","김성원","추가 검토","샘플"],["2026-02-06","omniox","해외","인도","샘플 병원 9","김성원","평가 장비 투입","샘플"],["2026-01-05","omniox","해외","폴란드","샘플 병원 1","장현호","견적 진행","샘플"],["2026-08-08","omniox","해외","폴란드","샘플 병원 2","장현호","추가 검토","샘플"],["2026-04-11","omniox","해외","폴란드","샘플 병원 3","장현호","평가 장비 투입","샘플"],["2026-11-14","omniox","해외","폴란드","샘플 병원 4","장현호","견적 진행","샘플"],["2026-01-05","omniox","해외","멕시코","샘플 병원 1","김성원","견적 진행","샘플"],["2026-08-08","omniox","해외","멕시코","샘플 병원 2","김성원","추가 검토","샘플"],["2026-01-05","mv50","해외","이집트","샘플 병원 1","장현호","견적 진행","샘플"],["2026-08-08","mv50","해외","이집트","샘플 병원 2","장현호","추가 검토","샘플"],["2026-04-11","mv50","해외","이집트","샘플 병원 3","장현호","평가 장비 투입","샘플"],["2026-11-14","mv50","해외","이집트","샘플 병원 4","장현호","견적 진행","샘플"],["2026-07-17","mv50","해외","이집트","샘플 병원 5","장현호","추가 검토","샘플"],["2026-03-20","mv50","해외","이집트","샘플 병원 6","장현호","평가 장비 투입","샘플"],["2026-10-23","mv50","해외","이집트","샘플 병원 7","장현호","견적 진행","샘플"],["2026-01-05","mv50","해외","페루","샘플 병원 1","장현호","견적 진행","샘플"],["2026-08-08","mv50","해외","페루","샘플 병원 2","장현호","추가 검토","샘플"],["2026-04-11","mv50","해외","페루","샘플 병원 3","장현호","평가 장비 투입","샘플"],["2026-11-14","mv50","해외","페루","샘플 병원 4","장현호","견적 진행","샘플"],["2026-07-17","mv50","해외","페루","샘플 병원 5","장현호","추가 검토","샘플"],["2026-01-05","mv50","해외","베트남","샘플 병원 1","장현호","견적 진행","샘플"],["2026-08-08","mv50","해외","베트남","샘플 병원 2","장현호","추가 검토","샘플"]],"Competitors":[["omniox","OmniOx","TRUE","유량 범위","2~80 L/min",1,1],["omniox","OmniOx","TRUE","FiO2","21~100%",2,1],["omniox","OmniOx","TRUE","소아 모드","내장",3,1],["omniox","OmniOx","TRUE","가습","일체형",4,1],["omniox","OmniOx","TRUE","원격 모니터링","지원",5,1],["omniox","OmniOx","TRUE","가격(지수)","100",6,1],["omniox","경쟁사 A","FALSE","유량 범위","2~70 L/min",1,2],["omniox","경쟁사 A","FALSE","FiO2","21~100%",2,2],["omniox","경쟁사 A","FALSE","소아 모드","별도 모델",3,2],["omniox","경쟁사 A","FALSE","가습","일체형",4,2],["omniox","경쟁사 A","FALSE","원격 모니터링","미지원",5,2],["omniox","경쟁사 A","FALSE","가격(지수)","135",6,2],["omniox","경쟁사 B","FALSE","유량 범위","5~60 L/min",1,3],["omniox","경쟁사 B","FALSE","FiO2","30~95%",2,3],["omniox","경쟁사 B","FALSE","소아 모드","미지원",3,3],["omniox","경쟁사 B","FALSE","가습","별도",4,3],["omniox","경쟁사 B","FALSE","원격 모니터링","미지원",5,3],["omniox","경쟁사 B","FALSE","가격(지수)","70",6,3],["mv50","MV50","TRUE","환기 모드","침습·비침습",1,1],["mv50","MV50","TRUE","이송","지원",2,1],["mv50","MV50","TRUE","배터리","교체형",3,1],["mv50","MV50","TRUE","무게","경량",4,1],["mv50","MV50","TRUE","HFNC","지원",5,1],["mv50","MV50","TRUE","가격(지수)","100",6,1],["mv50","경쟁사 A","FALSE","환기 모드","침습·비침습",1,2],["mv50","경쟁사 A","FALSE","이송","지원",2,2],["mv50","경쟁사 A","FALSE","배터리","내장",3,2],["mv50","경쟁사 A","FALSE","무게","중량",4,2],["mv50","경쟁사 A","FALSE","HFNC","옵션",5,2],["mv50","경쟁사 A","FALSE","가격(지수)","140",6,2],["mv50","경쟁사 C","FALSE","환기 모드","침습",1,3],["mv50","경쟁사 C","FALSE","이송","미지원",2,3],["mv50","경쟁사 C","FALSE","배터리","내장",3,3],["mv50","경쟁사 C","FALSE","무게","중량",4,3],["mv50","경쟁사 C","FALSE","HFNC","미지원",5,3],["mv50","경쟁사 C","FALSE","가격(지수)","85",6,3],["mp110p","MP110P","TRUE","측정","SpO2·PR",1,1],["mp110p","MP110P","TRUE","디스플레이","OLED",2,1],["mp110p","MP110P","TRUE","배터리","AAA",3,1],["mp110p","MP110P","TRUE","가격(지수)","100",4,1],["mp110p","경쟁사 D","FALSE","측정","SpO2·PR·PI",1,2],["mp110p","경쟁사 D","FALSE","디스플레이","LED",2,2],["mp110p","경쟁사 D","FALSE","배터리","AAA",3,2],["mp110p","경쟁사 D","FALSE","가격(지수)","90",4,2]],"Activities":[["2026-12-03","학회","omniox","폴란드","Warsaw Medical Expo F/U 미팅","리드 상위 3개 대리점 후속 미팅","","예정"],["2026-12-08","출장","omniox","베트남","성급 입찰 대응 출장","하노이 · 다낭 병원 3곳","","예정"],["2026-11-15","출장","omniox","인도","병원 체인 평가 미팅","Apollo 구매위원회 · 평가 장비 2대","평가 8주 합의","완료"],["2026-11-11","자료","omniox","","방사선종양과 플라이어 배포","신규 적응 참조자료","대학병원 3곳 문의","완료"],["2026-10-14","학회","omniox","폴란드","Warsaw Medical Expo 2026","OmniOx 단독 부스","리드 26건","완료"],["2026-10-02","보고","mv50","이집트","UPA 입찰 결과","MV50 20대","수주","완료"],["2026-09-20","출장","mv50","페루","EsSalud A/S 교육","엔지니어 6명","재구매 입찰 확정","완료"]]}
});

/* ===================== 설치 ===================== */
function setup() {
  const ss = getSpreadsheet_(true);
  Object.keys(HUB.TABS).forEach(name => {
    const sh = ensureSheet_(ss, name);
    if (sh.getLastRow() <= 2 && HUB.SEED[name]) {
      const rows = HUB.SEED[name];
      if (rows.length) sh.getRange(3, 1, rows.length, HUB.TABS[name].length).setValues(rows.map(r => pad_(r, HUB.TABS[name].length)));
    }
  });
  const settings = ss.getSheetByName('Settings');
  if (settings.getLastRow() <= 2) {
    settings.getRange(3, 1, 3, 3).setValues([
      ['accessCode', String(Math.floor(100000 + Math.random() * 900000)), '페이지 접속 코드 (변경 가능)'],
      ['driveRootId', '1pZ_rwDs4bxWHCjZe6B_sM_FZmwQ08DFb', '1. MARKETING MATERIAL 폴더'],
      ['note', '샘플 데이터는 Strategy/Demos/Competitors/Activities 탭의 memo=샘플 행입니다', '']
    ]);
  }
  const first = ss.getSheets()[0];
  if (first.getName() === 'Sheet1' || first.getName() === '시트1') ss.deleteSheet(first);
  refreshDriveIndex();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'refreshDriveIndex').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('refreshDriveIndex').timeBased().everyDays(1).atHour(6).create();
  Logger.log('시트: ' + ss.getUrl());
  Logger.log('접속 코드: ' + getSetting_('accessCode'));
}

function ensureSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  const keys = HUB.TABS[name], ko = HUB.HEADER_KO[name];
  sh.getRange(1, 1, 1, keys.length).setValues([ko]).setFontWeight('bold').setBackground('#192238').setFontColor('#ffffff');
  sh.getRange(2, 1, 1, keys.length).setValues([keys]).setFontColor('#9aa2b5').setFontSize(8);
  sh.setFrozenRows(2);
  if (name === '_DriveIndex') sh.setTabColor('#9aa2b5');
  return sh;
}

/* ===================== API ===================== */
function doGet(e) {
  const p = (e && e.parameter) || {};
  const cb = String(p.callback || '').replace(/[^\w.$]/g, '');
  let out;
  try {
    if (String(p.key || '') !== String(getSetting_('accessCode'))) throw new Error('접속 코드가 올바르지 않습니다.');
    const action = p.action || 'data';
    if (action === 'data') out = { ok: true, version: HUB.VERSION, serverTime: new Date().toISOString(), sheetUrl: getSpreadsheet_().getUrl(), ...readAll_() };
    else if (action === 'refresh') { refreshDriveIndex(); out = { ok: true }; }
    else throw new Error('알 수 없는 요청');
  } catch (err) { out = { ok: false, error: err.message }; }
  const body = cb ? cb + '(' + JSON.stringify(out) + ')' : JSON.stringify(out);
  return ContentService.createTextOutput(body).setMimeType(cb ? ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON);
}

function readAll_() {
  const ss = getSpreadsheet_(), res = {};
  ['Products','Strategy','Demos','Competitors','Activities','_DriveIndex'].forEach(name => {
    const sh = ss.getSheetByName(name), keys = HUB.TABS[name];
    if (!sh || sh.getLastRow() < 3) { res[name] = []; return; }
    const vals = sh.getRange(3, 1, sh.getLastRow() - 2, keys.length).getValues();
    res[name] = vals.filter(r => r.some(v => v !== '' && v !== null)).map(r => {
      const o = {}; keys.forEach((k, i) => { let v = r[i]; if (v instanceof Date) v = Utilities.formatDate(v, HUB.TZ, 'yyyy-MM-dd'); o[k] = v; }); return o;
    });
  });
  res.driveIndex = res._DriveIndex; delete res._DriveIndex;
  res.indexUpdated = PropertiesService.getScriptProperties().getProperty('INDEX_UPDATED') || '';
  return res;
}

/* ===================== 드라이브 인덱스 ===================== */
function refreshDriveIndex() {
  const ss = getSpreadsheet_(), sh = ensureSheet_(ss, '_DriveIndex');
  const prods = readAll_().Products.filter(p => p.driveFolderId && String(p.active).toUpperCase() !== 'FALSE');
  const rows = [];
  prods.forEach(p => {
    let root; try { root = DriveApp.getFolderById(p.driveFolderId); } catch (e) { return; }
    pushFiles_(rows, p.id, '__', '(제품 폴더)', root);
    const subs = root.getFolders();
    while (subs.hasNext()) {
      const f = subs.next(), name = f.getName(), m = name.match(/^(\d{2})/);
      const code = m ? m[1] : '99';
      rows.push([p.id, code, name, f.getId(), '', '', 'folder', '', '']);
      pushFiles_(rows, p.id, code, name, f);
    }
  });
  if (sh.getLastRow() > 2) sh.getRange(3, 1, sh.getLastRow() - 2, HUB.TABS._DriveIndex.length).clearContent();
  if (rows.length) sh.getRange(3, 1, rows.length, rows[0].length).setValues(rows);
  PropertiesService.getScriptProperties().setProperty('INDEX_UPDATED', Utilities.formatDate(new Date(), HUB.TZ, 'yyyy-MM-dd HH:mm'));
  return rows.length;
}

function pushFiles_(rows, pid, code, folderName, folder) {
  const list = [], it = folder.getFiles();
  while (it.hasNext() && list.length < 200) {
    const f = it.next(), n = f.getName();
    if (/^\._|\.lnk$|\.exe$|\.p12$/i.test(n)) continue;
    list.push(f);
  }
  list.sort((a, b) => b.getLastUpdated() - a.getLastUpdated());
  list.slice(0, HUB.MAX_FILES_PER_FOLDER).forEach(f => rows.push([pid, code, folderName, folder.getId(), f.getName(), f.getId(), f.getMimeType(), Utilities.formatDate(f.getLastUpdated(), HUB.TZ, 'yyyy-MM-dd'), f.getSize()]));
}

/* ===================== 유틸 ===================== */
function getSpreadsheet_(create) {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('SHEET_ID');
  if (id) { try { return SpreadsheetApp.openById(id); } catch (e) {} }
  try { const a = SpreadsheetApp.getActiveSpreadsheet(); if (a) { props.setProperty('SHEET_ID', a.getId()); return a; } } catch (e) {}
  if (!create) throw new Error('시트가 없습니다. setup()을 먼저 실행하세요.');
  const ss = SpreadsheetApp.create(HUB.TITLE);
  props.setProperty('SHEET_ID', ss.getId());
  return ss;
}
function getSetting_(key) {
  const sh = getSpreadsheet_().getSheetByName('Settings'); if (!sh || sh.getLastRow() < 3) return '';
  const v = sh.getRange(3, 1, sh.getLastRow() - 2, 2).getValues().find(r => r[0] === key); return v ? v[1] : '';
}
function pad_(r, n) { const a = r.slice(0, n); while (a.length < n) a.push(''); return a; }
function showInfo() { Logger.log(getSpreadsheet_().getUrl()); Logger.log('접속 코드: ' + getSetting_('accessCode')); }
