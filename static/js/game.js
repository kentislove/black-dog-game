// 遊戲主程式
document.addEventListener('DOMContentLoaded', function() {
    // 遊戲畫布設定
    const gameCanvas = document.getElementById('gameCanvas');
    const ctx = gameCanvas.getContext('2d');
    
    // 設定畫布為滿版 1920x1080
    function resizeCanvas() {
        // 保持 16:9 的比例
        const targetRatio = 16 / 9;
        let width = window.innerWidth;
        let height = window.innerHeight;
        
        // 計算實際尺寸，保持比例
        if (width / height > targetRatio) {
            width = height * targetRatio;
        } else {
            height = width / targetRatio;
        }
        
        // 設定畫布尺寸
        gameCanvas.width = width;
        gameCanvas.height = height;
        
        // 更新遊戲比例尺
        gameScale = Math.min(width / 1920, height / 1080);
    }
    
    // 初始化並監聽視窗大小變化
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 遊戲資源載入
    const resources = {
        dog: {
            run: new Image(),
            jump: new Image(),
            bark: new Image()
        },
        backgrounds: {
            lake: new Image(),
            mountain: new Image(),
            city: new Image(),
            grassland: new Image()
        },
        powerups: {
            attack: new Image(),
            jump: new Image(),
            speed: new Image(),
            health: new Image()
        },
        enemies: {
            cat: new Image()
        },
        obstacles: {
            rock: new Image()
        }
    };
    
    // 載入所有圖片資源
    function loadResources() {
        // 角色圖片
        resources.dog.run.src = '/static/images/dog_character_right.png';
        resources.dog.jump.src = '/static/images/dog_jumping_right.png';
        resources.dog.bark.src = '/static/images/dog_barking_right.png';
        
        // 背景圖片
        resources.backgrounds.lake.src = '/static/images/background_lake_enhanced.png';
        resources.backgrounds.mountain.src = '/static/images/background_mountain_enhanced.png';
        resources.backgrounds.city.src = '/static/images/background_city_enhanced.png';
        resources.backgrounds.grassland.src = '/static/images/background_grassland_enhanced.png';
        
        // 能力道具圖片
        resources.powerups.attack.src = '/static/images/powerup_attack_transparent.png';
        resources.powerups.jump.src = '/static/images/powerup_jump_transparent.png';
        resources.powerups.speed.src = '/static/images/powerup_speed_transparent.png';
        resources.powerups.health.src = '/static/images/powerup_health_transparent.png';
        
        // 敵人圖片
        resources.enemies.cat.src = '/static/images/enemy_cat_transparent.png';
        
        // 障礙物圖片
        resources.obstacles.rock.src = '/static/images/obstacle_rock_transparent.png';
    }
    
    // 遊戲狀態
    const game = {
        score: 0,
        health: 3,
        isRunning: false,
        isPaused: false,
        currentBackground: 'lake',
        backgroundX: 0,
        backgroundSpeed: 3,
        powerups: {
            attack: 1,
            jump: 1,
            speed: 1
        }
    };
    
    // 玩家角色
    const player = {
        x: 150,
        y: 0,
        width: 120,
        height: 80,
        speedX: 0,
        speedY: 0,
        isJumping: false,
        isBarking: false,
        gravity: 0.5,
        jumpPower: 12,
        moveSpeed: 5,
        state: 'run'
    };
    
    // 敵人和障礙物陣列
    let enemies = [];
    let obstacles = [];
    let powerupItems = [];
    
    // 地面高度
    let groundLevel = 0;
    
    // 初始化遊戲
    function initGame() {
        loadResources();
        
        // 設定地面高度
        groundLevel = gameCanvas.height - 100;
        player.y = groundLevel - player.height;
        
        // 開始遊戲循環
        game.isRunning = true;
        gameLoop();
        
        // 每隔一段時間生成敵人
        setInterval(generateEnemy, 3000);
        
        // 每隔一段時間生成障礙物
        setInterval(generateObstacle, 2000);
        
        // 每隔一段時間生成能力道具
        setInterval(generatePowerup, 5000);
    }
    
    // 生成敵人
    function generateEnemy() {
        if (!game.isRunning || game.isPaused) return;
        
        const enemy = {
            x: gameCanvas.width,
            y: groundLevel - 60,
            width: 70,
            height: 60,
            speed: 4 + Math.random() * 2
        };
        
        enemies.push(enemy);
    }
    
    // 生成障礙物
    function generateObstacle() {
        if (!game.isRunning || game.isPaused) return;
        
        const obstacle = {
            x: gameCanvas.width,
            y: groundLevel - 50,
            width: 80,
            height: 50,
            speed: game.backgroundSpeed
        };
        
        obstacles.push(obstacle);
    }
    
    // 生成能力道具
    function generatePowerup() {
        if (!game.isRunning || game.isPaused) return;
        
        const types = ['attack', 'jump', 'speed', 'health'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerup = {
            x: gameCanvas.width,
            y: groundLevel - 100 - Math.random() * 150,
            width: 40,
            height: 40,
            type: type,
            speed: game.backgroundSpeed
        };
        
        powerupItems.push(powerup);
    }
    
    // 更新遊戲狀態
    function updateGame() {
        if (game.isPaused) return;
        
        // 更新背景位置
        game.backgroundX -= game.backgroundSpeed * game.powerups.speed;
        if (game.backgroundX <= -gameCanvas.width) {
            game.backgroundX = 0;
            
            // 切換背景
            const backgrounds = ['lake', 'mountain', 'city', 'grassland'];
            const currentIndex = backgrounds.indexOf(game.currentBackground);
            game.currentBackground = backgrounds[(currentIndex + 1) % backgrounds.length];
        }
        
        // 更新玩家位置
        if (player.isJumping) {
            player.y += player.speedY;
            player.speedY += player.gravity;
            
            // 著地檢測
            if (player.y >= groundLevel - player.height) {
                player.y = groundLevel - player.height;
                player.isJumping = false;
                player.state = 'run';
            }
        }
        
        // 更新敵人位置
        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].x -= enemies[i].speed * game.powerups.speed;
            
            // 移除超出畫面的敵人
            if (enemies[i].x < -enemies[i].width) {
                enemies.splice(i, 1);
                game.score += 5;
            }
            
            // 檢測與玩家的碰撞
            else if (checkCollision(player, enemies[i])) {
                if (player.isBarking) {
                    // 吼叫可以嚇跑敵人
                    enemies.splice(i, 1);
                    game.score += 10;
                } else {
                    // 被敵人攻擊
                    enemies.splice(i, 1);
                    game.health--;
                    
                    // 遊戲結束檢測
                    if (game.health <= 0) {
                        gameOver();
                    }
                }
            }
        }
        
        // 更新障礙物位置
        for (let i = obstacles.length - 1; i >= 0; i--) {
            obstacles[i].x -= obstacles[i].speed * game.powerups.speed;
            
            // 移除超出畫面的障礙物
            if (obstacles[i].x < -obstacles[i].width) {
                obstacles.splice(i, 1);
            }
            
            // 檢測與玩家的碰撞
            else if (checkCollision(player, obstacles[i])) {
                if (player.isJumping && player.speedY > 0) {
                    // 從上方跳到障礙物上
                    player.y = obstacles[i].y - player.height;
                    player.speedY = 0;
                } else if (!player.isJumping) {
                    // 撞到障礙物
                    game.health--;
                    obstacles.splice(i, 1);
                    
                    // 遊戲結束檢測
                    if (game.health <= 0) {
                        gameOver();
                    }
                }
            }
        }
        
        // 更新能力道具位置
        for (let i = powerupItems.length - 1; i >= 0; i--) {
            powerupItems[i].x -= powerupItems[i].speed * game.powerups.speed;
            
            // 移除超出畫面的道具
            if (powerupItems[i].x < -powerupItems[i].width) {
                powerupItems.splice(i, 1);
            }
            
            // 檢測與玩家的碰撞
            else if (checkCollision(player, powerupItems[i])) {
                const type = powerupItems[i].type;
                
                // 根據道具類型提升能力
                if (type === 'health') {
                    game.health++;
                } else {
                    game.powerups[type] += 0.2;
                }
                
                powerupItems.splice(i, 1);
                game.score += 15;
            }
        }
        
        // 更新吼叫狀態
        if (player.isBarking) {
            player.barkTimer--;
            if (player.barkTimer <= 0) {
                player.isBarking = false;
                player.state = player.isJumping ? 'jump' : 'run';
            }
        }
        
        // 增加分數
        game.score += 0.1;
    }
    
    // 繪製遊戲畫面
    function drawGame() {
        // 清空畫布
        ctx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
        
        // 繪製背景
        const bgImage = resources.backgrounds[game.currentBackground];
        if (bgImage.complete) {
            // 繪製兩張背景圖以實現無縫滾動
            ctx.drawImage(bgImage, game.backgroundX, 0, gameCanvas.width, gameCanvas.height);
            ctx.drawImage(bgImage, game.backgroundX + gameCanvas.width, 0, gameCanvas.width, gameCanvas.height);
        }
        
        // 繪製障礙物
        for (const obstacle of obstacles) {
            if (resources.obstacles.rock.complete) {
                ctx.drawImage(
                    resources.obstacles.rock,
                    obstacle.x,
                    obstacle.y,
                    obstacle.width,
                    obstacle.height
                );
            }
        }
        
        // 繪製能力道具
        for (const powerup of powerupItems) {
            const powerupImage = resources.powerups[powerup.type];
            if (powerupImage.complete) {
                ctx.drawImage(
                    powerupImage,
                    powerup.x,
                    powerup.y,
                    powerup.width,
                    powerup.height
                );
            }
        }
        
        // 繪製敵人
        for (const enemy of enemies) {
            if (resources.enemies.cat.complete) {
                ctx.drawImage(
                    resources.enemies.cat,
                    enemy.x,
                    enemy.y,
                    enemy.width,
                    enemy.height
                );
            }
        }
        
        // 繪製玩家
        let playerImage;
        if (player.isBarking) {
            playerImage = resources.dog.bark;
        } else if (player.isJumping) {
            playerImage = resources.dog.jump;
        } else {
            playerImage = resources.dog.run;
        }
        
        if (playerImage.complete) {
            ctx.drawImage(
                playerImage,
                player.x,
                player.y,
                player.width,
                player.height
            );
        }
        
        // 繪製UI
        drawUI();
    }
    
    // 繪製UI
    function drawUI() {
        // 設定文字樣式
        ctx.font = '24px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        
        // 繪製分數
        const scoreText = `分數: ${Math.floor(game.score)}`;
        ctx.strokeText(scoreText, 20, 40);
        ctx.fillText(scoreText, 20, 40);
        
        // 繪製生命值
        const healthText = `生命: ${game.health}`;
        ctx.strokeText(healthText, 20, 80);
        ctx.fillText(healthText, 20, 80);
        
        // 繪製能力值圖示
        const iconSize = 40;
        const iconSpacing = 10;
        const startX = gameCanvas.width - (iconSize + iconSpacing) * 3;
        const startY = 30;
        
        // 攻擊力
        if (resources.powerups.attack.complete) {
            ctx.drawImage(resources.powerups.attack, startX, startY, iconSize, iconSize);
            ctx.strokeText(`${game.powerups.attack.toFixed(1)}`, startX + iconSize + 5, startY + 30);
            ctx.fillText(`${game.powerups.attack.toFixed(1)}`, startX + iconSize + 5, startY + 30);
        }
        
        // 跳躍高度
        if (resources.powerups.jump.complete) {
            ctx.drawImage(resources.powerups.jump, startX + iconSize + iconSpacing, startY, iconSize, iconSize);
            ctx.strokeText(`${game.powerups.jump.toFixed(1)}`, startX + iconSize * 2 + iconSpacing + 5, startY + 30);
            ctx.fillText(`${game.powerups.jump.toFixed(1)}`, startX + iconSize * 2 + iconSpacing + 5, startY + 30);
        }
        
        // 速度
        if (resources.powerups.speed.complete) {
            ctx.drawImage(resources.powerups.speed, startX + (iconSize + iconSpacing) * 2, startY, iconSize, iconSize);
            ctx.strokeText(`${game.powerups.speed.toFixed(1)}`, startX + iconSize * 3 + iconSpacing * 2 + 5, startY + 30);
            ctx.fillText(`${game.powerups.speed.toFixed(1)}`, startX + iconSize * 3 + iconSpacing * 2 + 5, startY + 30);
        }
        
        // 如果遊戲暫停，顯示暫停訊息
        if (game.isPaused) {
            ctx.font = '48px Arial';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            
            const pauseText = '遊戲暫停';
            const textWidth = ctx.measureText(pauseText).width;
            
            ctx.strokeText(pauseText, (gameCanvas.width - textWidth) / 2, gameCanvas.height / 2);
            ctx.fillText(pauseText, (gameCanvas.width - textWidth) / 2, gameCanvas.height / 2);
        }
    }
    
    // 碰撞檢測
    function checkCollision(obj1, obj2) {
        return (
            obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y
        );
    }
    
    // 遊戲結束
    function gameOver() {
        game.isRunning = false;
        
        // 顯示遊戲結束訊息
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        
        const gameOverText = '遊戲結束';
        const scoreText = `最終分數: ${Math.floor(game.score)}`;
        const restartText = '按空格鍵重新開始';
        
        const gameOverWidth = ctx.measureText(gameOverText).width;
        const scoreWidth = ctx.measureText(scoreText).width;
        const restartWidth = ctx.measureText(restartText).width;
        
        ctx.strokeText(gameOverText, (gameCanvas.width - gameOverWidth) / 2, gameCanvas.height / 2 - 50);
        ctx.fillText(gameOverText, (gameCanvas.width - gameOverWidth) / 2, gameCanvas.height / 2 - 50);
        
        ctx.strokeText(scoreText, (gameCanvas.width - scoreWidth) / 2, gameCanvas.height / 2 + 20);
        ctx.fillText(scoreText, (gameCanvas.width - scoreWidth) / 2, gameCanvas.height / 2 + 20);
        
        ctx.strokeText(restartText, (gameCanvas.width - restartWidth) / 2, gameCanvas.height / 2 + 90);
        ctx.fillText(restartText, (gameCanvas.width - restartWidth) / 2, gameCanvas.height / 2 + 90);
    }
    
    // 重新開始遊戲
    function restartGame() {
        game.score = 0;
        game.health = 3;
        game.isRunning = true;
        game.isPaused = false;
        game.backgroundX = 0;
        game.powerups = {
            attack: 1,
            jump: 1,
            speed: 1
        };
        
        player.y = groundLevel - player.height;
        player.isJumping = false;
        player.isBarking = false;
        player.state = 'run';
        
        enemies = [];
        obstacles = [];
        powerupItems = [];
    }
    
    // 遊戲循環
    function gameLoop() {
        if (game.isRunning) {
            updateGame();
        }
        
        drawGame();
        requestAnimationFrame(gameLoop);
    }
    
    // 鍵盤控制
    document.addEventListener('keydown', function(event) {
        if (!game.isRunning && event.code === 'Space') {
            restartGame();
            return;
        }
        
        if (game.isPaused && event.code !== 'Escape') {
            return;
        }
        
        switch (event.code) {
            case 'ArrowLeft':
                player.speedX = -player.moveSpeed;
                break;
            case 'ArrowRight':
                player.speedX = player.moveSpeed;
                break;
            case 'Space':
                if (!player.isJumping) {
                    player.isJumping = true;
                    player.state = 'jump';
                    player.speedY = -player.jumpPower * game.powerups.jump;
                }
                break;
            case 'KeyZ':
                if (!player.isBarking) {
                    player.isBarking = true;
                    player.state = 'bark';
                    player.barkTimer = 20;
                }
                break;
            case 'Escape':
                game.isPaused = !game.isPaused;
                break;
        }
    });
    
    document.addEventListener('keyup', function(event) {
        switch (event.code) {
            case 'ArrowLeft':
            case 'ArrowRight':
                player.speedX = 0;
                break;
        }
    });
    
    // 觸控控制
    let touchControls;
    
    function setupTouchControls() {
        touchControls = document.createElement('div');
        touchControls.className = 'touch-controls';
        document.body.appendChild(touchControls);
        
        // 左右移動按鈕
        const leftBtn = document.createElement('button');
        leftBtn.className = 'control-btn left-btn';
        leftBtn.innerHTML = '←';
        touchControls.appendChild(leftBtn);
        
        const rightBtn = document.createElement('button');
        rightBtn.className = 'control-btn right-btn';
        rightBtn.innerHTML = '→';
        touchControls.appendChild(rightBtn);
        
        // 跳躍按鈕
        const jumpBtn = document.createElement('button');
        jumpBtn.className = 'control-btn jump-btn';
        jumpBtn.innerHTML = '跳躍';
        touchControls.appendChild(jumpBtn);
        
        // 吼叫按鈕
        const barkBtn = document.createElement('button');
        barkBtn.className = 'control-btn bark-btn';
        barkBtn.innerHTML = '吼叫';
        touchControls.appendChild(barkBtn);
        
        // 暫停按鈕
        const pauseBtn = document.createElement('button');
        pauseBtn.className = 'control-btn pause-btn';
        pauseBtn.innerHTML = '暫停';
        touchControls.appendChild(pauseBtn);
        
        // 觸控事件
        leftBtn.addEventListener('touchstart', function() {
            player.speedX = -player.moveSpeed;
        });
        
        leftBtn.addEventListener('touchend', function() {
            if (player.speedX < 0) player.speedX = 0;
        });
        
        rightBtn.addEventListener('touchstart', function() {
            player.speedX = player.moveSpeed;
        });
        
        rightBtn.addEventListener('touchend', function() {
            if (player.speedX > 0) player.speedX = 0;
        });
        
        jumpBtn.addEventListener('touchstart', function() {
            if (!player.isJumping) {
                player.isJumping = true;
                player.state = 'jump';
                player.speedY = -player.jumpPower * game.powerups.jump;
            }
        });
        
        barkBtn.addEventListener('touchstart', function() {
            if (!player.isBarking) {
                player.isBarking = true;
                player.state = 'bark';
                player.barkTimer = 20;
            }
        });
        
        pauseBtn.addEventListener('touchstart', function() {
            game.isPaused = !game.isPaused;
        });
    }
    
    // 檢測是否為行動裝置
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // 初始化遊戲
    if (isMobileDevice()) {
        setupTouchControls();
    }
    
    initGame();
});
