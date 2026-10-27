/**
 * WeatherOn - 실시간 날씨 웹 애플리케이션
 * 무료 & API Key 불필요 공개 API (Open-Meteo & OpenStreetMap Nominatim) 연동
 */

(() => {
  'use strict';

  // ==========================================
  // 1. 상수 & 도시 사전 & WMO 날씨 코드 매핑
  // ==========================================

  // 국내외 대표 도시 프리셋 (초고속 즉시 매핑 & 자동완성 보조)
  const PRESET_CITIES = [
    { name: '서울', query: '서울', fullName: '서울특별시, 대한민국', country: '대한민국', lat: 37.5665, lon: 126.9780 },
    { name: '부산', query: '부산', fullName: '부산광역시, 대한민국', country: '대한민국', lat: 35.1796, lon: 129.0756 },
    { name: '제주', query: '제주', fullName: '제주특별자치도, 대한민국', country: '대한민국', lat: 33.4996, lon: 126.5312 },
    { name: '인천', query: '인천', fullName: '인천광역시, 대한민국', country: '대한민국', lat: 37.4563, lon: 126.7052 },
    { name: '대구', query: '대구', fullName: '대구광역시, 대한민국', country: '대한민국', lat: 35.8714, lon: 128.6014 },
    { name: '대전', query: '대전', fullName: '대전광역시, 대한민국', country: '대한민국', lat: 36.3504, lon: 127.3845 },
    { name: '광주', query: '광주', fullName: '광주광역시, 대한민국', country: '대한민국', lat: 35.1595, lon: 126.8526 },
    { name: '울산', query: '울산', fullName: '울산광역시, 대한민국', country: '대한민국', lat: 35.5384, lon: 129.3114 },
    { name: '세종', query: '세종', fullName: '세종특별자치시, 대한민국', country: '대한민국', lat: 36.4800, lon: 127.2890 },
    { name: '수원', query: '수원', fullName: '경기도 수원시, 대한민국', country: '대한민국', lat: 37.2636, lon: 127.0286 },
    { name: '성남', query: '성남', fullName: '경기도 성남시, 대한민국', country: '대한민국', lat: 37.4200, lon: 127.1265 },
    { name: '고양', query: '고양', fullName: '경기도 고양시, 대한민국', country: '대한민국', lat: 37.6584, lon: 126.8320 },
    { name: '용인', query: '용인', fullName: '경기도 용인시, 대한민국', country: '대한민국', lat: 37.2411, lon: 127.1776 },
    { name: '강릉', query: '강릉', fullName: '강원특별자치도 강릉시, 대한민국', country: '대한민국', lat: 37.7519, lon: 128.8761 },
    { name: '춘천', query: '춘천', fullName: '강원특별자치도 춘천시, 대한민국', country: '대한민국', lat: 37.8813, lon: 127.7298 },
    { name: '청주', query: '청주', fullName: '충청북도 청주시, 대한민국', country: '대한민국', lat: 36.6424, lon: 127.4890 },
    { name: '천안', query: '천안', fullName: '충청남도 천안시, 대한민국', country: '대한민국', lat: 36.8151, lon: 127.1139 },
    { name: '전주', query: '전주', fullName: '전북특별자치도 전주시, 대한민국', country: '대한민국', lat: 35.8242, lon: 127.1480 },
    { name: '포항', query: '포항', fullName: '경상북도 포항시, 대한민국', country: '대한민국', lat: 36.0190, lon: 129.3435 },
    { name: '창원', query: '창원', fullName: '경상남도 창원시, 대한민국', country: '대한민국', lat: 35.2280, lon: 128.6811 },
    { name: '여수', query: '여수', fullName: '전라남도 여수시, 대한민국', country: '대한민국', lat: 34.7604, lon: 127.6622 },
    // 해외 주요 도시
    { name: '도쿄', query: '도쿄', fullName: '도쿄, 일본', country: '일본', lat: 35.6762, lon: 139.6503 },
    { name: '오사카', query: '오사카', fullName: '오사카, 일본', country: '일본', lat: 34.6937, lon: 135.5023 },
    { name: 'New York', query: 'New York', fullName: 'New York, 미국', country: '미국', lat: 40.7128, lon: -74.0060 },
    { name: 'Paris', query: 'Paris', fullName: 'Paris, 프랑스', country: '프랑스', lat: 48.8566, lon: 2.3522 },
    { name: 'London', query: 'London', fullName: 'London, 영국', country: '영국', lat: 51.5074, lon: -0.1278 },
    { name: 'Sydney', query: 'Sydney', fullName: 'Sydney, 호주', country: '호주', lat: -33.8688, lon: 151.2093 }
  ];

  // WMO 기상 코드(0~99) 해석 매핑
  const WMO_CODES = {
    0: { desc: '맑음', dayEmoji: '☀️', nightEmoji: '🌙', theme: 'clear', tip: '화창하고 맑은 하늘이에요! 산책이나 외출하기 좋아요.' },
    1: { desc: '대체로 맑음', dayEmoji: '🌤️', nightEmoji: '🌤️', theme: 'clear', tip: '햇살이 기분 좋게 비치는 날씨입니다.' },
    2: { desc: '구름 조금', dayEmoji: '⛅', nightEmoji: '⛅', theme: 'cloudy', tip: '구름 사이로 햇살이 내리쬐는 쾌적한 날씨예요.' },
    3: { desc: '흐림', dayEmoji: '☁️', nightEmoji: '☁️', theme: 'cloudy', tip: '하늘에 구름이 가득 차 있어요. 자외선 걱정 없는 날입니다.' },
    45: { desc: '안개', dayEmoji: '🌫️', nightEmoji: '🌫️', theme: 'fog', tip: '시야가 흐리니 운전 시 차간 거리를 유지하세요.' },
    48: { desc: '짙은 안개 및 서리', dayEmoji: '🌫️', nightEmoji: '🌫️', theme: 'fog', tip: '짙은 안개가 끼어 있어요. 안전 운전에 각별히 유의하세요.' },
    51: { desc: '가벼운 이슬비', dayEmoji: '🌦️', nightEmoji: '🌦️', theme: 'rain', tip: '보슬보슬 이슬비가 내립니다. 작은 우산을 챙기세요.' },
    53: { desc: '이슬비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'rain', tip: '촉촉한 이슬비가 내리고 있어요.' },
    55: { desc: '강한 이슬비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'rain', tip: '우산이나 방수 외투를 꼭 챙기세요.' },
    56: { desc: '어는 이슬비', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'rain', tip: '살얼음이 생길 수 있으니 발걸음에 주의하세요.' },
    57: { desc: '강한 어는 이슬비', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'rain', tip: '도로 결빙 위험이 있으니 미끄럼에 주의하세요.' },
    61: { desc: '약한 비', dayEmoji: '🌦️', nightEmoji: '🌦️', theme: 'rain', tip: '비가 가볍게 내리고 있어요. 우산을 챙겨 외출하세요.' },
    63: { desc: '보통 비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'rain', tip: '비가 지속적으로 내리고 있으니 우산이 필요합니다.' },
    65: { desc: '강한 비', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'rain', tip: '많은 비가 쏟아집니다. 실내 활동을 권장해요.' },
    66: { desc: '약한 어는 비', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'snow', tip: '비가 얼어붙고 있어요. 빙판길을 조심하세요.' },
    67: { desc: '강한 어는 비', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'snow', tip: '도로가 매우 미끄러우니 보행과 운전에 주의하세요.' },
    71: { desc: '약한 눈', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'snow', tip: '부드러운 눈송이가 흩날리고 있어요 ❄️' },
    73: { desc: '보통 눈', dayEmoji: '❄️', nightEmoji: '❄️', theme: 'snow', tip: '눈이 차분히 내리고 있어요. 따뜻하게 챙겨 입으세요.' },
    75: { desc: '강한 눈', dayEmoji: '❄️', nightEmoji: '❄️', theme: 'snow', tip: '대설 주의! 도로 결빙 및 시야 확보에 유의하세요.' },
    77: { desc: '싸락눈', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'snow', tip: '작은 얼음 알갱이 눈이 내리고 있습니다.' },
    80: { desc: '약한 소나기', dayEmoji: '🌦️', nightEmoji: '🌦️', theme: 'rain', tip: '갑작스러운 소나기가 올 수 있으니 우산을 챙기세요.' },
    81: { desc: '보통 소나기', dayEmoji: '🌧️', nightEmoji: '🌧️', theme: 'rain', tip: '한바탕 세찬 소나기가 내리고 있습니다.' },
    82: { desc: '격렬한 소나기', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'thunderstorm', tip: '짧고 굵은 폭우가 쏟아지고 있으니 안전한 곳에 머무세요.' },
    85: { desc: '약한 눈 소나기', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'snow', tip: '간헐적인 눈 소나기가 내립니다.' },
    86: { desc: '강한 눈 소나기', dayEmoji: '🌨️', nightEmoji: '🌨️', theme: 'snow', tip: '세찬 눈발이 날리고 있으니 방한에 신경 쓰세요.' },
    95: { desc: '뇌우 (천둥번개)', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'thunderstorm', tip: '천둥과 번개가 치고 있습니다. 안전한 실내로 이동하세요.' },
    96: { desc: '우박을 동반한 약한 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'thunderstorm', tip: '우박 및 돌풍에 주의하시고 낙하물에 유의하세요.' },
    99: { desc: '우박을 동반한 강한 뇌우', dayEmoji: '⛈️', nightEmoji: '⛈️', theme: 'thunderstorm', tip: '매우 격렬한 뇌우와 우박이 발생하고 있으니 외출을 삼가세요.' }
  };

  // 요일 한글 변환
  const DAYS_KR = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

  // ==========================================
  // 2. DOM 요소 참조
  // ==========================================
  const searchForm = document.getElementById('searchForm');
  const cityInput = document.getElementById('cityInput');
  const btnSearch = document.getElementById('btnSearch');
  const btnClearSearch = document.getElementById('btnClearSearch');
  const btnGeoLocation = document.getElementById('btnGeoLocation');
  const btnRetry = document.getElementById('btnRetry');
  const btnUnitC = document.getElementById('btnUnitC');
  const btnUnitF = document.getElementById('btnUnitF');
  const liveClockTime = document.getElementById('currentTime');
  const bgEffects = document.getElementById('bgEffects');
  const suggestionsDropdown = document.getElementById('suggestionsDropdown');

  // 히스토리 & 퀵 태그
  const recentSearchesContainer = document.getElementById('recentSearchesContainer');
  const recentTags = document.getElementById('recentTags');
  const btnClearHistory = document.getElementById('btnClearHistory');

  // 상태 컨테이너
  const loadingState = document.getElementById('loadingState');
  const loadingText = document.getElementById('loadingText');
  const errorState = document.getElementById('errorState');
  const errorTitle = document.getElementById('errorTitle');
  const errorMessage = document.getElementById('errorMessage');
  const weatherDisplay = document.getElementById('weatherDisplay');

  // 메인 날씨 카드 필드
  const cityNameEl = document.getElementById('cityName');
  const countryBadgeEl = document.getElementById('countryBadge');
  const localDateTimeEl = document.getElementById('localDateTime');
  const updateTimeTextEl = document.getElementById('updateTimeText');
  const mainTempEl = document.getElementById('mainTemp');
  const mainUnitSymbolEl = document.getElementById('mainUnitSymbol');
  const apparentTempEl = document.getElementById('apparentTemp');
  const minTempEl = document.getElementById('minTemp');
  const maxTempEl = document.getElementById('maxTemp');
  const weatherEmojiEl = document.getElementById('weatherEmoji');
  const weatherDescEl = document.getElementById('weatherDesc');
  const weatherSummaryBadgeEl = document.getElementById('weatherSummaryBadge');

  // 메트릭 필드
  const humidityValEl = document.getElementById('humidityVal');
  const humidityStatusEl = document.getElementById('humidityStatus');
  const windValEl = document.getElementById('windVal');
  const windUnitEl = document.getElementById('windUnit');
  const windStatusEl = document.getElementById('windStatus');
  const precipValEl = document.getElementById('precipVal');
  const precipStatusEl = document.getElementById('precipStatus');
  const pressureValEl = document.getElementById('pressureVal');
  const pressureStatusEl = document.getElementById('pressureStatus');
  const dayNightValEl = document.getElementById('dayNightVal');
  const dayNightStatusEl = document.getElementById('dayNightStatus');
  const coordsValEl = document.getElementById('coordsVal');

  // 예보 리스트
  const hourlyForecastList = document.getElementById('hourlyForecastList');
  const dailyForecastList = document.getElementById('dailyForecastList');

  // ==========================================
  // 3. 상태 관리 변수
  // ==========================================
  let currentUnit = localStorage.getItem('weatheron_unit') || 'c'; // 'c' or 'f'
  let cachedWeatherData = null; // 단위 변환 시 재활용
  let lastSearchedQuery = '서울';
  let recentSearches = JSON.parse(localStorage.getItem('weatheron_recent') || '[]');

  // ==========================================
  // 4. 유틸리티 함수
  // ==========================================

  // 온도 변환 함수
  function formatTemp(celsius, unit = currentUnit) {
    if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
    if (unit === 'f') {
      const fahrenheit = (celsius * 9) / 5 + 32;
      return Math.round(fahrenheit);
    }
    return Math.round(celsius);
  }

  // WMO 날씨 데이터 정보 추출
  function getWeatherInfo(code, isDay = 1) {
    const item = WMO_CODES[code] || {
      desc: '기타 날씨',
      dayEmoji: '🌡️',
      nightEmoji: '🌡️',
      theme: 'clear',
      tip: '현재 날씨 상태를 확인해보세요.'
    };

    return {
      desc: item.desc,
      emoji: isDay ? item.dayEmoji : item.nightEmoji,
      theme: item.theme,
      tip: item.tip,
      isDay: Boolean(isDay)
    };
  }

  // 상태 전환 유틸리티
  function showLoading(message = '날씨 정보를 가져오는 중입니다...') {
    loadingText.textContent = message;
    loadingState.hidden = false;
    errorState.hidden = true;
    weatherDisplay.hidden = true;
  }

  function showError(title, message) {
    errorTitle.textContent = title;
    errorMessage.textContent = message;
    loadingState.hidden = true;
    errorState.hidden = false;
    weatherDisplay.hidden = true;
  }

  function showWeather() {
    loadingState.hidden = true;
    errorState.hidden = true;
    weatherDisplay.hidden = false;
  }

  // 배경 효과 및 테마 변경
  function applyTheme(themeType, isDay) {
    const body = document.body;
    // 테마 클래스 초기화
    body.className = '';

    let themeClass = 'theme-clear-day';
    if (themeType === 'clear') {
      themeClass = isDay ? 'theme-clear-day' : 'theme-clear-night';
    } else if (themeType === 'cloudy') {
      themeClass = 'theme-cloudy';
    } else if (themeType === 'rain') {
      themeClass = 'theme-rain';
    } else if (themeType === 'snow') {
      themeClass = 'theme-snow';
    } else if (themeType === 'thunderstorm') {
      themeClass = 'theme-thunderstorm';
    } else if (themeType === 'fog') {
      themeClass = 'theme-fog';
    }

    body.classList.add(themeClass);

    // 파티클 생성
    generateParticles(themeType, isDay);
  }

  // 동적 파티클 효과 (비, 눈, 밤하늘 별, 햇살)
  function generateParticles(themeType, isDay) {
    bgEffects.innerHTML = '';

    if (themeType === 'rain' || themeType === 'thunderstorm') {
      const dropCount = 35;
      for (let i = 0; i < dropCount; i++) {
        const drop = document.createElement('div');
        drop.className = 'particle';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.top = `${Math.random() * -20}%`;
        drop.style.width = '2px';
        drop.style.height = `${12 + Math.random() * 18}px`;
        drop.style.background = 'linear-gradient(to bottom, transparent, rgba(147, 197, 253, 0.7))';
        drop.style.animation = `rainDrop ${0.5 + Math.random() * 0.5}s linear infinite`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        bgEffects.appendChild(drop);
      }
    } else if (themeType === 'snow') {
      const flakeCount = 30;
      for (let i = 0; i < flakeCount; i++) {
        const flake = document.createElement('div');
        flake.className = 'particle';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.top = `${Math.random() * -20}%`;
        flake.style.width = `${4 + Math.random() * 6}px`;
        flake.style.height = flake.style.width;
        flake.style.borderRadius = '50%';
        flake.style.background = 'rgba(255, 255, 255, 0.8)';
        flake.style.filter = 'blur(1px)';
        flake.style.animation = `snowFlake ${3 + Math.random() * 4}s linear infinite`;
        flake.style.animationDelay = `${Math.random() * 4}s`;
        bgEffects.appendChild(flake);
      }
    } else if (!isDay && (themeType === 'clear' || themeType === 'cloudy')) {
      // 밤하늘 반짝이는 별 효과
      const starCount = 35;
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'particle';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 80}%`;
        star.style.width = `${1 + Math.random() * 3}px`;
        star.style.height = star.style.width;
        star.style.borderRadius = '50%';
        star.style.background = '#ffffff';
        star.style.opacity = (0.2 + Math.random() * 0.7).toString();
        star.style.animation = `pulse ${2 + Math.random() * 3}s ease-in-out infinite alternate`;
        star.style.animationDelay = `${Math.random() * 3}s`;
        bgEffects.appendChild(star);
      }
    }
  }

  // 실시간 시계 업데이트
  function updateLiveClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    liveClockTime.textContent = `${hours}:${minutes}:${seconds}`;
  }
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // ==========================================
  // 5. 지오코딩 및 API 통신 (무료 공개 API)
  // ==========================================

  /**
   * 사용자가 입력한 지역명으로 위도/경도 검색
   * 1순위: 로컬 사전 완전일치
   * 2순위: OpenStreetMap Nominatim API (한국어 & 전 세계 완벽 지원, 무키)
   * 3순위: Open-Meteo Geocoding API (영문/글로벌 보조)
   */
  async function searchLocation(query) {
    const trimmed = query.trim();
    if (!trimmed) {
      throw new Error('EMPTY_QUERY');
    }

    // 1. 프리셋 도시 사전 확인
    const matchedPreset = PRESET_CITIES.find(c => 
      c.name.toLowerCase() === trimmed.toLowerCase() || 
      c.query.toLowerCase() === trimmed.toLowerCase()
    );
    if (matchedPreset) {
      return {
        name: matchedPreset.name,
        displayName: matchedPreset.fullName,
        country: matchedPreset.country,
        lat: matchedPreset.lat,
        lon: matchedPreset.lon
      };
    }

    // 2. OpenStreetMap Nominatim API 호출
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmed)}&format=json&limit=5&addressdetails=1`;
      const response = await fetch(nominatimUrl, {
        headers: {
          'Accept-Language': 'ko,en;q=0.9',
          'User-Agent': 'WeatherOnApp/1.0 (Contact: weather-app-user)'
        }
      });

      if (response.ok) {
        const results = await response.json();
        if (results && results.length > 0) {
          const first = results[0];
          const address = first.address || {};
          
          // 표시 이름 가공
          let cityName = first.name || address.city || address.town || address.county || trimmed;
          let country = address.country || '';

          return {
            name: cityName,
            displayName: first.display_name,
            country: country,
            lat: parseFloat(first.lat),
            lon: parseFloat(first.lon)
          };
        }
      }
    } catch (e) {
      console.warn('Nominatim Geocoding request failed, trying fallback...', e);
    }

    // 3. Fallback: Open-Meteo Geocoding
    try {
      const openMeteoGeoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=5&format=json`;
      const response = await fetch(openMeteoGeoUrl);
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const res = data.results[0];
          return {
            name: res.name,
            displayName: `${res.name}, ${res.admin1 ? res.admin1 + ', ' : ''}${res.country}`,
            country: res.country || '',
            lat: res.latitude,
            lon: res.longitude
          };
        }
      }
    } catch (e) {
      console.warn('Open-Meteo Geocoding failed:', e);
    }

    throw new Error('NOT_FOUND');
  }

  /**
   * 위도/경도를 통한 역지오코딩 (내 위치 GPS 좌표 -> 지역명)
   */
  async function reverseGeocode(lat, lon) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
      const response = await fetch(url, {
        headers: {
          'Accept-Language': 'ko,en;q=0.9',
          'User-Agent': 'WeatherOnApp/1.0'
        }
      });
      if (response.ok) {
        const data = await response.json();
        const address = data.address || {};
        const cityName = address.city || address.town || address.borough || address.suburb || address.county || '내 위치';
        const country = address.country || '대한민국';
        return {
          name: cityName,
          displayName: data.display_name,
          country: country
        };
      }
    } catch (e) {
      console.warn('Reverse geocoding error:', e);
    }

    return {
      name: '내 현재 위치',
      displayName: `위도 ${lat.toFixed(2)}°, 경도 ${lon.toFixed(2)}°`,
      country: '현재 위치'
    };
  }

  /**
   * Open-Meteo API 날씨 데이터 조회 (무료, No Key)
   */
  async function fetchWeatherData(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('API_ERROR');
    }
    return await response.json();
  }

  // ==========================================
  // 6. UI 렌더링 함수
  // ==========================================

  /**
   * 날씨 데이터를 화면에 렌더링
   */
  function renderWeather(location, weather) {
    cachedWeatherData = { location, weather };

    const current = weather.current;
    const daily = weather.daily;
    const hourly = weather.hourly;

    const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);

    // 1. 테마 적용
    applyTheme(weatherInfo.theme, current.is_day);

    // 2. 지역 정보 헤더
    cityNameEl.textContent = location.name;
    countryBadgeEl.textContent = location.country || '기상 관측소';

    // 현지 시간 표시
    const now = new Date();
    const dayName = DAYS_KR[now.getDay()];
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    localDateTimeEl.textContent = `${year}년 ${month}월 ${date}일 ${dayName} ${hours}:${minutes}`;

    // 최종 업데이트 시각
    updateTimeTextEl.textContent = `방금 전 업데이트 (${hours}:${minutes})`;

    // 3. 기온 & 메인 비주얼
    const tempVal = formatTemp(current.temperature_2m);
    mainTempEl.textContent = `${tempVal}°`;
    mainUnitSymbolEl.textContent = currentUnit.toUpperCase();

    const apparentVal = formatTemp(current.apparent_temperature);
    apparentTempEl.textContent = `${apparentVal}°${currentUnit.toUpperCase()}`;

    // 당일 최저/최고
    const minVal = formatTemp(daily.temperature_2m_min[0]);
    const maxVal = formatTemp(daily.temperature_2m_max[0]);
    minTempEl.textContent = `${minVal}°`;
    maxTempEl.textContent = `${maxVal}°`;

    // 날씨 아이콘 & 설명
    weatherEmojiEl.textContent = weatherInfo.emoji;
    weatherDescEl.textContent = weatherInfo.desc;
    weatherSummaryBadgeEl.textContent = weatherInfo.tip;

    // 4. 상세 기상 지표 6종
    // 4-1. 습도
    const humidity = current.relative_humidity_2m;
    humidityValEl.textContent = humidity;
    if (humidity < 35) {
      humidityStatusEl.textContent = '다소 건조해요';
    } else if (humidity <= 65) {
      humidityStatusEl.textContent = '쾌적하고 적당해요';
    } else {
      humidityStatusEl.textContent = '습도가 높은 편이에요';
    }

    // 4-2. 풍속
    const windSpeed = current.wind_speed_10m;
    if (currentUnit === 'f') {
      const mph = (windSpeed * 0.621371).toFixed(1);
      windValEl.textContent = mph;
      windUnitEl.textContent = 'mph';
    } else {
      windValEl.textContent = windSpeed.toFixed(1);
      windUnitEl.textContent = 'km/h';
    }

    if (windSpeed < 5) {
      windStatusEl.textContent = '고요한 바람';
    } else if (windSpeed < 15) {
      windStatusEl.textContent = '기분 좋은 산들바람';
    } else if (windSpeed < 30) {
      windStatusEl.textContent = '약간 강한 바람';
    } else {
      windStatusEl.textContent = '강풍 주의';
    }

    // 4-3. 강수량
    const precip = current.precipitation;
    precipValEl.textContent = precip.toFixed(1);
    if (precip === 0) {
      precipStatusEl.textContent = '비 소식 없음';
    } else if (precip < 2) {
      precipStatusEl.textContent = '약한 강수';
    } else {
      precipStatusEl.textContent = '우산 필수 지참';
    }

    // 4-4. 기압
    const pressure = Math.round(current.surface_pressure);
    pressureValEl.textContent = pressure;
    if (pressure > 1013) {
      pressureStatusEl.textContent = '고기압 (대기 맑고 안정)';
    } else if (pressure > 1000) {
      pressureStatusEl.textContent = '표준 기압 (온화함)';
    } else {
      pressureStatusEl.textContent = '저기압 (비/구름 가능성)';
    }

    // 4-5. 주간/야간
    if (current.is_day) {
      dayNightValEl.textContent = '낮 시간 (주간)';
      dayNightStatusEl.textContent = '햇살이 비치는 시간입니다';
    } else {
      dayNightValEl.textContent = '밤 시간 (야간)';
      dayNightStatusEl.textContent = '달빛과 별이 빛나는 밤입니다';
    }

    // 4-6. 위치 좌표
    const latStr = `${Math.abs(location.lat).toFixed(2)}°${location.lat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(location.lon).toFixed(2)}°${location.lon >= 0 ? 'E' : 'W'}`;
    coordsValEl.textContent = `${latStr}, ${lonStr}`;

    // 5. 시간별 예보 (24시간)
    renderHourlyForecast(hourly);

    // 6. 주간 예보 (7일)
    renderDailyForecast(daily);

    // 화면 표시
    showWeather();
  }

  /**
   * 24시간 시간별 예보 렌더링
   */
  function renderHourlyForecast(hourly) {
    hourlyForecastList.innerHTML = '';
    const now = new Date();
    const currentHourStr = now.toISOString().slice(0, 13); // 'YYYY-MM-DDTHH'

    // 현재 시각 인덱스 찾기
    let startIndex = hourly.time.findIndex(t => t.startsWith(currentHourStr));
    if (startIndex === -1) startIndex = 0;

    // 앞으로 24시간 데이터 슬라이스
    const count = 24;
    for (let i = 0; i < count; i++) {
      const idx = startIndex + i;
      if (idx >= hourly.time.length) break;

      const timeIso = hourly.time[idx];
      const timeDate = new Date(timeIso);
      const hour = timeDate.getHours();
      const hourLabel = i === 0 ? '지금' : `${hour}시`;

      const code = hourly.weather_code[idx];
      const isDayTime = hour >= 6 && hour < 19 ? 1 : 0;
      const info = getWeatherInfo(code, isDayTime);

      const temp = formatTemp(hourly.temperature_2m[idx]);
      const pop = hourly.precipitation_probability ? hourly.precipitation_probability[idx] : 0;

      const card = document.createElement('div');
      card.className = `hourly-card ${i === 0 ? 'current-hour' : ''}`;
      card.setAttribute('role', 'listitem');
      card.innerHTML = `
        <span class="hourly-time">${hourLabel}</span>
        <span class="hourly-emoji" title="${info.desc}">${info.emoji}</span>
        <span class="hourly-temp">${temp}°</span>
        ${pop > 10 ? `<span class="hourly-pop">💧${pop}%</span>` : ''}
      `;
      hourlyForecastList.appendChild(card);
    }
  }

  /**
   * 7일간 일일 예보 렌더링
   */
  function renderDailyForecast(daily) {
    dailyForecastList.innerHTML = '';

    // 최저-최고 기온 바 비율 계산을 위한 전역 최소/최대
    const allMins = daily.temperature_2m_min;
    const allMaxs = daily.temperature_2m_max;
    const minGlobal = Math.min(...allMins);
    const maxGlobal = Math.max(...allMaxs);
    const rangeGlobal = maxGlobal - minGlobal || 1;

    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      const d = new Date(dateStr + 'T00:00:00');
      let dayName = DAYS_KR[d.getDay()];
      if (i === 0) dayName = '오늘';
      else if (i === 1) dayName = '내일';

      const monthDate = `${d.getMonth() + 1}.${d.getDate()}`;
      const code = daily.weather_code[i];
      const info = getWeatherInfo(code, 1);

      const minVal = formatTemp(daily.temperature_2m_min[i]);
      const maxVal = formatTemp(daily.temperature_2m_max[i]);

      // 가로 바 퍼센트 계산
      const barLeft = ((daily.temperature_2m_min[i] - minGlobal) / rangeGlobal) * 100;
      const barRight = ((maxGlobal - daily.temperature_2m_max[i]) / rangeGlobal) * 100;
      const barWidth = Math.max(100 - barLeft - barRight, 8);

      const row = document.createElement('div');
      row.className = 'daily-row';
      row.setAttribute('role', 'listitem');
      row.innerHTML = `
        <div class="daily-day-info">
          <span class="daily-day-name">${dayName}</span>
          <span class="daily-date">${monthDate}</span>
        </div>
        <div class="daily-weather-info">
          <span class="daily-emoji" title="${info.desc}">${info.emoji}</span>
          <span class="daily-weather-desc">${info.desc}</span>
        </div>
        <div class="daily-bar-container">
          <div class="daily-bar-fill" style="left: ${barLeft}%; width: ${barWidth}%;"></div>
        </div>
        <div class="daily-temps">
          <span class="daily-min">${minVal}°</span>
          <span class="daily-max">${maxVal}°</span>
        </div>
      `;
      dailyForecastList.appendChild(row);
    }
  }

  // ==========================================
  // 7. 검색 및 사용자 인터랙션 핸들러
  // ==========================================

  /**
   * 지역 검색 실행
   */
  async function performSearch(query) {
    if (!query || !query.trim()) {
      showError('검색어를 입력해주세요', '날씨를 확인하고 싶은 도시나 지역명을 입력창에 작성해주세요.');
      return;
    }

    const trimmed = query.trim();
    lastSearchedQuery = trimmed;
    closeDropdown();

    showLoading(`'${trimmed}' 지역의 날씨 정보를 조회하고 있습니다...`);

    try {
      // 1. 지오코딩으로 위경도 찾기
      const location = await searchLocation(trimmed);

      // 2. 날씨 데이터 조회
      const weather = await fetchWeatherData(location.lat, location.lon);

      // 3. UI 렌더링
      renderWeather(location, weather);

      // 4. 최근 검색어 저장
      saveRecentSearch(location.name);

    } catch (err) {
      console.error('Weather query error:', err);
      if (err.message === 'NOT_FOUND') {
        showError(
          `'${trimmed}' 지역을 찾을 수 없습니다`,
          '입력하신 지역명의 철자가 올바른지 확인해주세요. 시, 군, 구 또는 유명 도시명을 입력하시면 더 정확한 결과를 얻으실 수 있습니다.'
        );
      } else {
        showError(
          '날씨 데이터를 가져오지 못했습니다',
          '일시적인 네트워크 지연이 발생했거나 날씨 서비스에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
        );
      }
    }
  }

  /**
   * GPS 내 현재 위치 기반 조회
   */
  function handleGeoLocation() {
    if (!navigator.geolocation) {
      alert('현재 브라우저에서는 위치 정보(GPS) 서비스를 지원하지 않습니다.');
      return;
    }

    showLoading('현재 계신 위치의 좌표를 확인하는 중입니다...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        showLoading('현재 위치의 기상 데이터를 가져오는 중입니다...');

        try {
          // 역지오코딩으로 현재 위치 명칭 획득
          const location = await reverseGeocode(lat, lon);
          location.lat = lat;
          location.lon = lon;

          // 날씨 데이터 요청
          const weather = await fetchWeatherData(lat, lon);
          renderWeather(location, weather);
          saveRecentSearch(location.name);
        } catch (e) {
          console.error(e);
          showError('현재 위치의 날씨를 가져오지 못했습니다', '네트워크 상태를 확인하고 잠시 후 다시 시도해주세요.');
        }
      },
      (geoError) => {
        let msg = '위치 접근 권한이 거부되었거나 위치를 확인할 수 없습니다.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = '브라우저에서 위치 정보 접근 권한이 허용되어 있는지 확인해주세요.';
        }
        showError('위치 정보를 가져올 수 없습니다', msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  // ==========================================
  // 8. 최근 검색어 & 자동완성 기능
  // ==========================================

  function saveRecentSearch(cityName) {
    if (!cityName) return;
    // 중복 제거 및 맨 앞 추가
    recentSearches = recentSearches.filter(item => item !== cityName);
    recentSearches.unshift(cityName);
    if (recentSearches.length > 7) {
      recentSearches.pop();
    }
    localStorage.setItem('weatheron_recent', JSON.stringify(recentSearches));
    renderRecentSearches();
  }

  function removeRecentSearch(cityName, e) {
    if (e) e.stopPropagation();
    recentSearches = recentSearches.filter(item => item !== cityName);
    localStorage.setItem('weatheron_recent', JSON.stringify(recentSearches));
    renderRecentSearches();
  }

  function clearAllRecentSearches() {
    recentSearches = [];
    localStorage.removeItem('weatheron_recent');
    renderRecentSearches();
  }

  function renderRecentSearches() {
    if (!recentSearches || recentSearches.length === 0) {
      recentSearchesContainer.hidden = true;
      return;
    }

    recentSearchesContainer.hidden = false;
    recentTags.innerHTML = '';

    recentSearches.forEach(city => {
      const tag = document.createElement('span');
      tag.className = 'recent-tag-item';
      tag.innerHTML = `
        <span>${city}</span>
        <span class="recent-tag-remove" title="삭제">&times;</span>
      `;
      tag.addEventListener('click', () => {
        cityInput.value = city;
        performSearch(city);
      });

      const removeBtn = tag.querySelector('.recent-tag-remove');
      removeBtn.addEventListener('click', (e) => removeRecentSearch(city, e));

      recentTags.appendChild(tag);
    });
  }

  // 검색 인풋 타이핑 시 자동 완성 제안
  cityInput.addEventListener('input', () => {
    const val = cityInput.value.trim().toLowerCase();
    btnClearSearch.hidden = val.length === 0;

    if (!val) {
      closeDropdown();
      return;
    }

    // 프리셋 사전에서 매칭
    const matches = PRESET_CITIES.filter(c => 
      c.name.toLowerCase().includes(val) || 
      c.fullName.toLowerCase().includes(val) ||
      c.query.toLowerCase().includes(val)
    ).slice(0, 5);

    if (matches.length > 0) {
      suggestionsDropdown.innerHTML = '';
      matches.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
          <div class="suggestion-main">
            <span class="suggestion-name">${item.name}</span>
            <span class="suggestion-sub">${item.fullName}</span>
          </div>
          <span style="font-size: 0.8rem; color: var(--accent-cyan);">선택</span>
        `;
        div.addEventListener('click', () => {
          cityInput.value = item.name;
          closeDropdown();
          performSearch(item.name);
        });
        suggestionsDropdown.appendChild(div);
      });
      suggestionsDropdown.hidden = false;
    } else {
      closeDropdown();
    }
  });

  function closeDropdown() {
    suggestionsDropdown.hidden = true;
    suggestionsDropdown.innerHTML = '';
  }

  // 외부 클릭 시 드롭다운 닫기
  document.addEventListener('click', (e) => {
    if (!searchForm.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  // ==========================================
  // 9. 단위 토글 (°C / °F)
  // ==========================================
  function setUnit(newUnit) {
    if (currentUnit === newUnit) return;
    currentUnit = newUnit;
    localStorage.setItem('weatheron_unit', newUnit);

    btnUnitC.classList.toggle('active', newUnit === 'c');
    btnUnitF.classList.toggle('active', newUnit === 'f');

    // 캐시된 데이터가 있으면 즉시 다시 렌더링
    if (cachedWeatherData) {
      renderWeather(cachedWeatherData.location, cachedWeatherData.weather);
    }
  }

  btnUnitC.addEventListener('click', () => setUnit('c'));
  btnUnitF.addEventListener('click', () => setUnit('f'));

  // ==========================================
  // 10. 이벤트 바인딩 & 초기 실행
  // ==========================================

  // 검색 폼 서밋
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(cityInput.value);
  });

  btnSearch.addEventListener('click', (e) => {
    e.preventDefault();
    performSearch(cityInput.value);
  });

  // 검색어 지우기 버튼
  btnClearSearch.addEventListener('click', () => {
    cityInput.value = '';
    btnClearSearch.hidden = true;
    closeDropdown();
    cityInput.focus();
  });

  // GPS 버튼
  btnGeoLocation.addEventListener('click', handleGeoLocation);

  // 재시도 버튼
  btnRetry.addEventListener('click', () => {
    if (lastSearchedQuery) {
      performSearch(lastSearchedQuery);
    } else {
      performSearch('서울');
    }
  });

  // 히스토리 전체 삭제
  btnClearHistory.addEventListener('click', clearAllRecentSearches);

  // 추천 지역 퀵 태그 클릭 이벤트
  document.querySelectorAll('.quick-tag-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const city = e.currentTarget.getAttribute('data-city');
      if (city) {
        cityInput.value = city;
        performSearch(city);
      }
    });
  });

  // 에러 화면 추천 태그
  document.addEventListener('click', (e) => {
    if (e.target.matches('.error-suggestions .quick-tag-btn')) {
      const city = e.target.getAttribute('data-city');
      if (city) {
        cityInput.value = city;
        performSearch(city);
      }
    }
  });

  // 초기화 실행
  function init() {
    // 단위 버튼 상태 설정
    btnUnitC.classList.toggle('active', currentUnit === 'c');
    btnUnitF.classList.toggle('active', currentUnit === 'f');

    // 최근 검색어 표시
    renderRecentSearches();

    // 초기 검색 도시: 서울
    performSearch('서울');
  }

  init();

})();
