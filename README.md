# 🧮 100+ Language STEM Solver (Math, Physics, Chemistry)

**Developed by [Rashedul Albab](https://github.com/rashedulalbab253)**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AI Powered](https://img.shields.io/badge/AI-Powered-blueviolet)](https://deepmind.google/technologies/gemini/)
[![Docker](https://img.shields.io/badge/Container-Docker-blue)](https://www.docker.com/)

A powerful, AI-driven **multimodal reasoning engine** designed to break language barriers in STEM education. Whether it's a handwritten calculus problem, a physics circuit diagram, or a chemical equation, this app provides instant, step-by-step solutions in **over 100 languages** (including Bengali, Hindi, English, etc.).

---

## ✨ Features

- **🌍 100+ Language Support**: Explain complex concepts in your native language (Bengali, Hindi, Spanish, Arabic, etc.).
- **🔬 Multi-Subject Mastery**:
  - **Mathematics**: Algebra, Calculus, Geometry, Statistics.
  - **Physics**: Mechanics, Thermodynamics, Electromagnetism, Quantum Physics.
  - **Chemistry**: Stoichiometry, Organic Chemistry, Balancing Equations.
- **📸 AI Image Solver (OCR)**: Simply upload a photo or PDF of your homework/diagram, and the AI will analyze and solve it.
- **🔢 Step-by-Step Solutions**: Don't just get the answer; understand the process with detailed walkthroughs.
- **💡 "Explain Like I'm 5" Mode**: If the solution is too complex, one click gives you a simplified, easier-to-understand explanation focusing on core concepts.
- **🎨 Premium UI**: A modern, responsive interface built with Tailwind CSS, featuring glassmorphism and smooth animations.

---

## 🚀 Tech Stack

- **Frontend**: HTML5, Vanilla JavaScript, [Tailwind CSS](https://tailwindcss.com/)
- **Backend API**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **AI Engine**: [Google Gemini 2.5 Flash](https://deepmind.google/technologies/gemini/)
- **Cloud Platform**: [Docker Hub](https://hub.docker.com/) & GitHub Actions
- **Monitoring**: Google Analytics

---

## 🛠️ Project Structure

The project is organized into a clear Backend/Frontend separation:

```text
.
├── backend/                # FastAPI Backend
│   ├── main.py             # Server logic & Gemini integration
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Gemini API Key (keep secure!)
├── frontend/               # Plain HTML/CSS/JS Frontend
│   ├── index.html          # Structure
│   ├── style.css           # Styling
│   └── script.js           # Frontend logic
├── Dockerfile              # Docker image definition
├── docker-compose.yml      # Local orchestration
└── .github/workflows/      # CI/CD Pipeline
```

---

## ⚙️ Installation & Setup

### 🚀 Getting Started (FastAPI + HTML/CSS)
**Local Development:**
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `pip install -r requirements.txt`
3. Add your Gemini API Key to `.env`
4. Run the server: `python main.py`

**Frontend:**
1. Open `frontend/index.html` in your browser.
2. Ensure the `API_BASE_URL` in `script.js` matches your backend URL.

### 🐳 Docker Deployment
1. **Build the image**:
   ```bash
   docker build -t rashedulalbab1234/global-math-solver:latest .
   ```
2. **Run with Docker Compose**:
   ```bash
   docker-compose up -d
   ```
   *Note: Ensure your `.env` file is in `backend/` as it will be loaded by the container.*

---

### ☁️ Deploy on Hugging Face Spaces (Free & Easy)
1. **Create an Account**: Go to [huggingface.co](https://huggingface.co/) and sign up.
2. **Create a New Space**:
   * Click your profile picture -> **New Space**.
   * **Name**: `global-stem-solver` (or similar).
   * **License**: MIT.
   * **SDK**: Select **Docker**.
   * **Template**: Select **Blank**.
3. **Upload Files**:
   * Upload `Dockerfile`, `backend/`, `frontend/`, `requirements.txt` via web interface or git.
4. **Add Secret**:
   * Go to **Settings** -> **Variables and secrets**.
   * New Secret -> Name: `GEMINI_API_KEY`, Value: `(Your Key)`.
5. **Done!** Your app will build and launch automatically.

### ☁️ Deploy on Render
1. Push your code to a GitHub repository.
2. Log in to [Render](https://render.com/).
3. Click "New +" -> "Web Service".
4. Connect your GitHub repository.
5. Render will automatically detect the `render.yaml` or `Dockerfile` (if you choose Docker runtime).
6. **Important**: Add your `GEMINI_API_KEY` in the "Environment" tab on Render dashboard.

## 🏗️ CI/CD (GitHub Actions)
The project includes a GitHub Actions workflow to automatically build and push the Docker image to Docker Hub.
1. **Secrets required** in your GitHub repository:
   - `DOCKER_HUB_USERNAME`: `rashedulalbab1234`
   - `DOCKER_HUB_ACCESS_TOKEN`: Your Docker Hub Access Token.
2. The workflow triggers on every push to the `main` branch.

## 🛡️ Security & Scalability
- **Environment Variables**: API keys are stored in `.env` files and never exposed to the frontend.
- **FastAPI**: Provides a robust, asynchronous backend capable of handling multiple concurrent requests.
- **Gemini AI**: Uses the latest `gemini-2.5-flash` model for high-speed, accurate mathematical reasoning.

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---


