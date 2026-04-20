# Technovation Video Talking Points

## Purpose
This document gives a clear, judge-friendly checklist of exactly what to say and show in:
1. Technical Video
2. Use Case Video

It is aligned to the scoring items you listed.

---

## 1) Technical Video - Must Cover These Scoring Items

## A. Demonstrate working parts of the app
Use this order in the video:
1. Home page loads.
2. Speech to Text: record voice or upload audio and show transcript result.
3. Translate and Speak: enter text, translate to another language, play spoken output.
4. Text to Sign Language: enter sentence, show generated sign animation/3D avatar output.
5. Mention backend API calls are running successfully.

Say this line:
"We are showing the real working flow end to end, not a mockup."

## B. Explain end users and show testing with them
Say clearly:
1. Primary users: Deaf or hard-of-hearing students, teachers, and hearing peers.
2. Secondary users: multilingual students, parents, and accessibility-focused schools.

Show evidence in the video:
1. One clip of a student or teacher trying Speech to Text.
2. One clip of a user trying Text to Sign Language.
3. A short feedback summary on-screen (what worked, what needed improvement).

Say this line:
"We tested with real target users and improved the app based on their feedback."

## C. AI usage question: YES/NO
Required item:
"Did you use AI to help with coding and or AI model building?"

Your current project answer:
YES

What to say:
1. "Yes, we used AI-enabled tools and AI models in development and app processing."
2. "For speech transcription we use Whisper-based processing."
3. "For sign animation pipeline we use MediaPipe-based landmark data."

## D. If judged under GenAI-assisted app criteria
You must explain process, tools, and prompts.

Use this format:
1. Tool used: GitHub Copilot/LLM assistant for code support.
2. Where used: debugging API paths, improving frontend-backend split, refactoring JS API base URL handling.
3. Prompt examples used by team:
   - "Help us make frontend and backend run on different ports without breaking API calls."
   - "Find why CSS assets return 404 after route changes."
   - "Analyze why old avatar hand movement is unstable."
4. What human team did after AI output:
   - reviewed generated code,
   - tested in browser and API,
   - accepted only validated changes.

Judge-friendly line:
"AI assisted our development speed, but all final decisions, testing, and validation were done by our team."

## E. If judged under Traditional coding criteria
Show 1 to 2 important coded parts, not login.

Pick these two:
1. Speech transcription pipeline
   - frontend uploads audio,
   - backend transcribe endpoint processes file,
   - result returned as JSON and displayed.
2. Text to Sign Language pipeline
   - text to ASL gloss endpoint,
   - pose stream endpoint,
   - frontend renders animation frames.

Say this line:
"We implemented and integrated these two core pipelines ourselves and iterated after testing."

## F. Iterative development process (must include feedback and testing)
Show timeline slide with 3 iterations:
1. Iteration 1: feature worked but CSS/path and route issues appeared.
2. Iteration 2: frontend-backend split introduced and API base URL handling stabilized.
3. Iteration 3: avatar quality analysis done; new MediaPipe/Kalidokit options evaluated for hand movement improvement.

Say this line:
"Each round of user testing and technical testing directly changed our implementation decisions."

---

## 2) Use Case Video - Points to Mention

## A. Problem
1. Deaf and hearing students struggle to communicate instantly in mixed classrooms.
2. Language barriers make communication harder in multicultural school environments.

## B. Who benefits
1. Deaf and hard-of-hearing students.
2. Teachers conducting inclusive classes.
3. Hearing classmates communicating with sign users.
4. Families with different spoken languages.

## C. Story format for the video
Use this 60-90 second flow:
1. Student speaks question in class.
2. App converts speech to text.
3. App translates when needed.
4. App displays sign animation for accessibility.
5. Deaf student understands and responds.

## D. Impact statement
Use one simple line:
"Our app turns one-way communication into two-way inclusive communication in schools."

## E. Why this matters for schools
1. Supports inclusive education goals.
2. Reduces communication dependency on one interpreter.
3. Helps teachers communicate faster with diverse classrooms.

---

## 3) Suggested 3-5 Minute Technical Video Script

## Opening (20-30 sec)
1. Team intro and project name.
2. Problem statement in one sentence.
3. Quick statement of target users.

## Demo (90-150 sec)
1. Speech to Text demo.
2. Translate and Speak demo.
3. Text to Sign Language demo.
4. Show that each feature returns real output.

## Build explanation (60-90 sec)
1. Explain frontend plus backend architecture.
2. Explain two key coded modules.
3. Explain AI usage decision: YES.

## Testing and iteration (40-60 sec)
1. Who tested the app.
2. What feedback was received.
3. What changes were made after feedback.

## Closing (20-30 sec)
1. Social impact in school context.
2. Next improvement goals.

---

## 4) Evidence checklist before recording

1. App runs locally with no blocking errors.
2. All demo pages load with CSS and JS.
3. API endpoints respond during recording.
4. You have at least 2 user feedback quotes.
5. You have one iteration timeline slide.
6. You have one architecture slide.

---

## 5) Short one-line answers for judges

1. What problem are you solving?
"Inclusive communication between deaf, hearing, and multilingual users in schools."

2. Who are your end users?
"Students, teachers, and families in inclusive and multilingual learning environments."

3. Did you use AI?
"Yes. We used AI-assisted development tools and AI/ML processing components in our pipeline."

4. What did your team build in code?
"Core speech transcription integration and text-to-sign animation pipeline with backend APIs and frontend rendering."

5. How did you iterate?
"We tested with users, captured feedback, fixed technical issues, and improved architecture and feature reliability each cycle."
