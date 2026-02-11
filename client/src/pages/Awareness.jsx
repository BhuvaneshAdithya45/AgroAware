import { useState } from 'react';
import Navbar from '../components/Navbar';
import { useTranslation } from '../i18n';

const awarenessTranslations = {
  en: {
    title: "🌾 Farming Knowledge Hub",
    subtitle: "Learn best practices, explore government schemes, and get answers to common farming questions",
    farming_best_practices: "Farming Best Practices",
    govt_schemes_title: "Government Schemes",
    faqs_title: "Frequently Asked Questions",
    stats_title: "Indian Agriculture at a Glance",
    stat_1_label: "Population in Agriculture",
    stat_2_label: "Farmer Families",
    stat_3_label: "GDP Contribution",
    stat_4_label: "World Food Producer",

    tips: [
      {
        category: 'Soil Health', icon: '🌍', color: 'from-amber-500 to-orange-600',
        content: [
          'Test your soil pH regularly - most crops prefer 6.0-7.0',
          'Add organic matter like compost to improve soil structure',
          'Practice crop rotation to prevent nutrient depletion',
          'Use cover crops during off-season to prevent erosion',
          'Avoid over-tilling which destroys soil microorganisms',
        ]
      },
      {
        category: 'Water Management', icon: '💧', color: 'from-blue-500 to-cyan-600',
        content: [
          'Water early morning to reduce evaporation loss',
          'Use drip irrigation for 30-50% water savings',
          'Mulching helps retain soil moisture by 25%',
          'Collect rainwater for irrigation during dry spells',
          'Check soil moisture before watering - avoid overwatering',
        ]
      },
      {
        category: 'Pest Control', icon: '🐛', color: 'from-red-500 to-rose-600',
        content: [
          'Use neem-based sprays as natural pesticides',
          'Introduce beneficial insects like ladybugs',
          'Intercropping confuses pests and reduces infestation',
          'Remove infected plants immediately to prevent spread',
          'Use pheromone traps for monitoring pest populations',
        ]
      },
      {
        category: 'Seasonal Planning', icon: '🗓️', color: 'from-green-500 to-emerald-600',
        content: [
          'Kharif (June-Sept): Rice, Maize, Cotton, Soybean',
          'Rabi (Oct-March): Wheat, Mustard, Gram, Barley',
          'Summer (March-June): Watermelon, Cucumber, Groundnut',
          'Start seedlings indoors 4-6 weeks before transplanting',
          'Check local weather forecasts before major operations',
        ]
      }
    ],
    schemes: [
      { name: 'PM-KISAN', description: '₹6,000 per year direct income support to farmer families', link: 'https://pmkisan.gov.in' },
      { name: 'Kisan Credit Card', description: 'Low-interest credit for agricultural needs up to ₹3 lakh', link: 'https://www.nabard.org' },
      { name: 'Pradhan Mantri Fasal Bima Yojana', description: 'Crop insurance at premium of 1.5-5% of sum insured', link: 'https://pmfby.gov.in' },
      { name: 'Soil Health Card Scheme', description: 'Free soil testing and nutrient recommendations', link: 'https://soilhealth.dac.gov.in' },
    ],
    faqs: [
      { q: 'When is the best time to apply fertilizer?', a: 'Apply fertilizers when plants are actively growing. For most crops, split application works best - 50% at sowing and 50% after 30-45 days. Avoid applying during heavy rain to prevent runoff.' },
      { q: 'How do I know if my crops have nutrient deficiency?', a: 'Yellowing leaves (nitrogen), purple stems (phosphorus), brown leaf edges (potassium), and stunted growth are common signs. Get a soil test for accurate diagnosis.' },
      { q: 'What is crop rotation and why is it important?', a: 'Crop rotation means growing different crops in sequence. It prevents soil-borne diseases, breaks pest cycles, improves soil fertility, and increases overall yields.' },
      { q: 'How can I protect crops from extreme weather?', a: 'Use mulching for temperature control, install shade nets for heat, create drainage channels for floods, and use windbreaks. Crop insurance provides financial protection.' },
    ]
  },
  kn: {
    title: "🌾 ಕೃಷಿ ಅರಿವು ಕೇಂದ್ರ",
    subtitle: "ಉತ್ತಮ ಅಭ್ಯಾಸಗಳನ್ನು ಕಲಿಯಿರಿ, ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ",
    farming_best_practices: "ಕೃಷಿ ಉತ್ತಮ ಅಭ್ಯಾಸಗಳು",
    govt_schemes_title: "ರೈತರಿಗಾಗಿ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
    faqs_title: "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
    stats_title: "ಭಾರತೀಯ ಕೃಷಿ ಒಂದು ನೋಟದಲ್ಲಿ",
    stat_1_label: "ಕೃಷಿಯಲ್ಲಿ ಜನಸಂಖ್ಯೆ",
    stat_2_label: "ರೈತ ಕುಟುಂಬಗಳು",
    stat_3_label: "ಜಿಡಿಪಿ ಕೊಡುಗೆ",
    stat_4_label: "ವಿಶ್ವ ಆಹಾರ ಉತ್ಪಾದಕ",
    tips: [
      {
        category: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ', icon: '🌍', color: 'from-amber-500 to-orange-600',
        content: [
          'ನಿಯಮಿತವಾಗಿ ಮಣ್ಣಿನ pH ಪರೀಕ್ಷಿಸಿ (6.0-7.0 ಉತ್ತಮ)',
          'ಮಣ್ಣಿನ ರಚನೆ ಸುಧಾರಿಸಲು ಕಾಂಪೋಸ್ಟ್ ಬಳಸಿ',
          'ಪೋಷಕಾಂಶಗಳ ಸವಕಳಿ ತಡೆಯಲು ಬೆಳೆ ಬದಲಾವಣೆ ಮಾಡಿ',
          'ಸವೆತ ತಡೆಯಲು ಕವರ್ ಬೆಳೆಗಳನ್ನು ಬಳಸಿ',
          'ಅತಿಯಾಗಿ ಉಳುಮೆ ಮಾಡುವುದನ್ನು ತಪ್ಪಿಸಿ (ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಾಣುಜೀವಿಗಳಿಗೆ ಹಾನಿ)',
        ]
      },
      {
        category: 'ನೀರು ನಿರ್ವಹಣೆ', icon: '💧', color: 'from-blue-500 to-cyan-600',
        content: [
          'ಬೆಳಿಗ್ಗೆ ನೀರು ಹಾಕಿ (ಬಾಷ್ಪೀಕರಣ ಕಡಿಮೆ ಮಾಡಲು)',
          'ಹನಿ ನೀರಾವರಿ ಬಳಸಿ (30-50% ನೀರು ಉಳಿತಾಯ)',
          'ಮಲ್ಚಿಂಗ್ ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು 25% ಉಳಿಸುತ್ತದೆ',
          'ಒಣಗಾಲದಲ್ಲಿ ಮಳೆ ನೀರು ಕೊಯ್ಲು ಬಳಸಿ',
          'ನೀರು ಹಾಕುವ ಮೊದಲು ಮಣ್ಣಿನ ತೇವಾಂಶ ಪರೀಕ್ಷಿಸಿ',
        ]
      },
      {
        category: 'ಕೀಟ ನಿಯಂತ್ರಣ', icon: '🐛', color: 'from-red-500 to-rose-600',
        content: [
          'ನೈಸರ್ಗಿಕ ಕೀಟನಾಶಕವಾಗಿ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ',
          'ಲೇಡಿಬಗ್‌ಗಳಂತಹ ಉಪಯುಕ್ತ ಕೀಟಗಳನ್ನು ಬಳಸಿ',
          'ಅಂತರ ಬೆಳೆ ಪದ್ಧತಿ ಕೀಟಗಳ ಹಾವಳಿ ಕಡಿಮೆ ಮಾಡುತ್ತದೆ',
          'ಸೋಂಕಿತ ಸಸ್ಯಗಳನ್ನು ತಕ್ಷಣ ತೆಗೆದುಹಾಕಿ',
          'ಕೀಟಗಳ ಸಂಖ್ಯೆ ತಿಳಿಯಲು ಫೆರೋಮೋನ್ ಬಲೆಗಳನ್ನು ಬಳಸಿ',
        ]
      },
      {
        category: 'ಋತು ಯೋಜನೆ', icon: '🗓️', color: 'from-green-500 to-emerald-600',
        content: [
          'ಖಾರಿಫ್ (ಜೂನ್-ಸೆಪ್ಟೆಂಬರ್): ಭತ್ತ, ಜೋಳ, ಹತ್ತಿ',
          'ರಬಿ (ಅಕ್ಟೋಬರ್-ಮಾರ್ಚ್): ಗೋಧಿ, ಸಾಸಿವೆ, ಕಡಲೆ',
          'ಬೇಸಿಗೆ (ಮಾರ್ಚ್-ಜೂನ್): ಕಲ್ಲಂಗಡಿ, ಸೌತೆಕಾಯಿ',
          'ನಾಟಿ ಮಾಡುವ 4-6 ವಾರಗಳ ಮೊದಲು ಸಸಿಗಳನ್ನು ಬೆಳೆಸಿ',
          'ಮುಖ್ಯ ಕೆಲಸಗಳ ಮೊದಲು ಹವಾಮಾನ ವರದಿ ಪರಿಶೀಲಿಸಿ',
        ]
      }
    ],
    schemes: [
      { name: 'ಪಿಎಂ-ಕಿಸಾನ್', description: 'ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವರ್ಷಕ್ಕೆ ₹6,000 ನೇರ ಆದಾಯ ಬೆಂಬಲ', link: 'https://pmkisan.gov.in' },
      { name: 'ಕಿಸಾನ್ ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್', description: 'ಕೃಷಿ ಅಗತ್ಯಗಳಿಗೆ ಕಡಿಮೆ ಬಡ್ಡಿ ಸಾಲ (₹3 ಲಕ್ಷದವರೆಗೆ)', link: 'https://www.nabard.org' },
      { name: 'ಫಸಲ್ ಬಿಮಾ ಯೋಜನೆ', description: 'ಬೆಳೆ ವಿಮೆ (1.5-5% ಪ್ರೀಮಿಯಂ)', link: 'https://pmfby.gov.in' },
      { name: 'ಮಣ್ಣಿನ ಆರೋಗ್ಯ ಕಾರ್ಡ್', description: 'ಉಚಿತ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮತ್ತು ಪೋಷಕಾಂಶಗಳ ಶಿಫಾರಸು', link: 'https://soilhealth.dac.gov.in' },
    ],
    faqs: [
      { q: 'ಗೊಬ್ಬರ ಹಾಕಲು ಉತ್ತಮ ಸಮಯ ಯಾವುದು?', a: 'ಸಸ್ಯಗಳು ಚಟುವಟಿಕೆಯಿಂದ ಬೆಳೆಯುತ್ತಿರುವಾಗ ಗೊಬ್ಬರ ಹಾಕಿ. ಬಿತ್ತನೆಯ ಸಮಯದಲ್ಲಿ 50% ಮತ್ತು 30-45 ದಿನಗಳ ನಂತರ 50% ಹಾಕುವುದು ಉತ್ತಮ.' },
      { q: 'ಬೆಳೆಗಳಲ್ಲಿ ಪೋಷಕಾಂಶದ ಕೊರತೆ ತಿಳಿಯುವುದು ಹೇಗೆ?', a: 'ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದು (ಸಾರಜನಕ), ನೇರಳೆ ಕಾಂಡಗಳು (ರಂಜಕ), ಕಂದು ಎಲೆ ಅಂಚುಗಳು (ಪೊಟ್ಯಾಸಿಯಮ್). ನಿಖರ ಮಾಹಿತಿಗಾಗಿ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿ.' },
      { q: 'ಬೆಳೆ ಬದಲಾವಣೆ ಎಂದರೇನು?', a: 'ವಿವಿಧ ಬೆಳೆಗಳನ್ನು ಅನುಕ್ರಮವಾಗಿ ಬೆಳೆಯುವುದು. ಇದು ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುತ್ತದೆ ಮತ್ತು ರೋಗಗಳನ್ನು ತಡೆಯುತ್ತದೆ.' },
      { q: 'ಅತಿವೃಷ್ಟಿ/ಅನಾವೃಷ್ಟಿಯಿಂದ ಬೆಳೆ ರಕ್ಷಣೆ ಹೇಗೆ?', a: 'ಮಲ್ಚಿಂಗ್ ಬಳಸಿ, ಬಿಸಿಲಿಗೆ ನೆರಳು ಬಲೆಗಳನ್ನು ಬಳಸಿ, ಪ್ರವಾಹಕ್ಕೆ ಕಾಲುವೆ ಮಾಡಿ. ಬೆಳೆ ವಿಮೆ ಆರ್ಥಿಕ ರಕ್ಷಣೆ ನೀಡುತ್ತದೆ.' },
    ]
  },
  hi: {
    title: "🌾 कृषि जागरूकता केंद्र",
    subtitle: "सर्वोत्तम तरीके सीखें और सरकारी योजनाओं का लाभ उठाएं",
    farming_best_practices: "खेती के सर्वोत्तम तरीके",
    govt_schemes_title: "किसानों के लिए सरकारी योजनाएं",
    faqs_title: "अक्सर पूछे जाने वाले प्रश्न",
    stats_title: "भारतीय कृषि एक नज़र में",
    stat_1_label: "कृषि में जनसंख्या",
    stat_2_label: "किसान परिवार",
    stat_3_label: "जीडीपी योगदान",
    stat_4_label: "विश्व खाद्य निर्माता",
    tips: [
      {
        category: 'मिट्टी का स्वास्थ्य', icon: '🌍', color: 'from-amber-500 to-orange-600',
        content: [
          'नियमित रूप से अपनी मिट्टी के पीएच का परीक्षण करें',
          'मिट्टी की संरचना सुधारने के लिए खाद डालें',
          'पोषक तत्वों की कमी रोकने के लिए फसल चक्र अपनाएं',
          'कटाव रोकने के लिए कवर फसलों का उपयोग करें',
          'अत्यधिक जुताई से बचें (सूक्ष्मजीवों को बचाता है)',
        ]
      },
      {
        category: 'जल प्रबंधन', icon: '💧', color: 'from-blue-500 to-cyan-600',
        content: [
          'वाष्पीकरण कम करने के लिए सुबह पानी दें',
          'ड्रिप सिंचाई का उपयोग करें (30-50% बचत)',
          'मल्चिंग से मिट्टी की नमी 25% तक बचती है',
          'सूखे के दौरान वर्षा जल संचयन का उपयोग करें',
          'पानी देने से पहले नमी की जाँच करें',
        ]
      },
      {
        category: 'कीट नियंत्रण', icon: '🐛', color: 'from-red-500 to-rose-600',
        content: [
          'नीम आधारित स्प्रे का उपयोग करें',
          'लेडीबग्स जैसे लाभकारी कीड़ों को लाएं',
          'अंतर-फसल कीटों को भ्रमित करती है',
          'संक्रमित पौधों को तुरंत हटा दें',
          'कीटों की निगरानी के लिए फेरोमोन जाल का उपयोग करें',
        ]
      },
      {
        category: 'मौसमी योजना', icon: '🗓️', color: 'from-green-500 to-emerald-600',
        content: [
          'खरीफ (जून-सितंबर): चावल, मक्का, कपास',
          'रबी (अक्टूबर-मार्च): गेहूं, सरसों, चना',
          'गर्मी (मार्च-जून): तरबूज, खीरा, मूंगफली',
          'रोपाई से 4-6 सप्ताह पहले पौध तैयार करें',
          'प्रमुख कार्यों से पहले मौसम पूर्वानुमान देखें',
        ]
      }
    ],
    schemes: [
      { name: 'पीएम-किसान', description: 'किसानों को प्रति वर्ष ₹6,000 की सीधी आय सहायता', link: 'https://pmkisan.gov.in' },
      { name: 'किसान क्रेडिट कार्ड', description: 'कृषि आवश्यकताओं के लिए कम ब्याज पर ऋण', link: 'https://www.nabard.org' },
      { name: 'प्रधानमंत्री फसल बीमा', description: 'फसल बीमा (प्रीमियम 1.5-5%)', link: 'https://pmfby.gov.in' },
      { name: 'मृदा स्वास्थ्य कार्ड', description: 'निःशुल्क मिट्टी परीक्षण और सिफारिशें', link: 'https://soilhealth.dac.gov.in' },
    ],
    faqs: [
      { q: 'खाद डालने का सबसे अच्छा समय कब है?', a: 'जब पौधे सक्रिय रूप से बढ़ रहे हों। बुवाई के समय 50% और 30-45 दिनों बाद 50% डालना सबसे अच्छा है।' },
      { q: 'फसल में पोषक तत्वों की कमी कैसे पता करें?', a: 'पत्तियों का पीला होना (नाइट्रोजन), बैंगनी तना (फास्फोरस)। सटीक निदान के लिए मिट्टी परीक्षण करवाएं।' },
      { q: 'फसल चक्र क्या है?', a: 'क्रम में विभिन्न फसलें उगाना। यह मिट्टी की उर्वरता बढ़ाता है और बीमारियों को रोकता है।' },
      { q: 'चरम मौसम से फसलों को कैसे बचाएं?', a: 'तापमान नियंत्रण के लिए मल्चिंग, गर्मी के लिए शेड नेट, और बाढ़ के लिए जल निकासी चैनल बनाएं।' },
    ]
  },
  te: {
    title: "🌾 వ్యవసాయ అవగాహన కేంద్రం",
    subtitle: "ఉత్తమ పద్ధతులను నేర్చుకోండి మరియు ప్రభుత్వ పథకాలను తెలుసుకోండి",
    farming_best_practices: "వ్యవసాయ ఉత్తమ పద్ధతులు",
    govt_schemes_title: "రైతుల కోసం ప్రభుత్వ పథకాలు",
    faqs_title: "తరచుగా అడిగే ప్రశ్నలు",
    stats_title: "భారతీయ వ్యవసాయం ఒక చూపులో",
    stat_1_label: "వ్యవసాయంలో జనాభా",
    stat_2_label: "రైతు కుటుంబాలు",
    stat_3_label: "జీడీపీ సహకారం",
    stat_4_label: "ప్రపంచ ఆహార ఉత్పత్తి",
    tips: [
      {
        category: 'మట్టి ఆరోగ్యం', icon: '🌍', color: 'from-amber-500 to-orange-600',
        content: [
          'మీ మట్టి pH ని క్రమం తప్పకుండా పరీక్షించండి',
          'మట్టిని మెరుగుపరచడానికి సేంద్రీయ ఎరువును వాడండి',
          'పోషకాల లోపాన్ని నివారించడానికి పంట మార్పిడి చేయండి',
          'కోతను నివారించడానికి కవర్ పంటలను వాడండి',
          'అతిగా దున్నడం మానుకోండి (సూక్ష్మజీవులను కాపాడుతుంది)',
        ]
      },
      {
        category: 'నీటి నిర్వహణ', icon: '💧', color: 'from-blue-500 to-cyan-600',
        content: [
          'భాష్పీభవనాన్ని తగ్గించడానికి ఉదయం నీరు పెట్టండి',
          'బిందు సేద్యం (డ్రిప్) వాడండి (30-50% ఆదా)',
          'మల్చింగ్ మట్టి తేమను 25% వరకు ఆదా చేస్తుంది',
          'వర్షపు నీటిని నిల్వ చేసి వాడండి',
          'నీరు పెట్టే ముందు మట్టి తేమను తనిఖీ చేయండి',
        ]
      },
      {
        category: 'చీడపీడల నివారణ', icon: '🐛', color: 'from-red-500 to-rose-600',
        content: [
          'వేప ఆధారిత స్ప్రేలను వాడండి',
          'లేడీబగ్స్ వంటి మిత్ర కీటకాలను పెంచండి',
          'అంతర పంటలు తెగుళ్లను తగ్గిస్తాయి',
          'వ్యాధి సోకిన మొక్కలను వెంటనే తొలగించండి',
          'తెగుళ్ల కోసం ఫెరమోన్ ట్రాప్స్‌ను వాడండి',
        ]
      },
      {
        category: 'కాలానుగుణ ప్రణాళిక', icon: '🗓️', color: 'from-green-500 to-emerald-600',
        content: [
          'ఖరీఫ్ (జూన్-సెప్టెంబర్): వరి, మొక్కజొన్న, పత్తి',
          'రబీ (అక్టోబర్-మార్చి): గోధుమ, ఆవాలు, శనగలు',
          'వేసవి (మార్చి-జూన్): పుచ్చకాయ, దోసకాయ',
          'నాటడానికి 4-6 వారాల ముందు నారు సిద్ధం చేయండి',
          'వాతావరణం చూసి పనులు ప్రారంభించండి',
        ]
      }
    ],
    schemes: [
      { name: 'PM- కిసాన్', description: 'రైతు కుటుంబాలకు ఏటా ₹6,000 ఆర్థిక సహాయం', link: 'https://pmkisan.gov.in' },
      { name: 'కిసాన్ క్రెడిట్ కార్డ్', description: 'తక్కువ వడ్డీతో పంట రుణాలు (₹3 లక్షల వరకు)', link: 'https://www.nabard.org' },
      { name: 'ప్రధాన్ మంత్రి ఫసల్ బీమా', description: 'పంటల బీమా పథకం (ప్రీమియం 1.5-5%)', link: 'https://pmfby.gov.in' },
      { name: 'సాయిల్ హెల్త్ కార్డ్', description: 'ఉచిత మట్టి పరీక్ష మరియు సిఫార్సులు', link: 'https://soilhealth.dac.gov.in' },
    ],
    faqs: [
      { q: 'ఎరువులు వేయడానికి సరైన సమయం ఏది?', a: 'మొక్కలు చురుగ్గా పెరుగుతున్నప్పుడు. విత్తేటప్పుడు 50% మరియు 30-45 రోజుల తర్వాత 50% వేయడం ఉత్తమం.' },
      { q: 'పంటలో పోషకాల లోపం ఎలా గుర్తించాలి?', a: 'ఆకులు పసుపు రంగులోకి మారడం (నత్రజని), ఊదా కాండం (భాస్వరం). ఖచ్చితమైన నిర్ధారణకు మట్టి పరీక్ష చేయండి.' },
      { q: 'పంట మార్పిడి అంటే ఏమిటి?', a: 'వేర్వేరు పంటలను వరుసగా పండించడం. ఇది మట్టి సారాన్ని పెంచుతుంది మరియు తెగుళ్లను అరికడుతుంది.' },
      { q: 'తీవ్రమైన వాతావరణం నుండి పంటను ఎలా రక్షించుకోవాలి?', a: 'మల్చింగ్ వాడండి, ఎండకు షేడ్ నెట్స్, వరదలకు కాలువలు ఏర్పాటు చేయండి.' },
    ]
  },
  ta: {
    title: "🌾 வேளாண் விழிப்புணர்வு மையம்",
    subtitle: "சிறந்த நடைமுறைகளை கற்றுக் கொள்ளுங்கள் மற்றும் அரசு திட்டங்களை அறியுங்கள்",
    farming_best_practices: "சிறந்த விவசாய முறைகள்",
    govt_schemes_title: "விவசாயிகளுக்கான அரசு திட்டங்கள்",
    faqs_title: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    stats_title: "இந்திய வேளாண்மை ஒரு பார்வை",
    stat_1_label: "விவசாய மக்கள் தொகை",
    stat_2_label: "விவசாய குடும்பங்கள்",
    stat_3_label: "ஜிடிபி பங்களிப்பு",
    stat_4_label: "உலக உணவு உற்பத்தியாளர்",
    tips: [
      {
        category: 'மண் வளம்', icon: '🌍', color: 'from-amber-500 to-orange-600',
        content: [
          'மண்ணின் pH அளவை சோதிக்கவும் (6.0-7.0 சிறந்தது)',
          'மண் கட்டமைப்பை மேம்படுத்த மக்கிய உரம் சேர்க்கவும்',
          'ஊட்டச்சத்து குறைபாட்டை தடுக்க பயிர் சுழற்சி செய்யவும்',
          'மண் அரிப்பை தடுக்க மூடு பயிர்களை வளர்க்கவும்',
          'அதிக உழவு செய்வதை தவிர்க்கவும் (நுண்ணுயிரிகளை பாதுகாக்கும்)',
        ]
      },
      {
        category: 'நீர் மேலாண்மை', icon: '💧', color: 'from-blue-500 to-cyan-600',
        content: [
          'ஆவியாதலை குறைக்க அதிகாலையில் நீர் பாய்ச்சவும்',
          'சொட்டு நீர் பாசனம் பயன்படுத்தவும் (30-50% சேமிப்பு)',
          'மூடாக்கு (Mulching) மண்ணின் ஈரப்பதத்தை 25% காக்கும்',
          'மழைநீர் சேகரிப்பை பயன்படுத்தவும்',
          'நீர் பாய்ச்சும் முன் மண் ஈரப்பதத்தை சோதிக்கவும்',
        ]
      },
      {
        category: 'பூச்சி கட்டுப்பாடு', icon: '🐛', color: 'from-red-500 to-rose-600',
        content: [
          'வேம்பு சார்ந்த பூச்சிக்கொல்லிகளை பயன்படுத்தவும்',
          'நன்மை தரும் பூச்சிகளை (எ.கா. பொறிவண்டு) வளர்க்கவும்',
          'ஊடுபயிர் சாகுபடி பூச்சி தாக்குதலை குறைக்கும்',
          'பாதிக்கப்பட்ட செடிகளை உடனே அகற்றவும்',
          'பூச்சிகளை கண்காணிக்க இனக்கவர்ச்சி பொறிகளை பயன்படுத்தவும்',
        ]
      },
      {
        category: 'பருவக்காலத் திட்டம்', icon: '🗓️', color: 'from-green-500 to-emerald-600',
        content: [
          'காரிஃப் (சூன்-செப்): நெல், மக்காச்சோளம், பருத்தி',
          'ரபி (அக்-மார்ச்): கோதுமை, கடுகு, உளுந்து',
          'கோடை (மார்ச்-சூன்): தர்பூசணி, வெள்ளரி',
          'நாற்று நடும் முன் 4-6 வாரம் நாற்றங்கால் தயார் செய்யவும்',
          'முக்கிய பணிகளுக்கு முன் வானிலை அறிக்கையை பாருங்கள்',
        ]
      }
    ],
    schemes: [
      { name: 'பிஎம்-கிசான்', description: 'விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 நேரடி உதவி', link: 'https://pmkisan.gov.in' },
      { name: 'கிசான் கடன் அட்டை', description: 'குறைந்த வட்டியில் விவசாய கடன் (₹3 லட்சம் வரை)', link: 'https://www.nabard.org' },
      { name: 'பசல் பீமா யோஜனா', description: 'பயிர் காப்பீடு (பிரீமியம் 1.5-5%)', link: 'https://pmfby.gov.in' },
      { name: 'மண் வள அட்டை', description: 'இலவச மண் பரிசோதனை மற்றும் பரிந்துரைகள்', link: 'https://soilhealth.dac.gov.in' },
    ],
    faqs: [
      { q: 'உரம் இட சிறந்த நேரம் எது?', a: 'செடிகள் வளரும் பருவத்தில். விதைக்கும் போது 50% மற்றும் 30-45 நாட்கள் கழித்து 50% இடுவது சிறந்தது.' },
      { q: 'ஊட்டச்சத்து குறைபாட்டை அறிவது எப்படி?', a: 'இலைகள் மஞ்சள் நிறமாதல் (நைட்ரஜன்), ஊதா தண்டு (பாஸ்பரஸ்). மண் பரிசோதனை மூலம் துல்லியமாக அறியலாம்.' },
      { q: 'பயிர் சுழற்சி என்றால் என்ன?', a: 'வெவ்வேறு பயிர்களை வரிசையாக பயிரிடுவது. இது மண் வளத்தை அதிகரிக்கும் மற்றும் நோய்களை தடுக்கும்.' },
      { q: 'இயற்கை சீற்றங்களில் இருந்து பயிரை காப்பது எப்படி?', a: 'மூடாக்கு (Mulching), நிழல் வலைகள் மற்றும் வடிகால் வசதிகளை ஏற்படுத்தவும். பயிர் காப்பீடு செய்யவும்.' },
    ]
  }
};

