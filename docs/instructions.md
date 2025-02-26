#StrataBlitz

##Description

Is a 2D Arcade Game where a ship has to survive other ships that come from up the screen. 

##technical considerations

1. The code runs in phaser
2. All assets are sprites
3. The Parallax on the background is vertical. All motion occurs from down to up
4. Background Screens are 600x800
5. the ship sprite will be 64x64
6. the bullet will be 12x32
7. enemy 1 are 96x96 and are named enemy_ship1
8. enemy 2 are 64x64 and are named enemy_ship2
9. boss1 is 200x200 and is named enemy_boss1
10. All assets are found in the folder assets
11. Add extra debug to the boss to track all events


##the game

1. the player will begin in the lower center. The player can move at any direction and shoots bullets up the screen

2. add logging about what is happening in the game. Print if there is an event on the console

3. enemies:
    - Level 1:
        Background screen for this level is background_level1.png
        This level begins after the title screen, when player press 1 to begin the game
        - Common enemies:
            - They com from above randomly. They will move linearly down.
            - enemy_ship1 don't shoot. Is moderate fast. Takes 2 shots do destroy
            - enemy_ship2 don't shoot. Is faster than enemy-ship1
        - Boss1:
            - boss1 is 200x200 and is named enemy_boss1.png
            - It spawns after 10 seconds of the init of the game.
            - While the boss is alive, no new common enemy ships appear
            - It moves from left to right, to left in a continuous loop
            - Boss1 rotates over the center of the image clockwise
            - to kill Boss1 it needs 10 bullet hits
            - when is defeated, the screen fades to black, shows "Level 2" and despawns. It continues 
    - Level 2:
        Background screen for this level is background_level2.png
        This level begins after defeating Boss1. The Boss1 disappears for the rest of the game.
        - Common enemies:
            - They com from above randomly. They will move linearly down.
            - enemy_tank1.png don't shoot. Is moderate fast. Takes 1 shots do destroy. its 60x96 pixels
            - enemy_tank2.png don't shoot. Is slow. Takes 3 shots do destroy
            
        - Boss2:
            - boss2 is 283x400 and is named enemy_boss2.png
            - boss2 spawns 10 seconds after beginning the level 2
            - it appears from outside the screen, onto the top-center of the screen and stays in top all the encounter
            - it takes 25 missiles to kill boss2
            - After killing boss2 continue to End
    - End
        - After killing boss2 the screen fades in black and you win the game






4. if a bullet collisions with an enemy it explodes

5. if the player collides with an enemy the game ends

## game player controls
    - The game statrs with a title screen. It says "Divergence" in the center of the screen, "by stealth" just below in small caps.
    - To begin to play, the user must press "1" for 1 player
    - The player 1 moves the ship with the arrows and fires missiles with the spacebar
    - If the game is over, it shows "Game Over" in the center of the screen and stops spawning ships.
    - To begin a new game after a Game Over, you must press 1 again


