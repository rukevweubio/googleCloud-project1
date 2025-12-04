import React, { useState, useEffect, useRef } from 'react';

const MarioGame = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, gameover, won
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  
  const gameRef = useRef({
    player: { x: 50, y: 300, vx: 0, vy: 0, width: 32, height: 32, jumping: false, direction: 'right' },
    keys: {},
    coins: [],
    enemies: [],
    platforms: [],
    flag: null,
    camera: 0,
    gravity: 0.6,
    jumpPower: -12,
    moveSpeed: 5,
    maxVelocity: 15
  });

  const initLevel = (levelNum) => {
    const game = gameRef.current;
    game.player = { x: 50, y: 300, vx: 0, vy: 0, width: 32, height: 32, jumping: false, direction: 'right' };
    game.camera = 0;
    
    // Level design
    const levels = {
      1: {
        platforms: [
          { x: 0, y: 400, width: 2000, height: 50 },
          { x: 300, y: 320, width: 120, height: 20 },
          { x: 500, y: 260, width: 120, height: 20 },
          { x: 700, y: 200, width: 120, height: 20 },
          { x: 900, y: 260, width: 120, height: 20 },
          { x: 1100, y: 320, width: 120, height: 20 },
          { x: 1300, y: 260, width: 200, height: 20 }
        ],
        coins: [
          { x: 340, y: 270, collected: false },
          { x: 540, y: 210, collected: false },
          { x: 740, y: 150, collected: false },
          { x: 940, y: 210, collected: false },
          { x: 1140, y: 270, collected: false },
          { x: 1380, y: 210, collected: false }
        ],
        enemies: [
          { x: 400, y: 368, vx: -2, width: 30, height: 30 },
          { x: 800, y: 368, vx: 2, width: 30, height: 30 },
          { x: 1200, y: 368, vx: -2, width: 30, height: 30 }
        ],
        flag: { x: 1800, y: 250, width: 40, height: 150 }
      },
      2: {
        platforms: [
          { x: 0, y: 400, width: 2500, height: 50 },
          { x: 200, y: 340, width: 100, height: 20 },
          { x: 400, y: 280, width: 100, height: 20 },
          { x: 600, y: 220, width: 100, height: 20 },
          { x: 800, y: 280, width: 100, height: 20 },
          { x: 1000, y: 220, width: 100, height: 20 },
          { x: 1200, y: 160, width: 100, height: 20 },
          { x: 1400, y: 220, width: 100, height: 20 },
          { x: 1600, y: 280, width: 100, height: 20 },
          { x: 1800, y: 340, width: 200, height: 20 }
        ],
        coins: [
          { x: 240, y: 290, collected: false },
          { x: 440, y: 230, collected: false },
          { x: 640, y: 170, collected: false },
          { x: 840, y: 230, collected: false },
          { x: 1040, y: 170, collected: false },
          { x: 1240, y: 110, collected: false },
          { x: 1440, y: 170, collected: false },
          { x: 1640, y: 230, collected: false },
          { x: 1880, y: 290, collected: false }
        ],
        enemies: [
          { x: 300, y: 368, vx: -2, width: 30, height: 30 },
          { x: 700, y: 368, vx: 2, width: 30, height: 30 },
          { x: 1100, y: 368, vx: -2, width: 30, height: 30 },
          { x: 1500, y: 368, vx: 2, width: 30, height: 30 }
        ],
        flag: { x: 2200, y: 250, width: 40, height: 150 }
      }
    };
    
    const levelData = levels[levelNum] || levels[1];
    game.platforms = levelData.platforms;
    game.coins = levelData.coins;
    game.enemies = levelData.enemies;
    game.flag = levelData.flag;
  };

  useEffect(() => {
    if (gameState === 'playing') {
      initLevel(level);
    }
  }, [gameState, level]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      gameRef.current.keys[e.key] = true;
      if (e.key === ' ' && !gameRef.current.player.jumping) {
        gameRef.current.player.vy = gameRef.current.jumpPower;
        gameRef.current.player.jumping = true;
      }
    };

    const handleKeyUp = (e) => {
      gameRef.current.keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    const gameLoop = () => {
      const game = gameRef.current;
      
      // Player movement
      if (game.keys['ArrowLeft'] || game.keys['a']) {
        game.player.vx = -game.moveSpeed;
        game.player.direction = 'left';
      } else if (game.keys['ArrowRight'] || game.keys['d']) {
        game.player.vx = game.moveSpeed;
        game.player.direction = 'right';
      } else {
        game.player.vx *= 0.8;
      }

      // Apply gravity
      game.player.vy += game.gravity;
      game.player.vy = Math.min(game.player.vy, game.maxVelocity);

      // Update position
      game.player.x += game.player.vx;
      game.player.y += game.player.vy;

      // Platform collision
      game.player.jumping = true;
      game.platforms.forEach(platform => {
        if (game.player.x + game.player.width > platform.x &&
            game.player.x < platform.x + platform.width &&
            game.player.y + game.player.height > platform.y &&
            game.player.y + game.player.height < platform.y + 20 &&
            game.player.vy > 0) {
          game.player.y = platform.y - game.player.height;
          game.player.vy = 0;
          game.player.jumping = false;
        }
      });

      // Coin collection
      game.coins.forEach(coin => {
        if (!coin.collected &&
            game.player.x + game.player.width > coin.x &&
            game.player.x < coin.x + 20 &&
            game.player.y + game.player.height > coin.y &&
            game.player.y < coin.y + 20) {
          coin.collected = true;
          setScore(s => s + 100);
        }
      });

      // Enemy movement and collision
      game.enemies.forEach(enemy => {
        enemy.x += enemy.vx;
        
        // Enemy platform collision
        game.platforms.forEach(platform => {
          // Simple bounce logic based on world bounds, needs better edge detection
          if (enemy.x < platform.x || enemy.x + enemy.width > platform.x + platform.width) {
            enemy.vx *= -1;
          }
        });

        // Player-enemy collision
        if (game.player.x + game.player.width > enemy.x &&
            game.player.x < enemy.x + enemy.width &&
            game.player.y + game.player.height > enemy.y &&
            game.player.y < enemy.y + enemy.height) {
          
          // Jump on enemy
          if (game.player.vy > 0 && game.player.y + game.player.height - 10 < enemy.y) {
            enemy.x = -1000; // Remove enemy
            game.player.vy = -8;
            setScore(s => s + 200);
          } else {
            // Hit by enemy
            setLives(l => {
              const newLives = l - 1;
              if (newLives <= 0) {
                setGameState('gameover');
              } else {
                game.player.x = 50;
                game.player.y = 300;
                game.player.vx = 0;
                game.player.vy = 0;
              }
              return newLives;
            });
          }
        }
      });

      // Flag collision (level complete)
      if (game.flag &&
          game.player.x + game.player.width > game.flag.x &&
          game.player.x < game.flag.x + game.flag.width) {
        if (level === 2) {
          setGameState('won');
        } else {
          setLevel(l => l + 1);
          setGameState('start');
        }
      }

      // Fall off map
      if (game.player.y > 500) {
        setLives(l => {
          const newLives = l - 1;
          if (newLives <= 0) {
            setGameState('gameover');
          } else {
            game.player.x = 50;
            game.player.y = 300;
            game.player.vx = 0;
            game.player.vy = 0;
          }
          return newLives;
        });
      }

      // Camera follow player
      game.camera = Math.max(0, game.player.x - 300);

      // Clear canvas
      ctx.fillStyle = '#5c94fc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw clouds
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 5; i++) {
        const cloudX = (i * 400 - game.camera * 0.5) % 1200;
        ctx.fillRect(cloudX, 50 + i * 30, 60, 30);
        ctx.fillRect(cloudX + 20, 40 + i * 30, 60, 30);
      }

      // Draw platforms
      ctx.fillStyle = '#8B4513';
      game.platforms.forEach(platform => {
        ctx.fillRect(platform.x - game.camera, platform.y, platform.width, platform.height);
        ctx.fillStyle = '#228B22';
        ctx.fillRect(platform.x - game.camera, platform.y, platform.width, 5);
        ctx.fillStyle = '#8B4513';
      });

      // Draw coins
      ctx.fillStyle = '#FFD700';
      game.coins.forEach(coin => {
        if (!coin.collected) {
          ctx.beginPath();
          ctx.arc(coin.x + 10 - game.camera, coin.y + 10, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFA500';
          ctx.beginPath();
          ctx.arc(coin.x + 10 - game.camera, coin.y + 10, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFD700';
        }
      });

      // Draw enemies
      ctx.fillStyle = '#8B0000';
      game.enemies.forEach(enemy => {
        if (enemy.x > -1000) {
          ctx.fillRect(enemy.x - game.camera, enemy.y, enemy.width, enemy.height);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(enemy.x - game.camera + 8, enemy.y + 8, 6, 6);
          ctx.fillRect(enemy.x - game.camera + 18, enemy.y + 8, 6, 6);
          ctx.fillStyle = '#8B0000';
        }
      });

      // Draw flag
      if (game.flag) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(game.flag.x - game.camera, game.flag.y, 5, game.flag.height);
        ctx.fillStyle = '#00FF00';
        ctx.beginPath();
        ctx.moveTo(game.flag.x + 5 - game.camera, game.flag.y);
        ctx.lineTo(game.flag.x + 5 - game.camera, game.flag.y + 40);
        ctx.lineTo(game.flag.x + 35 - game.camera, game.flag.y + 20);
        ctx.fill();
      }

      // Draw player
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(game.player.x - game.camera, game.player.y, game.player.width, game.player.height);
      
      // Player face
      ctx.fillStyle = '#FFA07A';
      ctx.fillRect(game.player.x - game.camera + 8, game.player.y + 8, 16, 12);
      
      // Eyes
      ctx.fillStyle = '#000000';
      if (game.player.direction === 'right') {
        ctx.fillRect(game.player.x - game.camera + 12, game.player.y + 12, 3, 3);
        ctx.fillRect(game.player.x - game.camera + 18, game.player.y + 12, 3, 3);
      } else {
        ctx.fillRect(game.player.x - game.camera + 10, game.player.y + 12, 3, 3);
        ctx.fillRect(game.player.x - game.camera + 16, game.player.y + 12, 3, 3);
      }
      
      // Mustache
      ctx.fillStyle = '#000000';
      ctx.fillRect(game.player.x - game.camera + 10, game.player.y + 18, 12, 2);

      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => cancelAnimationFrame(animationId);
  }, [gameState, level]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLives(3);
  };

  const restartGame = () => {
    setGameState('start');
    setLevel(1);
    setScore(0);
    setLives(3);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-2xl">
        <div className="flex justify-between items-center mb-4 text-white">
          <div className="text-xl font-bold">Score: {score}</div>
          <div className="text-xl font-bold">Level: {level}</div>
          <div className="text-xl font-bold">Lives: {lives}</div>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={450}
            className="border-4 border-gray-600 rounded"
          />
          
          {gameState === 'start' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <h1 className="text-5xl font-bold text-white mb-4">Super Mario</h1>
              <p className="text-xl text-white mb-4">Level {level}</p>
              <button
                onClick={startGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Start Game
              </button>
              <div className="mt-6 text-white text-center">
                <p className="mb-2">Controls:</p>
                <p>Arrow Keys or A/D - Move</p>
                <p>Space - Jump</p>
              </div>
            </div>
          )}
          
          {gameState === 'gameover' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <h1 className="text-5xl font-bold text-red-600 mb-4">Game Over</h1>
              <p className="text-2xl text-white mb-4">Final Score: {score}</p>
              <button
                onClick={restartGame}
                className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
          
          {gameState === 'won' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded">
              <h1 className="text-5xl font-bold text-yellow-400 mb-4">You Won!</h1>
              <p className="text-2xl text-white mb-4">Final Score: {score}</p>
              <button
                onClick={restartGame}
                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center text-gray-400 text-sm">
          Collect coins, avoid enemies, reach the flag!
        </div>
      </div>
    </div>
  );
};

export default MarioGame;