export default function Awareness() {
  const [openFaq, setOpenFaq] = useState(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const { lang } = useTranslation();
  const [aiTopic, setAiTopic] = useState('');
  const [aiContent, setAiContent] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [posterTopic, setPosterTopic] = useState('');
  const [posterData, setPosterData] = useState(null);
  const [posterLoading, setPosterLoading] = useState(false);
  const [posterImageLoaded, setPosterImageLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  useEffect(() => {
    let interval;
    if (posterLoading) {
      const msgs = [t("poster_status_1", "Drafting content..."), t("poster_status_2", "Designing visuals..."), t("poster_status_3", "Finalizing poster...")];
      setLoadingMessage(msgs[0]);
      let i = 0;
      interval = setInterval(() => {
        i = (i + 1) % msgs.length;
        setLoadingMessage(msgs[i]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [posterLoading, t]);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
  const langMap = { en: 'English', hi: 'Hindi', kn: 'Kannada', te: 'Telugu', ta: 'Tamil' };

  const aiTopics = [
    { label: `🌍 ${t("topic_soil", "Soil Health")}`, value: 'soil health and fertility management' },
    { label: `💧 ${t("topic_water", "Water Management")}`, value: 'water conservation and irrigation techniques' },
    { label: `🐛 ${t("topic_pest", "Pest Control")}`, value: 'organic pest and disease control methods' },
    { label: `🗓️ ${t("topic_seasonal", "Seasonal Planning")}`, value: 'seasonal crop planning and calendar' },
    { label: `🌿 ${t("topic_organic", "Organic Farming")}`, value: 'organic farming practices and benefits' },
    { label: `💰 ${t("topic_market", "Market & Prices")}`, value: 'crop market prices and selling strategies' },
  ];

  const posterTopics = [
    { label: `🌾 ${t("poster_save_soil", "Save Soil")}`, value: 'soil conservation and health' },
    { label: `💧 ${t("poster_save_water", "Save Water")}`, value: 'water conservation in agriculture' },
    { label: `🌱 ${t("poster_go_organic", "Go Organic")}`, value: 'organic farming benefits' },
    { label: `🌳 ${t("poster_plant_trees", "Plant Trees")}`, value: 'agroforestry and tree planting' },
    { label: `🐝 ${t("poster_save_pollinators", "Save Pollinators")}`, value: 'protecting bees and pollinators' },
    { label: `♻️ ${t("poster_sustainable", "Sustainable Farm")}`, value: 'sustainable farming practices' },
  ];

  const generateAiContent = async (topic) => {
    setAiTopic(topic);
    setAiContent('');
    setAiLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/advisory/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `Generate a detailed farming awareness article about: ${topic}. Include 5-6 practical tips with explanations. Make it educational and farmer-friendly. Add specific numbers, measurements, or techniques where possible.`,
          language: langMap[lang] || 'English',
        }),
      });
      const data = await res.json();
      setAiContent(data.answer || 'Unable to generate content. Please try again.');
    } catch {
      setAiContent('⚠️ Service unavailable. Please check your connection and try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const generatePoster = async (topic) => {
    setPosterTopic(topic);
    setPosterData(null);
    setPosterImageLoaded(false);
    setPosterLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/advisory/poster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, language: langMap[lang] || 'English' }),
      });
      const data = await res.json();
      setPosterData(data);
    } catch {
      setPosterData({ error: 'Poster generation failed. Please try again.' });
    } finally {
      setPosterLoading(false);
    }
  };

  const content = awarenessTranslations[lang] || awarenessTranslations.en;
  const farmingTips = content.tips;
  const governmentSchemes = content.schemes;
  const faqs = content.faqs;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-teal-50 to-emerald-100 relative overflow-hidden font-sans text-emerald-950">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-400/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-400/20 rounded-full blur-[100px] -z-10" />

      <Navbar dark={false} />

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-10">

        {/* Header */}
        <div className="text-center md:text-left text-emerald-950 mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 drop-shadow-sm">
            <span className="bg-white/60 backdrop-blur-md p-3 rounded-2xl shadow-lg text-4xl border border-emerald-100">📚</span>
            {content.title}
          </h1>
          <p className="text-emerald-800 text-lg max-w-2xl font-medium leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* ============================================ */}
        {/*   🤖 AI FARMING ADVISOR (GenAI Section)     */}
        {/* ============================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-indigo-900 text-white shadow-2xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500 opacity-20 rounded-full blur-3xl -ml-20 -mb-20"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-3 flex items-center gap-3">
              <span className="bg-indigo-800 p-2 rounded-xl border border-indigo-700">🤖</span> {t("ai_advisor_title", "AI Farming Advisor")}
            </h2>
            <p className="text-indigo-200 mb-8 max-w-xl text-lg">
              {t("ai_advisor_subtitle", "Ask our advanced AI about any farming topic in your local language.")}
            </p>

            {/* Custom Topic Input */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 md:p-3 border border-indigo-500/30 flex flex-col md:flex-row gap-3 shadow-xl mb-8">
              <input
                type="text"
                placeholder={t("ai_advisor_placeholder", "Type a topic (e.g., 'Tomato diseases')...")}
                className="flex-1 bg-transparent text-white placeholder-indigo-300 px-4 py-3 outline-none text-lg font-medium"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && aiTopic && generateAiContent(aiTopic)}
              />
              <button
                onClick={() => aiTopic && generateAiContent(aiTopic)}
                disabled={aiLoading || !aiTopic}
                className="px-8 py-3 rounded-xl font-bold bg-white text-indigo-900 hover:bg-indigo-50 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {aiLoading ? t("ai_thinking", "Thinking...") : t("ai_ask_button", "✨ Ask AI")}
              </button>
            </div>

            {/* Topic Preset Buttons */}
            <div className="flex flex-wrap gap-3">
              {aiTopics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => generateAiContent(t.value)}
                  disabled={aiLoading}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 border border-indigo-700/50 hover:bg-indigo-700 hover:border-indigo-600 ${aiTopic === t.value
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                    : 'bg-indigo-800/40 text-indigo-100'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* AI Generated Content */}
            {aiContent && (
              <div className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/10 animate-fade-in-up">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg">🤖</div>
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-indigo-300">Question</span>
                    <span className="font-bold text-lg">{aiTopic}</span>
                  </div>
                </div>
                <div className="text-indigo-50 leading-relaxed whitespace-pre-wrap text-lg border-t border-white/10 pt-4">
                  {aiContent}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ============================================ */}
        {/*   🎨 AI POSTER GENERATOR (GenAI Section)    */}
        {/* ============================================ */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 to-orange-600 text-white shadow-2xl p-8 md:p-12">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <span className="bg-rose-700 p-2 rounded-xl border border-rose-500">🎨</span> {t("poster_maker_title", "AI Poster Maker")}
                </h2>
                <p className="text-rose-100 text-lg">{t("poster_maker_subtitle", "Create instant awareness posters for your community.")}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {posterTopics.slice(0, 3).map((t, idx) => (
                  <button key={idx} onClick={() => generatePoster(t.value)} className="px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-sm font-medium hover:bg-white/30 transition-colors">
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mb-8">
              <input
                type="text"
                placeholder={t("poster_placeholder", "Enter a topic (e.g. 'Save Water')...")}
                className="flex-1 bg-white/20 backdrop-blur border border-white/30 text-white placeholder-rose-200 px-5 py-3 rounded-xl outline-none focus:bg-white/30 transition-all font-medium"
                value={posterTopic}
                onChange={(e) => setPosterTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && posterTopic && generatePoster(posterTopic)}
              />
              <button
                onClick={() => posterTopic && generatePoster(posterTopic)}
                disabled={posterLoading || !posterTopic}
                className="px-6 py-3 bg-white text-rose-600 font-bold rounded-xl shadow-lg hover:bg-rose-50 transition-all"
              >
                {posterLoading ? (
                  <span className="animate-pulse">{loadingMessage}</span>
                ) : t("poster_create_button", "Create")}
              </button>
            </div>

            {/* Poster Result */}
            {posterData && !posterData.error && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl text-gray-900 animate-scale-in">
                <h3 className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">{t("poster_preview", "Generated Poster Preview")}</h3>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="relative group rounded-2xl overflow-hidden shadow-lg">
                    {/* Image Loader */}
                    {!posterImageLoaded && (
                      <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 font-medium">{t("poster_loading_image", "Loading Image...")}</div>
                    )}
                    <img
                      src={posterData.imageUrl}
                      alt="Generated Poster"
                      className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onLoad={() => setPosterImageLoaded(true)}
                      crossOrigin="anonymous"
                    />
                  </div>

                  <div>
                    {posterData.caption && (
                      <div className="space-y-6">
                        <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                          {posterData.caption.title}
                        </h2>
                        {posterData.caption.slogan && (
                          <div className="border-l-4 border-rose-500 pl-4 py-2 bg-rose-50 rounded-r-xl">
                            <p className="text-xl font-medium text-rose-700 italic">"{posterData.caption.slogan}"</p>
                          </div>
                        )}
                        {posterData.caption.bullets && (
                          <ul className="space-y-3">
                            {posterData.caption.bullets.map((b, i) => (
                              <li key={i} className="flex gap-3 text-gray-700 font-medium">
                                <span className="text-rose-500 text-xl">•</span> {b}
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="pt-4">
                          <a
                            href={posterData.imageUrl}
                            download={`agroaware-poster-${Date.now()}.png`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1"
                          >
                            📥 {t("poster_download", "Download Poster")}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Farming Tips Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <span className="bg-amber-100 text-amber-600 p-2 rounded-xl">📚</span> {content.farming_best_practices}
            </h2>
            <div className="hidden md:flex gap-2">
              {farmingTips.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${activeCategory === idx ? 'bg-amber-500 w-8' : 'bg-gray-200 hover:bg-amber-300'}`}
                  title={cat.category}
                />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar for Categories */}
            <div className="lg:col-span-1 space-y-2">
              {farmingTips.map((cat, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveCategory(idx)}
                  className={`w-full text-left px-5 py-4 rounded-xl font-semibold transition-all flex items-center gap-3 ${activeCategory === idx
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-xl">{cat.icon}</span> {cat.category}
                </button>
              ))}
            </div>

            {/* Active Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 h-full">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <span className="text-4xl">{farmingTips[activeCategory].icon}</span>
                  {farmingTips[activeCategory].category}
                </h3>
                <ul className="grid gap-4">
                  {farmingTips[activeCategory].content.map((tip, idx) => (
                    <li key={idx} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100 hover:bg-emerald-50 hover:border-emerald-100 transition-colors group">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 font-medium group-hover:text-emerald-900 leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Schemes & FAQs Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Government Schemes */}
          <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="bg-blue-100 text-blue-600 p-2 rounded-xl">🏛️</span> {content.govt_schemes_title}
            </h2>
            <div className="space-y-4">
              {governmentSchemes.map((scheme, idx) => (
                <a
                  key={idx}
                  href={scheme.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-50 hover:bg-blue-50 rounded-2xl p-5 transition-all border border-gray-100 hover:border-blue-100 group"
                >
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 mb-2 flex justify-between items-center">
                    {scheme.name}
                    <span className="text-gray-300 md:group-hover:translate-x-1 transition-transform">↗</span>
                  </h3>
                  <p className="text-gray-600 text-sm">{scheme.description}</p>
                </a>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <span className="bg-purple-100 text-purple-600 p-2 rounded-xl">❓</span> {content.faqs_title}
            </h2>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-gray-100 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className={`w-full px-6 py-4 text-left flex justify-between items-center font-bold text-gray-800 transition-colors ${openFaq === idx ? 'bg-purple-50 text-purple-800' : 'bg-white hover:bg-gray-50'}`}
                  >
                    {faq.q}
                    <span className={`transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden bg-purple-50/30 ${openFaq === idx ? 'max-h-40 p-6 pt-0' : 'max-h-0'}`}>
                    <p className="text-gray-600 pt-4 border-t border-purple-100">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Quick Stats */}
        <section className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h2 className="text-lg font-bold mb-8 text-center uppercase tracking-widest opacity-80">{content.stats_title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
            {[
              { val: "58%", label: content.stat_1_label },
              { val: "140M", label: content.stat_2_label },
              { val: "18%", label: content.stat_3_label },
              { val: "#2", label: content.stat_4_label }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl md:text-5xl font-black mb-2">{s.val}</div>
                <div className="text-emerald-200 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
