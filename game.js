// Create separate scenes for title and game
const TitleScene = new Phaser.Class({
    Extends: Phaser.Scene,
    
    initialize: function TitleScene() {
        Phaser.Scene.call(this, { key: 'TitleScene' });
    },

    create: function() {
        console.log('Game Event: Title Screen Created');
        
        // Add title text with correct game name
        this.add.text(300, 300, 'StrataBlitz', {
            fontSize: '64px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Add author text
        this.add.text(300, 380, 'by stealth', {
            fontSize: '24px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Add instruction text
        this.add.text(300, 450, 'Press 1 to Start', {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Add key listener for '1'
        this.input.keyboard.on('keydown-ONE', () => {
            console.log('Game Event: Starting new game');
            this.scene.start('GameScene');
        });
    }
});

// Update the main game scene
const GameScene = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function GameScene() {
        Phaser.Scene.call(this, { key: 'GameScene' });
        this.lastEnemySpawnTime = 0;
        this.enemySpawnInterval = 2000;
        this.gameOver = false;
        this.bossSpawned = false;
        this.currentLevel = 1;
        this.gameStartTime = 0;
    },

    preload: function() {
    console.log('Game: Loading assets...');
    this.load.spritesheet('player', 'assets/player_ship.png', { 
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.spritesheet('enemy_ship1', 'assets/enemy_ship1.png', { 
        frameWidth: 96,
        frameHeight: 96
    });
    this.load.spritesheet('enemy_ship2', 'assets/enemy_ship2.png', { 
        frameWidth: 64,
        frameHeight: 64
    });
    this.load.spritesheet('explosion', 'assets/explosion.png', { 
        frameWidth: 96,
        frameHeight: 96
    });
    this.load.image('bullet', 'assets/bullet.png');
    this.load.spritesheet('enemy_boss1', 'assets/enemy_boss1.png', { 
        frameWidth: 200,
        frameHeight: 200
    });
    this.load.image('background_level1', 'assets/background_level1.png');
    this.load.image('background_level2', 'assets/background_level2.png');
    
    // Load Level 2 assets
    this.load.image('enemy_tank1', 'assets/enemy_tank1.png');
    this.load.image('enemy_tank2', 'assets/enemy_tank2.png');
    this.load.image('enemy_boss2', 'assets/enemy_boss2.png');
    
    console.log('Game Event: Background textures loaded');
    },

    create: function() {
    console.log('Game: Initializing game elements...');
    // Set initial game time
    this.gameStartTime = this.time.now;
    this.lastEnemySpawnTime = this.time.now;
    
    // Create background first
    this.background = this.add.tileSprite(0, 0, 600, 800, 'background_level1');
    this.background.setOrigin(0, 0);
    console.log('Game Event: Level 1 background created');

    // Create player
    this.player = this.physics.add.sprite(300, 700, 'player');
    this.player.setCollideWorldBounds(true);
    console.log('Game Event: Player created');
    
    // Create groups
    this.bullets = this.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 30
    });
    
    this.enemies1 = this.physics.add.group();
    this.enemies2 = this.physics.add.group();

    // Create explosion animation
    this.anims.create({
        key: 'explosion',
        frames: this.anims.generateFrameNumbers('explosion', { 
            start: 0, 
            end: 5 
        }),
        frameRate: 20,
        duration: 1000,
        repeat: 0,
        hideOnComplete: true
    });

    // Set up keyboard input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // Game settings
    this.lastShot = 0;
    this.shootDelay = 250;
    this.bossSpawnTime = 10000; // 10 seconds
    this.scrollSpeed1 = -2;

    // Debug text for boss
    this.bossDebugText = this.add.text(10, 10, 'Boss: Not spawned', { 
        fontSize: '16px', 
        fill: '#fff' 
    });
    this.bossDebugText.setDepth(100);
    
    // Define collision handlers
    this.handleBulletEnemy1Collision = function(bullet, enemy) {
        console.log('Game Event: Bullet hit enemy1 at position:', { x: enemy.x, y: enemy.y });
        
        enemy.health--;
        bullet.destroy();

        if (enemy.health <= 0) {
            const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
            explosion.on('animationcomplete', () => {
                explosion.destroy();
            });
            explosion.play('explosion');
            
            enemy.destroy();
            console.log('Game Event: Enemy1 destroyed');
        } else {
            console.log('Game Event: Enemy1 damaged, health remaining:', enemy.health);
        }
    };
    
    this.handleBulletEnemy2Collision = function(bullet, enemy) {
        console.log('Game Event: Bullet hit enemy2 at position:', { x: enemy.x, y: enemy.y });
        
        const explosion = this.add.sprite(enemy.x, enemy.y, 'explosion');
        explosion.on('animationcomplete', () => {
            explosion.destroy();
        });
        explosion.play('explosion');
        
        bullet.destroy();
        enemy.destroy();
        console.log('Game Event: Enemy2 destroyed');
    };
    
    this.handlePlayerEnemyCollision = function(player, enemy) {
        if (!this.gameOver) {
            console.log('Game Event: Player collided with enemy - Game Over');
            this.gameOver = true;
            
            const explosion = this.add.sprite(player.x, player.y, 'explosion');
            explosion.on('animationcomplete', () => {
                explosion.destroy();
            });
            explosion.play('explosion');
            
            player.setVisible(false);
            
                this.handleGameOver();
        }
    };
    
    // Define boss bullet collision handler
    this.handleBossBulletCollision = function(boss, bullet) {
        if (!boss.health) return;

        bullet.destroy();
        boss.health--;
        
        console.log('Game Event: Boss hit! Health:', boss.health);
        this.updateBossDebug();

        // Flash the boss white when hit
        this.tweens.add({
            targets: boss,
            tint: 0xffffff,
            duration: 100,
            yoyo: true
        });

        if (boss.health <= 0) {
            console.log('Game Event: Boss defeated!');
            this.handleBossDefeat();
        }
    };

    // Set up collisions
    this.physics.add.overlap(this.bullets, this.enemies1, this.handleBulletEnemy1Collision, null, this);
    this.physics.add.overlap(this.bullets, this.enemies2, this.handleBulletEnemy2Collision, null, this);
    this.physics.add.overlap(this.player, this.enemies1, this.handlePlayerEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.enemies2, this.handlePlayerEnemyCollision, null, this);
    
    console.log('Game: Setup completed');

    // Add game restart handler
    this.handleGameRestart = () => {
        if (this.gameOver && this.spaceKey.isDown) {
            console.log('Game Event: Restarting game');
            this.scene.restart();
        }
    };

    // Define updateBossDebug once in create
    this.updateBossDebug = function() {
        if (this.boss && this.bossDebugText) {
            this.bossDebugText.setText(
                `Boss Health: ${this.boss.health}\n` +
                `Boss Position: ${Math.round(this.boss.x)}, ${Math.round(this.boss.y)}\n` +
                `Boss Velocity: ${Math.round(this.boss.body.velocity.x)}, ${Math.round(this.boss.body.velocity.y)}`
            );
        }
    };
    },

    handleGameOver: function() {
        console.log('Game Event: Game Over');
        this.gameOver = true;
        
        // Stop all enemies
        this.enemies1.children.iterate(enemy => enemy.setVelocity(0));
        this.enemies2.children.iterate(enemy => enemy.setVelocity(0));
        if (this.boss) this.boss.setVelocity(0);

        // Show game over text
        const gameOverText = this.add.text(300, 400, 'GAME OVER', {
            fontSize: '64px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Add instruction text
        this.add.text(300, 480, 'Press 1 to Play Again', {
            fontSize: '32px',
            fill: '#fff',
            align: 'center'
        }).setOrigin(0.5);

        // Add key listener for '1'
        this.input.keyboard.once('keydown-ONE', () => {
            console.log('Game Event: Restarting game from Game Over');
            this.scene.start('TitleScene');
        });
    },

    spawnEnemy: function() {
        if (this.gameOver || this.bossSpawned) return;

        const x = Phaser.Math.Between(50, 550);
        
        if (this.currentLevel === 1) {
            // Level 1 enemies
            const enemyType = Phaser.Math.Between(1, 2);
            if (enemyType === 1) {
                const enemy = this.enemies1.create(x, -50, 'enemy_ship1');
                enemy.setVelocityY(150); // Moderate speed
                enemy.health = 2; // Takes 2 shots to destroy
                enemy.body.setSize(96, 96);
                console.log('Game Event: Spawned enemy_ship1');
            } else {
                const enemy = this.enemies2.create(x, -50, 'enemy_ship2');
                enemy.setVelocityY(200); // Faster speed
                enemy.health = 1;
                enemy.body.setSize(64, 64);
                console.log('Game Event: Spawned enemy_ship2');
            }
        } else if (this.currentLevel === 2) {
            // Level 2 enemies
            const enemyType = Phaser.Math.Between(1, 2);
            if (enemyType === 1) {
                const enemy = this.enemies1.create(x, -50, 'enemy_tank1');
                enemy.setVelocityY(150); // Moderate speed
                enemy.health = 1; // 1 shot to destroy
                enemy.body.setSize(60, 96); // Correct size for tank1
                console.log('Game Event: Spawned enemy_tank1');
            } else {
                const enemy = this.enemies2.create(x, -50, 'enemy_tank2');
                enemy.setVelocityY(100); // Slow speed
                enemy.health = 3; // 3 shots to destroy
                enemy.body.setSize(96, 96);
                console.log('Game Event: Spawned enemy_tank2');
            }
        }
    },

    spawnBoss: function() {
        if (this.gameOver || this.bossSpawned) return;
        
        console.log('Game Event: Spawning boss');
        this.bossSpawned = true;

        // Create boss sprite
        this.boss = this.physics.add.sprite(300, 150, 'enemy_boss1');
        this.boss.health = 10;  // Explicitly set initial health
        this.boss.setVelocityX(100);
        this.boss.body.setSize(200, 200);

        // Add debug text only if it doesn't exist
        if (!this.bossDebugText) {
            this.bossDebugText = this.add.text(10, 50, '', { 
                fontSize: '16px', 
                fill: '#fff' 
            });
        }
        this.updateBossDebug();

        // Add collision detection
        this.physics.add.overlap(
            this.bullets,
            this.boss,
            this.handleBossBulletCollision,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.boss,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        console.log('Game Event: Boss spawned with health:', this.boss.health);
    },

    handleBossDefeat: function() {
        console.log('Game Event: Boss1 defeated - Transitioning to Level 2');
        
        // Store initial level 2 start time for boss2 spawn timing
        this.level2StartTime = this.time.now;
        
        // Remove boss1
        if (this.boss) {
            this.boss.destroy();
            this.boss = null;
        }
        if (this.bossDebugText) {
            this.bossDebugText.destroy();
            this.bossDebugText = null;
        }
        
        const fadeRect = this.add.rectangle(0, 0, 600, 800, 0x000000);
        fadeRect.setOrigin(0, 0);
        fadeRect.setAlpha(0);

        // Start level transition
        this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // Clear all enemies
                this.enemies1.clear(true, true);
                this.enemies2.clear(true, true);
                
                const levelText = this.add.text(300, 400, 'Level 2', {
                    fontSize: '64px',
                    fill: '#fff',
                    align: 'center'
                }).setOrigin(0.5);

                // Update background
                if (this.background) {
                    this.background.destroy();
                }
                this.background = this.add.tileSprite(0, 0, 600, 800, 'background_level2');
                this.background.setOrigin(0, 0);
                
                // Explicitly recreate player ship at the same position
                const playerPos = {
                    x: this.player.x,
                    y: this.player.y
                };
                
                this.player.destroy(); // Remove old player instance
                this.player = this.physics.add.sprite(playerPos.x, playerPos.y, 'player');
                this.player.setCollideWorldBounds(true);
                
                console.log('Game Event: Player recreated in Level 2');
                
                this.time.delayedCall(2000, () => {
                    this.tweens.add({
                        targets: [fadeRect, levelText],
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => {
                            fadeRect.destroy();
                            levelText.destroy();
                            
                            // Start Level 2
                            this.currentLevel = 2;
                            this.bossSpawned = false;
                            
                            console.log('Game Event: Level 2 started with visible player');
                        }
                    });
                });
            }
        });
    },

    spawnBoss2: function() {
        if (this.gameOver || this.bossSpawned) return;
        
        console.log('Game Event: Spawning Boss2');
        this.bossSpawned = true;

        // Create boss2 sprite above the screen
        this.boss = this.physics.add.sprite(300, -400, 'enemy_boss2');
        this.boss.health = 25; // Takes 25 missiles to kill
        this.boss.body.setSize(283, 400); // Correct size for boss2
        
        // Add debug text for boss2
        this.bossDebugText = this.add.text(10, 50, '', { 
            fontSize: '16px', 
            fill: '#fff' 
        });
        this.updateBossDebug();

        // Move boss2 to its position at the top center
        this.tweens.add({
            targets: this.boss,
            y: 200,  // Final position at top of screen
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                console.log('Game Event: Boss2 in position');
            }
        });

        // Add collision detection
        this.physics.add.overlap(
            this.bullets,
            this.boss,
            this.handleBoss2BulletCollision,
            null,
            this
        );

        this.physics.add.overlap(
            this.player,
            this.boss,
            this.handlePlayerEnemyCollision,
            null,
            this
        );

        console.log('Game Event: Boss2 spawned with health:', this.boss.health);
    },

    handleBoss2BulletCollision: function(boss, bullet) {
        if (!boss.health) return;

        bullet.destroy();
        boss.health--;
        
        console.log('Game Event: Boss2 hit! Health:', boss.health);
        this.updateBossDebug();

        // Flash the boss white when hit
        this.tweens.add({
            targets: boss,
            tint: 0xffffff,
            duration: 100,
            yoyo: true
        });

        if (boss.health <= 0) {
            console.log('Game Event: Boss2 defeated - Transitioning to End');
            this.transitionToEnd();
        }
    },

    transitionToEnd: function() {
        // Remove boss2
        if (this.boss) {
            this.boss.destroy();
            this.boss = null;
        }
        if (this.bossDebugText) {
            this.bossDebugText.destroy();
            this.bossDebugText = null;
        }

        // Create fade effect
        const fadeRect = this.add.rectangle(0, 0, 600, 800, 0x000000);
        fadeRect.setOrigin(0, 0);
        fadeRect.setAlpha(0);

        // Fade to black
        this.tweens.add({
            targets: fadeRect,
            alpha: 1,
            duration: 2000,
            onComplete: () => {
                // Clear all enemies
                this.enemies1.clear(true, true);
                this.enemies2.clear(true, true);
                
                const winText = this.add.text(300, 400, 'YOU WIN!', {
                    fontSize: '64px',
                    fill: '#fff',
                    align: 'center'
                }).setOrigin(0.5);
                
                // Stop all game activity
                this.gameOver = true;
                
                console.log('Game Event: Game Complete - You Win!');
            }
        });
    },

    update: function(time, delta) {
        if (this.gameOver) return;

        // Update background for vertical parallax
        if (this.background) {
            this.background.tilePositionY -= 2;
        }

        // Level-specific logic
        if (this.currentLevel === 1) {
            // Level 1 logic
            const timeInGame = time - this.gameStartTime;
            
            // Check for boss spawn
            if (!this.bossSpawned && timeInGame > 10000) {
                this.spawnBoss();
            }
            
            // Check for enemy spawn
            if (!this.bossSpawned && time > this.lastEnemySpawnTime + this.enemySpawnInterval) {
                console.log('Game Event: Attempting to spawn enemy at time:', timeInGame);
                this.spawnEnemy();
                this.lastEnemySpawnTime = time;
            }

            // Boss1 movement
            if (this.boss) {
                this.boss.angle += 1;
                if (this.boss.x >= 500 && this.boss.body.velocity.x > 0) {
                    this.boss.setVelocityX(-100);
                } else if (this.boss.x <= 100 && this.boss.body.velocity.x < 0) {
                    this.boss.setVelocityX(100);
                }
                this.updateBossDebug();
            }
        } else if (this.currentLevel === 2) {
            // Level 2 logic
            const timeInLevel2 = time - this.level2StartTime;
            
            // Spawn Boss2 after 10 seconds in Level 2
            if (!this.bossSpawned && timeInLevel2 > 10000) {
                this.spawnBoss2();
            }
            
            // Spawn tank enemies if boss2 isn't present
            if (time > this.lastEnemySpawnTime + this.enemySpawnInterval && !this.bossSpawned) {
                this.spawnEnemy();
                this.lastEnemySpawnTime = time;
            }
        }

        // Handle player movement
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        } else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown) {
            this.player.setVelocityY(-160);
        } else if (this.cursors.down.isDown) {
            this.player.setVelocityY(160);
        } else {
            this.player.setVelocityY(0);
        }

        // Background update
        this.background.tilePositionY += this.scrollSpeed1;

        // Clean up enemies that are off screen
        this.enemies1.children.each(function(enemy) {
            if (enemy.y > config.height + 48) {
                console.log('Game Event: Enemy1 escaped at position:', { x: enemy.x, y: enemy.y });
                enemy.destroy();
            }
        });

        this.enemies2.children.each(function(enemy) {
            if (enemy.y > config.height + 32) {
                console.log('Game Event: Enemy2 escaped at position:', { x: enemy.x, y: enemy.y });
                enemy.destroy();
            }
        });

        // Player movement
        const speed = 300;
        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown) {
            velocityX = -speed;
        } else if (this.cursors.right.isDown) {
            velocityX = speed;
        }

        if (this.cursors.up.isDown) {
            velocityY = -speed;
        } else if (this.cursors.down.isDown) {
            velocityY = speed;
        }

        // Normalize diagonal movement
        if (velocityX !== 0 && velocityY !== 0) {
            const normalizer = Math.sqrt(2);
            velocityX /= normalizer;
            velocityY /= normalizer;
        }

        this.player.setVelocity(velocityX, velocityY);

        // Keep player within bounds
        this.player.x = Phaser.Math.Clamp(this.player.x, 32, config.width - 32);
        this.player.y = Phaser.Math.Clamp(this.player.y, 32, config.height - 32);

        // Shooting
        if (this.spaceKey.isDown && time > this.lastShot + this.shootDelay) {
            const bullet = this.bullets.create(this.player.x, this.player.y - 40, 'bullet');
            if (bullet) {
                bullet.setVelocityY(-400);
                
                // Ensure bullet physics body is correct size
                bullet.body.setSize(10, 30); // Slightly smaller than sprite
                
                this.lastShot = time;
                console.log('Game Event: Player fired bullet at position:', { x: bullet.x, y: bullet.y });
            }
        }

        // Clean up bullets
        this.bullets.children.each(function(bullet) {
            if (bullet.y < -32) {
                bullet.destroy();
            }
        });

        // Add debug visualization for collisions
        if (this.physics.world.drawDebug) {
            // Enable debug visualization with key press
            if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('D'))) {
                this.physics.world.drawDebug = !this.physics.world.drawDebug;
                if (this.physics.world.debugGraphic) {
                    this.physics.world.debugGraphic.clear();
                }
            }
        }
    }
});

// Update the game config to include both scenes
const config = {
    type: Phaser.AUTO,
    width: 600,
    height: 800,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene]
};

const game = new Phaser.Game(config);