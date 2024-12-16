function openCountryDetails() {
  if (!currentLocation.lat || !currentLocation.lng) {
    alert("위치를 먼저 설정하세요.");
    return;
  }

  const { lat, lng } = currentLocation;
  const googleApiKey = "AIzaSyAzs_JWrd2fjQl388h83v2xDT7UeheB-Sw";
  const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${googleApiKey}`;

  // 1. Google Geocoding API 호출
  fetch(geocodingUrl)
    .then(response => response.json())
    .then(data => {
      if (data.status === "OK" && data.results.length > 0) {
        const countryComponent = data.results.find(result => 
          result.types.includes("country")
        );

        if (countryComponent) {
          const countryName = countryComponent.formatted_address;
          const countryCode = countryComponent.address_components.find(comp => 
            comp.types.includes("country")
          )?.short_name;

          if (countryCode) {
            // 2. REST Countries API 호출
            const restCountriesUrl = `https://restcountries.com/v3.1/alpha/${countryCode}`;

            fetch(restCountriesUrl)
              .then(response => response.json())
              .then(countryData => {
                if (countryData && countryData[0]) {
                  const country = countryData[0];

                  // 국가 정보 표시
                  const content = `
                    <h3>${country.name.common} (${countryName})</h3>
                    <p>공식 이름: ${country.name.official}</p>
                    <p>수도: ${country.capital ? country.capital[0] : "정보 없음"}</p>
                    <p>인구: ${country.population.toLocaleString()}</p>
                    <p>통화: ${Object.values(country.currencies || {})
                      .map(curr => curr.name)
                      .join(", ")}</p>
                    <p>지역: ${country.region}</p>
                    <p>국기:</p>
                    <img src="${country.flags.svg}" alt="국기" style="width: 100px;"/>
                    <p><a href="https://en.wikipedia.org/wiki/${country.name.common}" target="_blank">Wikipedia에서 자세히 보기</a></p>
                  `;
                  document.getElementById("countryDetailsContent").innerHTML = content;
                  openModal("countryDetailsModal");
                } else {
                  alert("국가 정보를 가져올 수 없습니다.");
                }
              })
              .catch(error => console.error("REST Countries API 요청 오류:", error));
          } else {
            alert("국가 코드를 찾을 수 없습니다.");
          }
        } else {
          alert("국가 정보를 찾을 수 없습니다.");
        }
      } else {
        alert("Geocoding API 요청 실패: " + data.status);
      }
    })
    .catch(error => console.error("Geocoding API 요청 오류:", error));
}
  
  
  const languageTips = {
    english: [
      "Hello! → 안녕하세요! (Hello!)",
      "How much is this? → 이거 얼마에요? (How much is this?)",
      "Where is the restroom? → 화장실 어디에요? (Where is the restroom?)",
      "I don’t understand. → 이해하지 못해요. (I don’t understand.)",
      "Can you help me? → 도와줄 수 있나요? (Can you help me?)",
      "I’m lost. → 길을 잃었어요. (I’m lost.)",
      "Can you speak English? → 영어 할 수 있어요? (Can you speak English?)",
      "I’d like to order… → ...을(를) 주문하고 싶어요. (I’d like to order…)",
      "What time is it now? → 지금 몇 시에요? (What time is it now?)",
      "Excuse me, how do I get to [place]? → 실례합니다, [장소]에 어떻게 가요? (Excuse me, how do I get to [place]?)"
    ],
    chinese: [
      "你好! → 안녕하세요! (Ni hao!)",
      "这个多少钱? → 이거 얼마에요? (Zhe ge duo shao qian?)",
      "厕所在哪里? → 화장실 어디에요? (Ce suo zai na li?)",
      "我听不懂. → 이해하지 못해요. (Wo ting bu dong.)",
      "你可以帮我吗? → 도와줄 수 있나요? (Ni ke yi bang wo ma?)",
      "我迷路了. → 길을 잃었어요. (Wo mi lu le.)",
      "你会说英语吗? → 영어 할 수 있어요? (Ni hui shuo ying yu ma?)",
      "我想点... → ...을(를) 주문하고 싶어요. (Wo xiang dian...)",
      "现在几点? → 지금 몇 시에요? (Xian zai ji dian?)",
      "请问, 到[장소]怎么走? → 실례합니다, [장소]에 어떻게 가요? (Qing wen, dao [place] zen me zou?)"
    ],
    hindi: [
      "नमस्ते! → 안녕하세요! (Namaste!)",
      "यह कितने का है? → 이거 얼마에요? (Yah kitne ka hai?)",
      "शौचालय कहाँ है? → 화장실 어디에요? (Shauchalay kahan hai?)",
      "मैं समझ नहीं पाया/पाई. → 이해하지 못해요. (Main samajh nahi paya/payi.)",
      "क्या आप मेरी मदद कर सकते हैं? → 도와줄 수 있나요? (Kya aap meri madad kar sakte hain?)",
      "मैं रास्ता भटक गया/गई. → 길을 잃었어요. (Main rasta bhatak gaya/gayi.)",
      "क्या आप अंग्रेजी बोल सकते हैं? → 영어 할 수 있어요? (Kya aap angrezi bol sakte hain?)",
      "मैं ... मँगवाना चाहता/चाहती हूँ. → ...을(를) 주문하고 싶어요. (Main ... mangwana chahta/chahti hoon.)",
      "अभी क्या समय हुआ है? → 지금 몇 시에요? (Abhi kya samay hua hai?)",
      "माफ़ कीजिए, [장소] कैसे जाएँ? → 실례합니다, [장소]에 어떻게 가요? (Maaf kijiye, [place] kaise jayein?)"
    ],
    spanish: [
      "¡Hola! → 안녕하세요! (Hola!)",
      "¿Cuánto cuesta esto? → 이거 얼마에요? (¿Cuánto cuesta esto?)",
      "¿Dónde está el baño? → 화장실 어디에요? (¿Dónde está el baño?)",
      "No entiendo. → 이해하지 못해요. (No entiendo.)",
      "¿Puede ayudarme? → 도와줄 수 있나요? (¿Puede ayudarme?)",
      "Estoy perdido/perdida. → 길을 잃었어요. (Estoy perdido/perdida.)",
      "¿Habla inglés? → 영어 할 수 있어요? (¿Habla inglés?)",
      "Quiero pedir... → ...을(를) 주문하고 싶어요. (Quiero pedir...)",
      "¿Qué hora es? → 지금 몇 시에요? (¿Qué hora es?)",
      "Disculpe, ¿cómo llego a [장소]? → 실례합니다, [장소]에 어떻게 가요? (Disculpe, ¿cómo llego a [place]?)"
    ],
    french: [
      "Bonjour! → 안녕하세요! (Bonjour!)",
      "Combien ça coûte? → 이거 얼마에요? (Combien ça coûte?)",
      "Où sont les toilettes? → 화장실 어디에요? (Où sont les toilettes?)",
      "Je ne comprends pas. → 이해하지 못해요. (Je ne comprends pas.)",
      "Pouvez-vous m’aider? → 도와줄 수 있나요? (Pouvez-vous m’aider?)",
      "Je suis perdu/perdue. → 길을 잃었어요. (Je suis perdu/perdue.)",
      "Parlez-vous anglais? → 영어 할 수 있어요? (Parlez-vous anglais?)",
      "Je voudrais commander... → ...을(를) 주문하고 싶어요. (Je voudrais commander...)",
      "Quelle heure est-il? → 지금 몇 시에요? (Quelle heure est-il?)",
      "Excusez-moi, comment aller à [장소]? → 실례합니다, [장소]에 어떻게 가요? (Excusez-moi, comment aller à [place]?)"
    ], 
    arabic: [
      "مرحبًا! → 안녕하세요! (Marhaban!)",
      "كم سعر هذا؟ → 이거 얼마에요? (Kam siar hadha?)",
      "أين الحمام؟ → 화장실 어디에요? (Ayn alhamam?)",
      "لا أفهم. → 이해하지 못해요. (La afham.)",
      "هل يمكنك مساعدتي؟ → 도와줄 수 있나요? (Hal yumkinuka musaeadati?)",
      "أنا تائه. → 길을 잃었어요. (Ana taeih.)",
      "هل تتحدث الإنجليزية؟ → 영어 할 수 있어요? (Hal tatahaddath al'iinjilizia?)",
      "أريد طلب... → ...을(를) 주문하고 싶어요. (Arid talab...)",
      "كم الساعة الآن؟ → 지금 몇 시에요? (Kam alsaeat alan?)",
      "عذرًا، كيف أذهب إلى [장소]؟ → 실례합니다, [장소]에 어떻게 가요? (Eadhraan, kayfa adhhab 'iilaa [place]?)"
    ],
    bengali: [
      "হ্যালো! → 안녕하세요! (Hyalo!)",
      "এটা কত দাম? → 이거 얼마에요? (Eta koto dam?)",
      "টয়লেট কোথায়? → 화장실 어디에요? (Toilet kothay?)",
      "আমি বুঝতে পারছি না. → 이해하지 못해요. (Ami bujhte parchi na.)",
      "আপনি কি আমাকে সাহায্য করতে পারেন? → 도와줄 수 있나요? (Apni ki amake shahajyo korte paren?)",
      "আমি পথ হারিয়ে ফেলেছি. → 길을 잃었어요. (Ami poth hariye felechi.)",
      "আপনি কি ইংরেজি বলতে পারেন? → 영어 할 수 있어요? (Apni ki ingreji bolte paren?)",
      "আমি ... অর্ডার করতে চাই. → ...을(를) 주문하고 싶어요. (Ami ... order korte chai.)",
      "এখন কত সময়? → 지금 몇 시에요? (Ekhon koto somoy?)",
      "মাফ করবেন, [장소] কীভাবে যাব? → 실례합니다, [장소]에 어떻게 가요? (Maf korben, [place] kivabe jabo?)"
    ],  
    portuguese: [
      "Olá! → 안녕하세요! (Olá!)",
      "Quanto custa isso? → 이거 얼마에요? (Quanto custa isso?)",
      "Onde fica o banheiro? → 화장실 어디에요? (Onde fica o banheiro?)",
      "Eu não entendo. → 이해하지 못해요. (Eu não entendo.)",
      "Você pode me ajudar? → 도와줄 수 있나요? (Você pode me ajudar?)",
      "Estou perdido/perdida. → 길을 잃었어요. (Estou perdido/perdida.)",
      "Você fala inglês? → 영어 할 수 있어요? (Você fala inglês?)",
      "Eu gostaria de pedir... → ...을(를) 주문하고 싶어요. (Eu gostaria de pedir...)",
      "Que horas são agora? → 지금 몇 시에요? (Que horas são agora?)",
      "Com licença, como chego a [장소]? → 실례합니다, [장소]에 어떻게 가요? (Com licença, como chego a [place]?)"
    ],
    russian: [
      "Здравствуйте! → 안녕하세요! (Zdravstvuyte!)",
      "Сколько это стоит? → 이거 얼마에요? (Skol'ko eto stoit?)",
      "Где находится туалет? → 화장실 어디에요? (Gde nakhoditsya tualet?)",
      "Я не понимаю. → 이해하지 못해요. (Ya ne ponimayu.)",
      "Вы можете мне помочь? → 도와줄 수 있나요? (Vy mozhete mne pomoch'?)",
      "Я заблудился/заблудилась. → 길을 잃었어요. (Ya zabludilsya/zabludilas'.)",
      "Вы говорите по-английски? → 영어 할 수 있어요? (Vy govorite po-angliyski?)",
      "Я хотел(а) бы заказать... → ...을(를) 주문하고 싶어요. (Ya khotel(a) by zakazat'...)",
      "Который час сейчас? → 지금 몇 시에요? (Kotoryy chas seychas?)",
      "Извините, как пройти к [장소]? → 실례합니다, [장소]에 어떻게 가요? (Izvinite, kak proyti k [place]?)"
    ],
    urdu: [
      "سلام! → 안녕하세요! (Salaam!)",
      "یہ کتنے کا ہے؟ → 이거 얼마에요? (Yeh kitne ka hai?)",
      "بیت الخلا کہاں ہے؟ → 화장실 어디에요? (Bait-ul-khala kahan hai?)",
      "میں نہیں سمجھتا/سمجھتی. → 이해하지 못해요. (Main nahi samajhta/samajhti.)",
      "کیا آپ میری مدد کر سکتے ہیں؟ → 도와줄 수 있나요? (Kya aap meri madad kar sakte hain?)",
      "میں راستہ بھول گیا/گئی ہوں. → 길을 잃었어요. (Main rasta bhool gaya/gayi hoon.)",
      "کیا آپ انگریزی بول سکتے ہیں؟ → 영어 할 수 있어요? (Kya aap angrezi bol sakte hain?)",
      "میں ... کا آرڈر دینا چاہتا/چاہتی ہوں. → ...을(를) 주문하고 싶어요. (Main ... ka order dena chahta/chahti hoon.)",
      "ابھی کیا وقت ہوا ہے؟ → 지금 몇 시에요? (Abhi kya waqt hua hai?)",
      "معاف کیجئے، [장소] کیسے جاؤں؟ → 실례합니다, [장소]에 어떻게 가요? (Maaf kijiye, [place] kaise jaoon?)"
    ]  
  };
  
function openLanguageTips() {
    openModal("languageTipsModal");
    updateLanguageTips();
  }
  
function updateLanguageTips() {
    const selectedLanguage = document.getElementById("languageSelect").value;
    const tips = languageTips[selectedLanguage] || [];
    const content = tips.map(tip => `<p>${tip}</p>`).join("");
    document.getElementById("languageTipsContent").innerHTML = content;
  }

  window.openCountryDetails=openCountryDetails;
  window.openLanguageTips=openLanguageTips;
  window.updateLanguageTips=updateLanguageTips;
