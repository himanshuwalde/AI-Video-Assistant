# 🎥 AI Video Assistant

**Turn lengthy videos into structured knowledge with AI.**

AI Video Assistant is an AI-powered video summarization and analysis application that transforms YouTube videos and local audio/video files into meaningful, searchable information.

It automatically extracts audio, generates transcripts, creates concise summaries, identifies important action items and key decisions, and lets users interact with the processed content through an AI-powered conversational interface.

Built using Python, LangChain, speech recognition models, and Large Language Models (LLMs), the project aims to make consuming and understanding lengthy video content faster and more productive.

## ✨ Features

- **YouTube Video Processing:** Extract audio directly from YouTube videos using a video URL.
- **Local File Support:** Upload and process locally stored audio and video files.
- **AI-Powered Transcription:** Convert speech into text using OpenAI Whisper and Sarvam AI.
- **Multilingual Support:** Supports English and Hinglish transcription workflows.
- **Intelligent Summarization:** Generate concise, structured summaries from lengthy transcripts.
- **Automatic Title Generation:** Generate meaningful titles based on video content.
- **Action Item Extraction:** Identify important tasks and actionable points.
- **Key Decision Detection:** Extract important decisions discussed in the video.
- **Open Question Identification:** Discover unresolved questions and discussion points.
- **Conversational AI:** Ask questions about processed videos and receive context-aware answers.
- **Retrieval-Augmented Generation (RAG):** Retrieve relevant transcript information to generate context-grounded responses.
- **Modern Web Interface:** Interact with the application through a dedicated frontend and Python backend.

## 🏗️ Architecture

The application follows a modular architecture that separates the frontend, API layer, and AI processing pipeline.

```text
              USER INPUT
                   |
          +--------+--------+
          |                 |
      YouTube URL       Local File
          |                 |
          +--------+--------+
                   |
             AUDIO PROCESSOR
                   |
          Audio Extraction
          Format Conversion
          Audio Chunking
                   |
                   v
            TRANSCRIPTION
           /             \
      Whisper          Sarvam AI
      English          Hinglish
           \             /
            +-----------+
                  |
                  v
             AI PROCESSING
                  |
        +---------+---------+
        |         |         |
     Summary   Decisions  Action Items
        |         |         |
        +---------+---------+
                  |
             RAG PIPELINE
                  |
           Vector Database
                  |
             AI CHATBOT
                  |
                  v
            USER INTERFACE
```

## 🧠 How It Works

1. **Input Processing:** The user provides a YouTube URL or uploads a local media file.
2. **Audio Extraction:** The application extracts audio and converts it into WAV format.
3. **Audio Chunking:** Large audio files are divided into smaller chunks for efficient processing.
4. **Speech Recognition:** Whisper or Sarvam AI generates the transcript depending on the selected language.
5. **AI Analysis:** LangChain orchestrates LLM-powered title generation, summarization, action item extraction, and decision identification.
6. **Knowledge Indexing:** The transcript is processed and indexed to support semantic retrieval.
7. **Conversational Interaction:** Users can ask questions about the video and receive answers grounded in its transcript.

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| Programming Language | Python |
| Frontend | React, JavaScript |
| Backend API | FastAPI |
| AI Orchestration | LangChain |
| LLM Integration | Groq |
| Speech Recognition | OpenAI Whisper, Sarvam AI |
| Audio Processing | FFmpeg, Pydub |
| Video Downloading | yt-dlp |
| RAG | LangChain, ChromaDB |
| Embeddings | Sentence Transformers |
| Environment Management | Python venv, python-dotenv |
| API Server | Uvicorn |

## 📁 Project Structure

```text
AI-Video-Assistant/
│
├── core/
│   ├── transcriber.py
│   ├── summarizer.py
│   ├── extractor.py
│   ├── rag_engine.py
│   └── vector_store.py
│
├── frontend/
│   └── React application
│
├── utils/
│   └── audio_processor.py
│
├── downloads/
│   └── uploads/
│
├── main.py
├── server.py
├── requirements.txt
├── .env
└── .gitignore
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/himanshuwalde/AI-Video-Assistant.git

cd AI-Video-Assistant
```

### 2. Create a Virtual Environment

```bash
python -m venv .venv
```

Activate the environment:

**Windows (PowerShell):**

```powershell
.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install FFmpeg

FFmpeg is required for audio extraction and conversion.

Download it from:

https://ffmpeg.org/download.html

Make sure FFmpeg is added to your system PATH.

### 5. Configure Environment Variables

Create a `.env` file in the project root directory.

```env
GROQ_API_KEY=your_groq_api_key
SARVAM_API_KEY=your_sarvam_api_key

WHISPER_MODEL=small
SARVAM_STT_MODEL=saaras:v2.5
```

Replace the placeholder values with your actual API credentials.

**API Providers:**
- Groq: https://console.groq.com/
- Sarvam AI: https://dashboard.sarvam.ai/

Never commit your `.env` file or expose API keys publicly.

## 🚀 Running the Application

### Option 1: Run the Python Pipeline

```bash
python main.py
```

Provide a YouTube URL or local media file path when prompted.

Select the transcription language:

```text
english
```

or

```text
hinglish
```

### Option 2: Run the FastAPI Backend

Start the backend server:

```bash
uvicorn server:app --reload --port 8000
```

The API will be available at:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

### 3. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server runs on the Vite development port.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/jobs` | Retrieve processing jobs |
| POST | `/api/jobs` | Submit a YouTube URL or media file |
| GET | `/api/jobs/{job_id}` | Retrieve processing status and results |
| DELETE | `/api/jobs/{job_id}` | Delete a processing session |
| POST | `/api/jobs/{job_id}/chat` | Ask questions about processed content |

## 🔮 Future Enhancements

- Support for additional languages and transcription models.
- Improved real-time processing progress and streaming responses.
- Export summaries and transcripts as PDF and TXT files.
- Timestamp-based transcript navigation.
- Video chapter generation and topic segmentation.
- Persistent conversation and processing history.
- Enhanced RAG retrieval and response accuracy.
- Cloud deployment and scalable processing infrastructure.

## 🎯 Project Objective

The objective of AI Video Assistant is to simplify information consumption by transforming unstructured video and audio content into structured, searchable, and actionable knowledge.

Instead of spending hours watching lengthy videos, users can quickly understand the important concepts, decisions, and discussions while retaining the ability to explore the original content through conversational AI.

## 👨‍💻 Author

**Himanshu Walde**

Computer Science Engineering | AI & ML Enthusiast | Software Developer

- GitHub: [@himanshuwalde](https://github.com/himanshuwalde)
- LinkedIn: [Himanshu Walde](https://www.linkedin.com/in/himanshuwalde/)

---

⭐ If you find this project interesting, consider giving it a star!

**Built with Python, AI, and a passion for solving real-world problems.**
