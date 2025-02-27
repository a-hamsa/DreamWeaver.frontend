# DreamWeaver - AI-Powered Dream Journal Frontend

## Overview
DreamWeaver's frontend is built using React with TypeScript, styled with Tailwind CSS, and optimized for fast development using Vite. The frontend allows users to interact seamlessly with the DreamWeaver platform, providing an intuitive UI for journaling, AI-powered analysis, and community collaboration.

## Features
- **User Authentication**: Secure sign-up and login system.
- **Dream Journal UI**: Rich text editor for users to log and manage their dreams.
- **AI Dream Analysis & Story Generation**: UI components to display AI-extracted themes and generated stories.
- **Community Gallery**: Interface for browsing, voting, and commenting on shared dreams.
- **Analytics Dashboard**: Data visualization for tracking dream trends and patterns.

## Tech Stack
- **Frontend**: React with TypeScript, Vite for development
- **Styling**: Tailwind CSS
- **State Management**: React Query / Redux Toolkit
- **API Integration**: Fetching data from ASP.NET Core Web API
- **Deployment**: Docker & Azure

## Installation & Setup
### Prerequisites
- Node.js & npm/yarn
- Docker
- Azure Subscription (for deployment)

### Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/a-hamsa/DreamWeaver.git
   cd DreamWeaver/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Deploy using Docker:
   ```bash
   docker build -t dreamweaver-frontend .
   docker run -p 3000:3000 dreamweaver-frontend
   ```
6. Deploy to Azure (Optional)

## To-do List
- [x] Landing Page
- [x] Login Page
- [x] Register Page
- [ ] Dashboard
- [ ] Dream Journal Page
- [ ] AI Analysis & Story Generation Page
- [x] Community Gallery Page
- [ ] Profile Page
- [ ] Analytics Dashboard
- [ ] Settings Page

## Contribution
If you'd like to contribute to DreamWeaver's frontend, feel free to fork the repo, create a new branch, and submit a pull request.

## License
This project is licensed under the MIT License.
