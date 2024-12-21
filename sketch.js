let spriteSheets = {};
let animations = {};
let currentAnimation1; // 角色1的當前動畫
let currentAnimation2; // 角色2的當前動畫
let isAnimating1 = false; // 角色1是否在動畫中
let isAnimating2 = false; // 角色2是否在動畫中
let facingRight1 = true;  // 角色1朝向
let facingRight2 = true;  // 角色2朝向
let characterX1 = -700;     // 角色1 X軸位置
let characterY1 = 0;     // 角色1 Y軸位置
let characterX2 = 700;     // 角色2 X軸位置
let characterY2 = 0;     // 角色2 Y軸位置
let velocityY1 = 0;      // 角色1 Y軸速度
let velocityY2 = 0;      // 角色2 Y軸速度
let isJumping1 = false;  // 角色1 跳躍狀態
let isJumping2 = false;  // 角色2 跳躍狀態
let backgroundImage; 
const GRAVITY = 0.8;     // 重力
const JUMP_FORCE = -15;  // 跳躍力度
const MOVE_SPEED = 5;    // 移動速度
let floorY;              // 地板Y座標
let attackEffect1;       // 角色1 攻擊特效物件
let attackEffect2;       // 角色2 攻擊特效物件
const FLOOR_HEIGHT = 100; // 地板距離底部的高度
const ATTACK_MOVE_DISTANCE = 100; // 攻擊移動距離
const ATTACK_EFFECT_SPEED = 8;    // 攻擊特效移動速度

let isRunning1 = false; // 角色1是否在跑步
let isRunning2 = false; // 角色2是否在跑步

// 血量設定
let health1 = 100; // 角色1血量
let health2 = 100; // 角色2血量
let gameOver = false; // 遊戲結束狀態
let winner = ''; // 優勝者

