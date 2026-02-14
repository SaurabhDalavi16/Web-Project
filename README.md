# Web-Project

A collection of web projects and games.

## Projects

### 2048 Game
A modern, responsive implementation of the classic 2048 puzzle game built with HTML, CSS, and JavaScript.

#### Features
- **Smooth Animations**: Fluid tile movements and merging animations
- **Touch Support**: Works on both desktop (arrow keys) and mobile devices (touch/swipe)
- **Score Tracking**: Current score and best score persistence using localStorage
- **Responsive Design**: Adapts to different screen sizes
- **Modern UI**: Beautiful gradient design with glassmorphism effects

#### How to Play
1. Use arrow keys (desktop) or swipe gestures (mobile) to move tiles
2. When two tiles with the same number touch, they merge into one
3. Create a tile with the number 2048 to win!
4. The game ends when you can't make any more moves

#### Game Controls
- **Desktop**: Use arrow keys (↑ ↓ ← →)
- **Mobile**: Swipe in any direction

#### File Structure
```
games/
└── 2048-game/
    ├── index.html    # Main HTML structure
    ├── style.css     # Styling and animations
    └── script.js     # Game logic and interactions
```

#### Getting Started
1. Clone this repository
2. Navigate to `games/2048-game/`
3. Open `index.html` in your web browser

#### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients, animations, and responsive design
- **JavaScript (ES6+)**: Game logic, state management, and DOM manipulation

#### Game Features
- 4x4 grid gameplay
- Random tile generation (90% chance of 2, 10% chance of 4)
- Score calculation and best score tracking
- Win condition detection (reaching 2048)
- Game over detection
- Smooth tile animations
- Mobile-responsive design

Enjoy playing! 🎮
