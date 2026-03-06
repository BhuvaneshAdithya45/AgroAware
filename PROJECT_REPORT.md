# AgroAware — Complete Project Report (A to Z)

> **A Generative AI-Based Farming Advisor and Awareness Platform**

---

## 1. Project Overview

**AgroAware** is a comprehensive, full-stack digital advisory platform designed to empower Indian farmers through AI-powered decision support. The platform integrates **Ensemble Machine Learning** for precision crop recommendation, a **Retrieval-Augmented Generation (RAG)** pipeline for document-grounded conversational assistance, and a **vernacular-first multilingual interface** supporting five Indian languages with bi-directional voice interaction.

### 1.1 Problem Statement
- 58% of India's population depends on agriculture, yet farmers lack access to data-driven decision tools
- Smallholder farmers (86% of the agrarian population) rely on traditional experience-based methods
- Existing AI tools produce raw numerical outputs without contextual explanations
- Most agricultural software is English-only, alienating 90%+ of the multilingual farming community
- Government scheme information is scattered across hard-to-navigate bureaucratic portals

### 1.2 Solution
AgroAware is a unified platform that combines:
1. **ML-powered crop prediction** — Ensemble model with 95.40% accuracy and 97.98% precision
2. **AI-powered conversational advisory** — RAG-grounded chatbot using verified agricultural documents
3. **Multilingual voice interface** — 5 languages with speech-to-text and text-to-speech
4. **Government scheme discovery** — Searchable, filterable scheme database with dynamic translation
5. **Awareness module** — AI-generated farming tips, posters, and educational content

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React.js + Vite (Port 5173) | Single-page application with modern UI |
| **Backend** | Node.js + Express.js (Port 5000) | API gateway, authentication, orchestration |
| **ML Service** | Python + FastAPI (Port 8800) | ML inference, RAG pipeline, fertilizer engine |
| **Database** | MongoDB Atlas | User data, authentication |
| **LLM** | Groq API (Kimi K2 model) | Conversational AI, content generation |
| **Embeddings** | Sentence Transformers (all-MiniLM-L6-v2) | RAG semantic search |
| **Image Gen** | Pollinations.ai | AI poster generation |
| **Weather** | OpenWeatherMap API | Real-time weather data |
| **Styling** | Tailwind CSS | Modern, responsive UI design |
| **Auth** | JWT + bcrypt | Secure user authentication |

---

## 3. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                       │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐  │
│  │  Home   │ │Dashboard │ │  Crop    │ │Awareness│ │  Schemes   │  │
│  │         │ │          │ │ Advisory │ │   Hub   │ │            │  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────┘ └────────────┘  │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐                 │
│  │  Voice  │ │   RAG    │ │  Login   │ │ Signup  │                 │
│  │Assistant│ │  Upload  │ │          │ │         │                 │
│  └─────────┘ └──────────┘ └──────────┘ └─────────┘                 │
│  ┌──────────────────┐  ┌─────────────────────┐                      │
│  │  Floating Chat   │  │  Language Selector   │                     │
│  │  (All Pages)     │  │  (EN/KN/HI/TE/TA)   │                     │
│  └──────────────────┘  └─────────────────────┘                      │
├──────────────────────────────────────────────────────────────────────┤
│                    BACKEND (Node.js + Express)                       │
│  ┌──────────┐ ┌────────────┐ ┌───────────┐ ┌──────────────────┐    │
│  │ /auth    │ │ /advisory  │ │/recommend │ │ /seasonal        │    │
│  │ (JWT)    │ │(Chat,Poster│ │ (ML Proxy)│ │ (Seasonal Crops) │    │
│  │          │ │ Translate) │ │           │ │                  │    │
│  └──────────┘ └────────────┘ └───────────┘ └──────────────────┘    │
├──────────────────────────────────────────────────────────────────────┤
│                    ML SERVICE (Python + FastAPI)                      │
│  ┌──────────┐ ┌────────────┐ ┌──────────────────────────────────┐  │
│  │ /predict │ │ /fertilizer│ │ /rag/upload + /rag/ask           │  │
│  │ Ensemble │ │  Rule-based│ │ PDF→Chunks→Embeddings→Search     │  │
│  │ ML Model │ │  NPK Logic │ │ MiniLM + Cosine Similarity      │  │
│  └──────────┘ └────────────┘ └──────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────────┤
│                     EXTERNAL APIs                                    │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────┐                │
│  │ Groq API │ │Pollinations  │ │ OpenWeatherMap   │                │
│  │(Kimi K2) │ │(Image Gen)   │ │ (Weather Data)   │                │
│  └──────────┘ └──────────────┘ └──────────────────┘                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Features — Detailed Description

