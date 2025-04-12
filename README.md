# 🤖 Slack Approval Bot

This is a custom Slack bot built using Node.js and Express.js that handles approval workflows via Slack. Users can trigger an approval request using a slash command, select an approver, write a message, and get notified once their request is approved or rejected — all directly inside Slack!

---

## 📌 Features

- `/approval-test` slash command triggers a modal
- User selects an approver and writes a custom message
- The selected approver receives a DM with Approve/Reject buttons
- Requester gets notified based on approver's action
- Smooth, interactive Slack experience using Slack's Web API

---

## 🚀 Tech Stack

- Node.js
- Express.js
- Slack Web API
- Slack Interactivity (Slash Commands, Modals, Buttons)
- dotenv
- ngrok (for testing locally with Slack)

---

## 🛠️ How I Built It

### 🔗 Slack Setup

1. Created a Slack App from [Slack API Console](https://api.slack.com/apps)
2. Enabled:
   - Slash Commands
   - Interactivity & Shortcuts
   - Bot Token Scopes (like `commands`, `chat:write`, `users:read`)
3. Installed the app in a workspace and noted down:
   - **Bot Token**
   - **Signing Secret**

### 🧠 Workflow

- **Slash Command `/approval-test`** triggers a **modal**.
- User selects an approver and enters an approval message.
- Modal submission sends an approval message (with buttons) to the selected approver’s DM.
- Approver clicks either **Approve** or **Reject**.
- The original requester receives a confirmation in their DM.

---

## 🔧 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/slack-approval-bot.git
cd slack-approval-bot
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Create .env File
```bash
SLACK_BOT_TOKEN=xoxb-your-token
PORT=3000
```
### 4. Start the App
```bash
node index.js
```
### 5. Use Ngrok (for exposing localhost to Slack)
```bash
ngrok http 3000
```
Copy the ngrok HTTPS URL and use it to configure:

Slash command endpoint: /slack/commands

Interactivity endpoint: /slack/actions

📸 Demo
[Youtube Video](https://youtu.be/HcTyU7AvMtg)

🧑‍💻 Author
Neha Rawat
Frontend Developer & Node.js Enthusiast
🌐 [Portfolio](https://myportfolio-neha.netlify.app/) | 📩 neharawat0408@gmail.com