function preload() {
  backgroundImage = loadImage('background.png');
  // 載入角色1的精靈圖片
  spriteSheets.character1 = {
    stance: loadImage('stance.png'),
    jump: loadImage('jump.png'),
    run: loadImage('run.png'),
    explotion: loadImage('explotion.png'),
    attack1: loadImage('1attack.png'),
    attack2: loadImage('2attack.png'),
    attackEffect: loadImage('1attack_air.png')
  };

  // 載入角色2的精靈圖片
  spriteSheets.character2 = {
    stance: loadImage('2stance.png'),
    jump: loadImage('2jump.png'),
    run: loadImage('2run.png'),
    explotion: loadImage('2explotion.png'),
    attack1: loadImage('3attack.png'),
    attack2: loadImage('4attack.png'),
    attackEffect: loadImage('3attack_air.png')
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  floorY = height - FLOOR_HEIGHT;  // 確保地板位置正確
  characterY1 = floorY - height / 2; // 確保角色1在地板上
  characterY2 = floorY - height / 2; // 確保角色2在地板上

  // 為角色1設置動畫參數
  animations.character1 = {
    stance: createAnimation(spriteSheets.character1.stance, 88, 109, 9, 10),
    jump: createAnimation(spriteSheets.character1.jump, 86, 123, 5, 10),
    run: createAnimation(spriteSheets.character1.run, 88, 90, 6, 5),
    explotion: createAnimation(spriteSheets.character1.explotion, 185, 192, 11, 8),
    attack1: createAnimation(spriteSheets.character1.attack1, 140, 172, 10, 2),
    attack2: createAnimation(spriteSheets.character1.attack2, 132, 153, 9, 5),
    attackEffect: createAnimation(spriteSheets.character1.attackEffect, 63, 123, 6, 50)
  };

  // 為角色2設置動畫參數
  animations.character2 = {
    stance: createAnimation(spriteSheets.character2.stance, 114.444444444, 86, 9, 10),
    jump: createAnimation(spriteSheets.character2.jump, 106, 123, 5, 10),
    run: createAnimation(spriteSheets.character2.run, 88, 90, 6, 100),
    explotion: createAnimation(spriteSheets.character2.explotion, 184.545454545, 192, 11, 8),
    attack1: createAnimation(spriteSheets.character2.attack1, 132.444444444, 153, 10, 3),
    attack2: createAnimation(spriteSheets.character2.attack2, 116, 116, 9, 5),
    attackEffect: createAnimation(spriteSheets.character2.attackEffect, 67, 64, 6, 50)
  };

  currentAnimation1 = animations.character1.stance; // 初始動畫為角色1的站立
  currentAnimation2 = animations.character2.stance; // 初始動畫為角色2的站立
}

function createAnimation(sheet, frameWidth, frameHeight, frames, frameDelay) {
  return {
    sheet: sheet,
    frameWidth: frameWidth,
    frameHeight: frameHeight,
    frames: frames,
    frameIndex: 0,
    frameDelay: frameDelay
  };
}

// 攻擊特效類
class AttackEffect {
  constructor(x, y, facingRight, character) {
    this.x = x;
    this.y = y;
    this.facingRight = facingRight;
    this.animation = character === 1 ? animations.character1.attackEffect : animations.character2.attackEffect; // 根據角色決定動畫
    this.frameIndex = 0;
    this.active = true;
  }

  update() {
    this.x += (this.facingRight ? ATTACK_EFFECT_SPEED : -ATTACK_EFFECT_SPEED);
    
    // 檢查攻擊特效是否與對方角色重疊
    if (this.facingRight && this.x > characterX2 - 50 && this.x < characterX2 + 50 && this.y === characterY2) {
      if (health2 > 0) health2 -= 10; // 扣除角色2血量
      this.active = false; // 攻擊特效消失
    } else if (!this.facingRight && this.x < characterX1 + 50 && this.x > characterX1 - 50 && this.y === characterY1) {
      if (health1 > 0) health1 -= 10; // 扣除角色1血量
      this.active = false; // 攻擊特效消失
    }

    if (frameCount % this.animation.frameDelay === 0) {
      this.frameIndex++;
      if (this.frameIndex >= this.animation.frames) {
        this.active = false;
      }
    }
  }

  draw() {
    push();
    translate(width / 2 + this.x, height / 2 + this.y);
    if (!this.facingRight) {
      scale(-1, 1);
    }
    image(
      this.animation.sheet,
      -this.animation.frameWidth / 2,
      -this.animation.frameHeight / 2,
      this.animation.frameWidth,
      this.animation.frameHeight,
      this.animation.frameWidth * this.frameIndex,
      0,
      this.animation.frameWidth,
      this.animation.frameHeight
    );
    pop();
  }
}

function draw() {
  image(backgroundImage, 0, 0, width, height);
  
  // 繪製地板
  stroke(0);
  strokeWeight(2);
  line(0, floorY, width, floorY);

  // 更新角色1的物理
  updateCharacter(1);
  // 更新角色2的物理
  updateCharacter(2);

  // 繪製攻擊特效
  if (attackEffect1 && attackEffect1.active) {
    attackEffect1.update();
    attackEffect1.draw();
  }
  if (attackEffect2 && attackEffect2.active) {
    attackEffect2.update();
    attackEffect2.draw();
  }

  // 繪製角色1
  drawCharacter(1);
  // 繪製角色2
  drawCharacter(2);

  // 繪製血量條
  drawHealthBars();

  // 檢查是否有角色血量歸0
  if (health1 <= 0 || health2 <= 0) {
    gameOver = true;
    winner = health1 <= 0 ? '角色二' : '角色一';
  }

  // 如果遊戲結束，顯示贏家和重製按鈕
  if (gameOver) {
    fill(0);
    textSize(32);
    textAlign(CENTER);
    text(`贏家是: ${winner}`, width / 2, height / 2 - 20);
    textSize(24);
    text("按下 R 鍵重製遊戲", width / 2, height / 2 + 20);
  }

  // 持續移動角色1
  if (isRunning1) {
    characterX1 += (facingRight1 ? MOVE_SPEED * 1.5 : -MOVE_SPEED * 1.5); // 增加移動速度
    currentAnimation1 = animations.character1.run; // 切換到跑步動畫
    currentAnimation1.frameIndex = (currentAnimation1.frameIndex + 1) % currentAnimation1.frames; // 更新動畫幀
  }

  // 持續移動角色2
  if (isRunning2) {
    characterX2 += (facingRight2 ? MOVE_SPEED * 1.5 : -MOVE_SPEED * 1.5); // 增加移動速度
    currentAnimation2 = animations.character2.run; // 切換到跑步動畫
    currentAnimation2.frameIndex = (currentAnimation2.frameIndex + 1) % currentAnimation2.frames; // 更新動畫幀
  }
}

function updateCharacter(character) {
  let characterX = character === 1 ? characterX1 : characterX2;
  let characterY = character === 1 ? characterY1 : characterY2;
  let isJumping = character === 1 ? isJumping1 : isJumping2;
  let velocityY = character === 1 ? velocityY1 : velocityY2;

  // 處理跳躍物理
  if (isJumping) {
    velocityY += GRAVITY;
    characterY += velocityY;

    // 著地檢測
    if (characterY >= floorY - height / 2) {
      characterY = floorY - height / 2;
      velocityY = 0;
      isJumping = false;
    }
  }

  // 更新角色位置
  if (character === 1) {
    characterX1 = characterX;
    characterY1 = characterY;
    isJumping1 = isJumping;
    velocityY1 = velocityY;
  } else {
    characterX2 = characterX;
    characterY2 = characterY;
    isJumping2 = isJumping;
    velocityY2 = velocityY;
  }
}

function drawCharacter(character) {
  let characterX = character === 1 ? characterX1 : characterX2;
  let characterY = character === 1 ? characterY1 : characterY2;
  let anim = character === 1 ? currentAnimation1 : currentAnimation2;

  push();
  translate(width / 2 + characterX, height / 2 + characterY);
  if (character === 1 && !facingRight1) {
    scale(-1, 1);
  } else if (character === 2 && !facingRight2) {
    scale(-1, 1);
  }
  image(
    anim.sheet,
    -anim.frameWidth / 2,
    -anim.frameHeight / 2,
    anim.frameWidth,
    anim.frameHeight,
    anim.frameWidth * anim.frameIndex,
    0,
    anim.frameWidth,
    anim.frameHeight
  );
  pop();

  // 更新動畫幀
  if (frameCount % anim.frameDelay === 0) {
    anim.frameIndex = (anim.frameIndex + 1) % anim.frames;

    // 如果動畫播放完畢且不是stance動作，則返回stance
    if (anim.frameIndex === 0 && (character === 1 ? isAnimating1 : isAnimating2)) {
      if (character === 1) {
        currentAnimation1 = animations.character1.stance; // 默認返回角色1的站立
        isAnimating1 = false;
      } else {
        currentAnimation2 = animations.character2.stance; // 默認返回角色2的站立
        isAnimating2 = false;
      }
    }
  }
}

function drawHealthBars() {
  // 繪製角色1的血量條
  fill(255, 0, 0);
  rect(10, 10, 100, 20); // 背景
  fill(0, 255, 0);
  rect(10, 10, health1, 20); // 當前血量
  fill(0); // 黑色文字
  textSize(16);
  text("角色一", 115, 27); // 角色1標籤

  // 繪製角色2的血量條
  fill(255, 0, 0);
  rect(width - 110, 10, 100, 20); // 背景
  fill(0, 255, 0);
  rect(width - 110, 10, health2, 20); // 當前血量
  fill(0); // 黑色文字
  textSize(16);
  text("角色二", width - 165, 27); // 角色2標籤
}

function keyPressed() {
  // 如果遊戲結束，按下 R 鍵重製
  if (gameOver && key === 'r') {
    resetGame();
    return;
  }

  // 角色1控制
  if (keyCode === UP_ARROW && !isJumping1 && !isAnimating1) {
    velocityY1 = JUMP_FORCE;
    isJumping1 = true;
    currentAnimation1 = animations.character1.jump;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
  } else if (keyCode === DOWN_ARROW && !isAnimating1 && !isJumping1) {
    currentAnimation1 = animations.character1.explotion;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
  } else if (key === '1' && !isAnimating1) {
    currentAnimation1 = animations.character1.attack1;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
    let effectX = characterX1 + (facingRight1 ? 100 : -100);
    attackEffect1 = new AttackEffect(effectX, characterY1, facingRight1, 1);
  } else if (key === '2' && !isAnimating1) {
    currentAnimation1 = animations.character1.attack2;
    currentAnimation1.frameIndex = 0;
    isAnimating1 = true;
    let moveDistance = facingRight1 ? ATTACK_MOVE_DISTANCE : -ATTACK_MOVE_DISTANCE;
    characterX1 += moveDistance;
  } else if (keyCode === LEFT_ARROW) { // 左鍵移動
    isRunning1 = true; // 設定角色1為跑步狀態
    facingRight1 = false; // 改變角色朝向
  } else if (keyCode === RIGHT_ARROW) { // 右鍵移動
    isRunning1 = true; // 設定角色1為跑步狀態
    facingRight1 = true; // 改變角色朝向
  }

  // 角色2控制
  if (key === 'w' && !isJumping2 && !isAnimating2) {
    velocityY2 = JUMP_FORCE;
    isJumping2 = true;
    currentAnimation2 = animations.character2.jump;
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
  } else if (key === 's' && !isAnimating2 && !isJumping2) {
    currentAnimation2 = animations.character2.explotion;
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
  } else if (key === 'a') { // 按下 'a' 鍵移動
    isRunning2 = true; // 設定角色2為跑步狀態
    facingRight2 = false; // 改變角色朝向
  } else if (key === 'd') { // 按下 'd' 鍵移動
    isRunning2 = true; // 設定角色2為跑步狀態
    facingRight2 = true; // 改變角色朝向
  } else if (key === 'j' && !isAnimating2) { // 按下 'j' 鍵觸發3attack
    currentAnimation2 = animations.character2.attack1; // 使用3attack動畫
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
    let effectX = characterX2 + (facingRight2 ? 100 : -100);
    attackEffect2 = new AttackEffect(effectX, characterY2, facingRight2, 2);
  } else if (key === 'k' && !isAnimating2) { // 按下 'k' 鍵觸發4attack
    currentAnimation2 = animations.character2.attack2; // 使用4attack動畫
    currentAnimation2.frameIndex = 0;
    isAnimating2 = true;
    let moveDistance = facingRight2 ? ATTACK_MOVE_DISTANCE : -ATTACK_MOVE_DISTANCE;
    characterX2 += moveDistance;
  }
}

function keyReleased() {
  // 角色1停止跑步
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    isRunning1 = false;
    currentAnimation1 = animations.character1.stance; // 返回站立動畫
  }

  // 角色2停止跑步
  if (key === 'a' || key === 'd') {
    isRunning2 = false;
    currentAnimation2 = animations.character2.stance; // 返回站立動畫
  }
}

// 重置遊戲
function resetGame() {
  health1 = 100;
  health2 = 100;
  gameOver = false;
  winner = '';
  characterX1 = -700;
  characterX2 = 700;
  velocityY1 = 0;
  velocityY2 = 0;
  isJumping1 = false;
  isJumping2 = false;
  isAnimating1 = false;
  isAnimating2 = false;
  currentAnimation1 = animations.character1.stance;
  currentAnimation2 = animations.character2.stance;
}