### 4.1 Crop Advisory (CropAdvisory.jsx — 566 lines)

**Purpose:** Predict the best crop to grow based on soil and climate conditions.

**Two Modes:**
- **Expert Mode:** Farmer manually enters Nitrogen (N), Phosphorus (P), Potassium (K), pH, Temperature, and Rainfall values
- **Beginner Mode:** Farmer selects State → District → Season, and the system auto-fills average soil/climate values

**How It Works:**
1. User inputs 6 soil-climate features
2. Frontend sends data to Express backend → FastAPI ML service
3. Ensemble model (4 ML algorithms) predicts Top-3 crops with confidence scores
4. Fertilizer recommendation engine analyzes NPK levels for the predicted crop
5. Results displayed with crop names translated to user's language

**Technical Details:**
- Input validation with hard errors (negative values) and soft warnings (borderline ranges)
- Auto-fill from OpenWeatherMap API for temperature/rainfall
- 40 crop translations × 5 languages = 200 translations
- Confidence scores displayed as percentages

### 4.2 AI Chatbot (AdvisoryChat.jsx + FloatingChat.jsx)

**Purpose:** AI-powered conversational farming assistant available on every page.

**3-Tier Routing Architecture:**
1. **Tier 1 — RAG:** If user has uploaded PDFs, the system first searches the document vector store. If relevant chunks are found (cosine similarity), the LLM generates a response grounded in the document content
2. **Tier 2 — Scheme Detection:** If the question contains scheme-related keywords (in English, Hindi, Kannada, or Telugu), the LLM is prompted with government scheme context data
3. **Tier 3 — General Farming:** Fallback to general agricultural advisory using the LLM

