# IELTS Writing Evaluator

An AI-powered tool that gives instant, examiner-level feedback on IELTS Writing answers for both Task 1 and Task 2.

## 🔗 Live Demo
[Try it here](https://ielts-writing-tool.vercel.app/)

## What it does
- Asks the user whether they are practising Task 1 or Task 2
- For Task 1: provides an image upload box for graph/chart screenshots
- Scores the answer across all 4 official IELTS criteria with a band score (1–9)
- Gives specific, actionable improvement suggestions for each criterion
- Generates a model answer at the student's target band (7, 7.5, 8, 8.5 or 9)
- Dynamic word count tracker with minimum word targets per task type

## Built with
- React + Vite (frontend)
- Node.js + Express (backend)
- Groq API with Llama 3.3 70B (AI evaluation)
- Deployed on Vercel (frontend) and Railway (backend)

## Demo
[Watch the demo](https://YOUR-YOUTUBE-LINK)

## How to run locally

**Frontend:**
```bash
cd ielts-writing-tool
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
node server.js
```

Add a `.env` file in the `backend` folder with:
```
GROQ_KEY=your-groq-api-key
```