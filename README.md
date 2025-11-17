# Pacman Game - Web Version

A classic Pacman game built with React, TypeScript, and HTML5 Canvas.

## Features

- Classic Pacman gameplay with power-ups
- 4 company logo ghosts (HubSpot, Webflow, Wix, Zapier) with smart AI
- **Power pellets** that appear in random locations each game
- **Power mode**: Eat power pellets to make ghosts vulnerable and eat them for bonus points!
- **Pacman grows bigger** when powered up
- Ghosts turn blue and run away when vulnerable
- Smooth animations and responsive controls
- Score tracking with bonus points for eating ghosts (200 pts each!)
- Win/lose conditions
- Fully web-based - runs in any modern browser

## Local Development

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
cd web-version
npm install
```

### Setup Company Logo Images

Place these 4 PNG images in the `public` folder:
- `hubspot.png` - HubSpot logo
- `webflow.png` - Webflow logo
- `wix.png` - Wix logo
- `zapier.png` - Zapier logo

These images will appear as the ghosts in the game! The images will be automatically scaled to fit the ghost size.

### Run Development Server

```bash
npm run dev
```

Open your browser to the URL shown in the terminal (usually `http://localhost:5173`)

### Build for Production

```bash
npm run build
```

This creates a `dist` folder with optimized production files.

## How to Play

### Controls

- **Arrow Keys** or **WASD** to move Pacman
- **R** to restart after game over

### Objective

- Collect all the pellets to win
- Eat **power pellets** (big dots) to turn ghosts blue
- Chase and eat vulnerable ghosts for 200 points each!
- Avoid normal ghosts or they'll end your game

## Scoring

- Small pellet: **10 points**
- Power pellet: **50 points**
- Eating a ghost: **200 points**

## Game Elements

- **Yellow circle**: Pacman (you!) - grows bigger when powered up
- **Company logos**: HubSpot, Webflow, Wix, and Zapier ghosts
- **Blue ghosts**: Vulnerable ghosts (run away and can be eaten!)
- **Blue blocks**: Walls
- **Small white dots**: Regular pellets
- **Big white dots**: Power pellets (randomly placed each game!)

## AWS Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on deploying to AWS S3 + CloudFront.

## Technology Stack

- React 18
- TypeScript
- HTML5 Canvas
- Vite (build tool)
- CSS3