**Features:**
- Voice input (microphone button → Speech-to-Text)
- Voice output (speaker button → Text-to-Speech on any message)
- Floating chat bubble accessible from all pages
- Language-aware prompts (LLM responds in user's selected language)
- Response source tracking (shows "document", "schemes", or "general")

### 4.3 Awareness Hub (Awareness.jsx — 757 lines)

**Purpose:** Educational farming content with AI-generated articles and posters.

**Sections:**
- **Farming Tips:** 4 categories (Soil Health, Water Management, Pest Control, Modern Techniques) × 5 tips each
- **Government Schemes:** Quick reference of major schemes with links
- **FAQs:** Common farming questions with answers
- **Agriculture Statistics:** India agriculture facts and figures

**AI Features:**
- **AI Farming Advisor:** 6 preset topics + custom input → Groq LLM generates detailed farming articles
- **AI Poster Generator:** User enters topic → Groq generates caption (title + slogan + bullet points) + Pollinations.ai generates matching poster image
- **Poster Download:** html2canvas captures the poster as an image for download
- **Poster History:** Last 5 generated posters cached for quick access

**Translations:** All static content available in 5 languages (English, Hindi, Kannada, Telugu, Tamil)

### 4.4 Government Schemes (Schemes.jsx — 454 lines)

**Purpose:** Discover and understand government agricultural schemes.

**Features:**
- 12 government schemes with full details (eligibility, benefits, application process, website, helpline)
- Smart filtering by crop, state, land size, and keyword search
- Dynamic translation via Groq LLM (translate any scheme to any of 5 languages)
- Speaker button to read scheme details aloud
- Direct links to official scheme websites

### 4.5 Voice Assistant (Voice.jsx — 237 lines)

**Purpose:** Full-screen, hands-free voice interaction with the AI.

**How It Works:**
1. User presses microphone → Web Speech API starts listening
2. Speech converted to text in user's language
3. Text sent to AI Chat pipeline
4. AI response read aloud via Text-to-Speech
5. Supports all 5 languages with correct BCP-47 language codes

**Features:**
- 4 preset sample questions in user's language
- Visual recording indicator
- Language-aware speech recognition

### 4.6 RAG Document Q&A (RagUpload.jsx — 266 lines)

**Purpose:** Upload agriculture PDFs and ask questions about them.

**Pipeline:**
1. User uploads PDF via drag-and-drop or file picker
2. `PyPDF` extracts text from PDF
3. Text split into chunks (size: 500 characters, overlap: 100 characters)
4. `all-MiniLM-L6-v2` Sentence Transformer generates embeddings for each chunk
5. Embeddings stored in in-memory vector store
6. User asks a question → question embedded → cosine similarity search → top-3 most relevant chunks retrieved
7. Retrieved chunks + question sent to Groq LLM for grounded response

### 4.7 Dashboard (Dashboard.jsx — 240 lines)

**Purpose:** Central hub with quick access to all features.

**Components:**
- Feature grid with cards linking to all 6 tools
- Real-time weather widget (temperature, humidity, wind from OpenWeatherMap)
- Recent activity (last crop prediction)
- Locale-aware greeting (Good Morning/Afternoon/Evening in user's language)

### 4.8 Home Page (Home.jsx — 448 lines)

**Purpose:** Landing page showcasing the platform.

**Design:**
- Hero section with glassmorphism overlay and gradient background
- Feature showcase with 6 tools highlighted with "New"/"Live" badges
- Smart CTAs: "Go to Dashboard" for logged-in users, "Explore/Sign Up" for guests
- Protected navigation redirecting guests to Login
- Animated elements and micro-interactions

### 4.9 Authentication (Login.jsx, Signup.jsx)

**Purpose:** Secure user registration and login.

**Features:**
- JWT-based authentication with MongoDB user storage
- bcrypt password hashing
- Protected routes — all feature pages require login
- Auto-redirect for already logged-in users
- Immersive full-screen forms with glassmorphism design

---

## 5. Machine Learning Pipeline

### 5.1 Dataset
| Parameter | Value |
|-----------|-------|
| Total Samples | 36,160 |
| Training Set | 18,080 (50%) |
| Testing Set | 18,080 (50%) |
| Input Features | N, P, K, pH, Temperature, Rainfall |
| Number of Features | 6 |
| Output Classes | 40 crop categories |
| Split Strategy | Stratified 50:50 |

### 5.2 Preprocessing
- **StandardScaler**: Normalizes all 6 features to zero mean and unit variance
- **LabelEncoder**: Encodes 40 crop names into numerical labels

### 5.3 Ensemble Model — Weighted Soft-Voting
Four base models are combined using Weighted Soft-Voting:

| Model | Key Hyperparameters |
|-------|-------------------|
| Decision Tree | random_state = 42 |
| Random Forest | n_estimators = 120, n_jobs = -1, random_state = 42 |
| XGBoost | n_estimators = 140, learning_rate = 0.07, max_depth = 6, subsample = 0.9, colsample_bytree = 0.9 |
| Logistic Regression | max_iter = 2000, n_jobs = -1, random_state = 42 |

**Ensemble Prediction Formula:**
```
ŷ = argmax_c Σ(i=1 to M) w_i · P_i,c(x)
```
Where `w_i` is the weight for model `i`, `P_i,c(x)` is the probability for class `c`, and `M = 4`.

### 5.4 Results

| Model | Accuracy | Precision | Recall | F1-Score |
|-------|----------|-----------|--------|----------|
| Decision Tree | 95.50% | 95.62% | 95.50% | 95.49% |
| Random Forest | 95.50% | 95.62% | 95.50% | 95.49% |
| XGBoost | 92.38% | 93.30% | 92.38% | 92.47% |
| Logistic Regression | 88.15% | 88.53% | 88.15% | 87.78% |
| **Ensemble (Weighted Soft-Voting)** | **95.40%** | **97.98%** | **95.40%** | **95.24%** |

**Key Finding:** The ensemble achieves the highest precision (97.98%) — critical for agriculture where a false recommendation can lead to economic loss.

### 5.5 Fertilizer Recommendation Engine
- Rule-based NPK analysis for 53 crop varieties
- Compares input N, P, K values against ideal ranges stored in `fertilizer_data.py`
- Provides specific recommendations (e.g., "Add 20-30 kg/ha more Nitrogen")

---

## 6. RAG (Retrieval-Augmented Generation) Pipeline

### 6.1 Architecture
```
PDF Upload → Text Extraction (PyPDF) → Text Chunking (500 chars, 100 overlap)
    → Embedding (all-MiniLM-L6-v2) → Vector Store (NumPy in-memory)

User Query → Query Embedding → Cosine Similarity Search → Top-3 Chunks
    → Groq LLM (Kimi K2) → Grounded Response
```

### 6.2 Components
| Component | File | Technology |
|-----------|------|-----------|
| PDF Loader | `rag/pdf_loader.py` | PyPDF |
| Text Splitter | `rag/text_splitter.py` | Custom (chunk_size=500, overlap=100) |
| Embeddings | `rag/embeddings.py` | Sentence Transformers (all-MiniLM-L6-v2) |
| Vector Store | `rag/vector_store.py` | NumPy (cosine similarity) |

### 6.3 Purpose
Prevents LLM hallucination by grounding responses in uploaded agricultural documents (reports, guidelines, manuals). The LLM is instructed to answer ONLY from the retrieved context, ensuring factually accurate advice.

---

## 7. Multilingual Architecture

### 7.1 5 Supported Languages
| Language | Code | Coverage |
|----------|------|----------|
| English | en | Full |
| Hindi | hi | Full |
| Kannada | kn | Full |
| Telugu | te | Full |
| Tamil | ta | Full |

### 7.2 Translation Layers
| Layer | Approach | Files |
|-------|----------|-------|
| UI strings | Static JSON dictionaries | `en.json`, `hi.json`, `kn.json`, `te.json`, `ta.json` |
| Crop names | Static JavaScript map | `cropTranslations.js` (40 crops × 5 languages) |
| Scheme UI labels | Static inline translations | `Schemes.jsx` |
| Awareness content | Static inline translations | `Awareness.jsx` (all 5 languages) |
| Scheme details | Dynamic API translation | `/api/advisory/translate` via Groq LLM |
| Chat/Poster output | LLM-generated in target language | Groq prompt includes language parameter |

### 7.3 Voice Support
- **Speech-to-Text (STT):** Web Speech API `SpeechRecognition` with language-specific BCP-47 codes
- **Text-to-Speech (TTS):** Web Speech API `SpeechSynthesis` with language matching

---

## 8. Security Implementation

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt with salt rounds |
| HTTP Security | Helmet.js (secure headers) |
| CORS | Strict origin whitelist |
| Rate Limiting | 100 requests/minute via express-rate-limit |
| Protected Routes | Frontend route guards requiring valid JWT |
| Input Validation | Server-side validation for all ML inputs |
| Error Handling | Centralized error handler with graceful fallbacks |

---

## 9. File Structure

```
agroaware/
├── client/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/                   # 9 page components
│   │   │   ├── Home.jsx             # Landing page (448 lines)
│   │   │   ├── Dashboard.jsx        # Feature hub (240 lines)
│   │   │   ├── CropAdvisory.jsx     # Crop prediction (566 lines)
│   │   │   ├── Awareness.jsx        # Awareness hub (757 lines)
│   │   │   ├── Schemes.jsx          # Govt schemes (454 lines)
│   │   │   ├── Voice.jsx            # Voice assistant (237 lines)
│   │   │   ├── RagUpload.jsx        # RAG Q&A (266 lines)
│   │   │   ├── Login.jsx            # Login page
│   │   │   └── Signup.jsx           # Signup page
│   │   ├── components/              # 12 reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── FloatingChat.jsx
│   │   │   ├── AdvisoryChat.jsx
│   │   │   ├── WeatherWidget.jsx
│   │   │   ├── SpeakerButton.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── lib/                     # Utility libraries
│   │   │   ├── api.js               # API client
│   │   │   ├── auth.js              # Auth helpers
│   │   │   ├── tts.js               # Text-to-Speech
│   │   │   └── cropTranslations.js  # 40 crops × 5 languages
│   │   ├── i18n/                    # Translation files
│   │   │   ├── index.jsx            # Language provider
│   │   │   ├── en.json              # English (300+ keys)
│   │   │   ├── hi.json              # Hindi
│   │   │   ├── kn.json              # Kannada
│   │   │   ├── te.json              # Telugu
│   │   │   └── ta.json              # Tamil
│   │   └── data/
│   │       ├── schemes.json         # 12 govt schemes
│   │       └── districts.js         # Indian districts data
│   └── package.json
│
├── server/                          # Backend (Express.js)
│   ├── index.js                     # Server entry, CORS, Helmet, rate limiting
│   ├── src/
│   │   ├── routes/
│   │   │   ├── advisory.js          # Chat, Poster, Translate, Crop (312 lines)
│   │   │   ├── auth.js              # JWT login/signup (~100 lines)
│   │   │   ├── recommend.js         # ML recommendation proxy (~130 lines)
│   │   │   └── seasonal.js          # Seasonal crop data (~140 lines)
│   │   └── data/
│   │       └── seasonalCrops.js     # Seasonal crop database
│   └── package.json
│
├── ml_service/                      # ML Service (FastAPI)
│   ├── api.py                       # FastAPI endpoints (245 lines)
│   ├── train.py                     # Ensemble training pipeline (603 lines)
│   ├── fertilizer.py                # Fertilizer recommendation engine
│   ├── fertilizer_data.py           # NPK ranges for 53 crops
│   ├── crop_model.pkl               # Trained ensemble model
│   ├── rag/                         # RAG pipeline
│   │   ├── pdf_loader.py            # PDF text extraction
│   │   ├── text_splitter.py         # Text chunking
│   │   ├── embeddings.py            # Sentence Transformer embeddings
│   │   └── vector_store.py          # Cosine similarity search
│   ├── tests/
│   │   └── test_api.py              # Automated test suite (157 lines)
│   ├── Train Dataset.csv            # Training data (18,080 samples)
│   ├── Test Dataset.csv             # Testing data (18,080 samples)
│   └── requirements.txt             # Python dependencies
│
└── PROJECT_REPORT.md                # This file
```

---

## 10. How to Run the Project

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB Atlas account
- Groq API key
- OpenWeatherMap API key

### Step 1: Clone the Repository
```bash
git clone https://github.com/BhuvaneshAdithya45/AgroAware.git
cd AgroAware
```

### Step 2: Set Up Environment Variables

**Create `server/.env`:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/agroaware
JWT_SECRET=your_jwt_secret_here
GROQ_API_KEY=your_groq_api_key_here
```

**Create `client/.env`:**
```env
VITE_API_URL=http://localhost:5000
VITE_WEATHER_API_KEY=your_openweathermap_api_key
```

### Step 3: Install Dependencies & Run

**Terminal 1 — ML Service (Port 8800):**
```bash
cd ml_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --host 0.0.0.0 --port 8800
```

**Terminal 2 — Backend (Port 5000):**
```bash
cd server
npm install
npm start
```

**Terminal 3 — Frontend (Port 5173):**
```bash
cd client
npm install
npm run dev
```

### Step 4: Access the Application
Open `http://localhost:5173` in your browser.

---

## 11. API Endpoints

### Backend (Express.js — Port 5000)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | User login (returns JWT) |
| POST | `/api/advisory/chat` | AI chat (3-tier routing) |
| POST | `/api/advisory/poster` | AI poster generation |
| POST | `/api/advisory/translate` | Dynamic translation via Groq |
| POST | `/api/advisory/crop` | Crop prediction bridge |
| GET | `/api/advisory/seasonal` | Get seasonal crop data |
| POST | `/api/recommend` | ML recommendation proxy |

### ML Service (FastAPI — Port 8800)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/predict` | Ensemble crop prediction |
| POST | `/fertilizer` | NPK-based fertilizer recommendation |
| POST | `/rag/upload` | Upload PDF for RAG |
| POST | `/rag/ask` | Query RAG vector store |

---

## 12. External Dependencies

### Python (ml_service/requirements.txt)
```
fastapi
uvicorn
scikit-learn
xgboost
numpy
pandas
joblib
sentence-transformers
pypdf
```

### Node.js (server/package.json)
```
express, cors, helmet, express-rate-limit,
jsonwebtoken, bcryptjs, mongoose, groq-sdk, dotenv
```

### React (client/package.json)
```
react, react-dom, react-router-dom, axios,
html2canvas, framer-motion
```

---

## 13. Team Members

| Name | USN | Role |
|------|-----|------|
| Dr. Vijaya Shetty S | Guide | Project Guide |
| B V Ila Koul | 1nt22cs049 | Team Member |
| Bhuvanesh Adithya M C | 1nt22cs052 | Team Member |
| Naveen Kumar | 1nt23cs406 | Team Member |
| Sharanu Nagappa Mesta | 1nt23cs412 | Team Member |

**Institution:** Nitte Meenakshi Institute of Technology (NMIT, Deemed to be University), Bengaluru, India
**Department:** Computer Science and Engineering

---

## 14. IEEE Paper

The project has been documented in an IEEE-formatted research paper titled:

> **"AgroAware: A Generative AI-Based Farming Advisor and Awareness Platform"**

**Submitted to:** ICISCN2026 (International Conference)

**Key Results:**
- Ensemble model achieves 97.98% precision and 95.40% accuracy
- First system to unify ML prediction + RAG advisory + Voice + Multilingual + Scheme Discovery
- RAG pipeline prevents LLM hallucination through document-grounded responses

---

## 15. Project Statistics

| Metric | Value |
|--------|-------|
| Total Files | ~46 |
| Total Lines of Code | ~7,200 |
| Frontend Pages | 9 |
| Frontend Components | 12 |
| Backend Routes | 4 |
| ML Models | 4 (in ensemble) |
| Crops Supported | 40 |
| Languages Supported | 5 |
| Government Schemes | 12 |
| Fertilizer Rules | 53 crops |
| Dataset Size | 36,160 samples |
| ML Accuracy | 95.40% |
| ML Precision | 97.98% |

---

## 16. Screenshots

> To be added by team members during the demo.

**Pages to screenshot:**
1. Home Page (Hero section)
2. Login / Signup
3. Dashboard (with weather widget)
4. Crop Advisory — Expert Mode (with results)
5. Crop Advisory — Beginner Mode
6. AI Chat (showing RAG response)
7. Awareness Hub (AI Farming Advisor)
8. AI Poster Generator (generated poster)
9. Government Schemes (with translation)
10. Voice Assistant (recording state)
11. RAG Document Upload (with Q&A)
12. Language switching (same page in different languages)

---

*Report generated on: March 6, 2026*
*Repository: https://github.com/BhuvaneshAdithya45/AgroAware*
