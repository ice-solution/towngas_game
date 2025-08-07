const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.state = 'idle'; // idle, countdown, running, stopped
    this.startTime = 0;
    this.elapsed = 0;
    this.tictacTimer = null;
  }

  preload() {
    this.load.audio('tictac', 'tictac.mp3');
    this.load.audio('pop', 'pop.mp3');
    this.load.audio('whistle', 'whistle.mp3');
    this.load.audio('tick', 'tick.mp3');
    this.load.audio('clap', 'clap.mp3');
    // 加載背景圖片
    this.load.image('bg', 'bg.jpg');
  }

  create() {
    this.cameras.main.setBackgroundColor('#fff');
    this.centerX = this.scale.width / 2;
    this.centerY = this.scale.height / 2;

    // 添加背景圖片
    this.background = this.add.image(this.centerX, this.centerY, 'bg');
    this.background.setDisplaySize(this.scale.width, this.scale.height);

    // --- 美化開始畫面 ---
    // 移除橢圓形面板和標題，只保留開始按鈕

    // 綠色圓形「開始」按鈕
    this.startBtnBg = this.add.graphics();
    const btnRadius = 80;
    this.startBtnBg.fillStyle(0xb6e86b, 1);
    this.startBtnBg.fillCircle(this.centerX, this.scale.height - 150, btnRadius);
    this.startBtnBg.setInteractive(new Phaser.Geom.Circle(this.centerX, this.scale.height - 150, btnRadius), Phaser.Geom.Circle.Contains);
    this.startBtnBg.on('pointerdown', () => {
      if (this.state === 'idle') this.startCountdown();
      else this.resetToHome();
    });
    this.startBtnBg.setDepth(1);

    this.startBtn = this.add.text(this.centerX, this.scale.height - 150, '開始', {
      fontSize: '36px', color: '#fff', fontFamily: 'Noto Sans TC', fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(2);
    this.startBtn.setInteractive({ useHandCursor: true });
    this.startBtn.on('pointerdown', () => {
      console.log('=== 按鈕被點擊 ===');
      console.log('當前狀態:', this.state);
      console.log('按鈕文字:', this.startBtn.text);
      if (this.state === 'idle') {
        console.log('執行 startCountdown');
        this.startCountdown();
      } else {
        console.log('執行 resetToHome');
        this.resetToHome();
      }
    });
    this.startBtn.on('pointerover', () => this.startBtn.setColor('#222'));
    this.startBtn.on('pointerout', () => this.startBtn.setColor('#fff'));

    // 其他遊戲用文字（預設隱藏）
    this.infoText = this.add.text(this.centerX, this.centerY + 120, '', {
      fontSize: '80px', color: '#ff9900', fontFamily: 'Noto Sans TC'
    }).setOrigin(0.5).setVisible(false).setResolution(2);

    // 倒數文字（較小字體）
    this.countdownText = this.add.text(this.centerX, this.centerY + 120, '', {
      fontSize: '36px', color: '#ff9900', fontFamily: 'Noto Sans TC'
    }).setOrigin(0.5).setVisible(false).setResolution(2);

    this.resultText = this.add.text(this.centerX, this.centerY + 120, '', {
      fontSize: '80px', color: '#b6e86b', fontFamily: 'Noto Sans TC'
    }).setOrigin(0.5).setVisible(false);

    // 紅色圓形「停止」按鈕
    this.stopBtnBg = this.add.graphics();
    this.stopBtnBg.fillStyle(0xdc3545, 1);
    this.stopBtnBg.fillCircle(this.centerX, this.scale.height - 150, btnRadius);
    this.stopBtnBg.setInteractive(new Phaser.Geom.Circle(this.centerX, this.scale.height - 150, btnRadius), Phaser.Geom.Circle.Contains);
    this.stopBtnBg.on('pointerdown', () => this.stopGame());
    this.stopBtnBg.setDepth(1).setVisible(false);

    this.stopBtn = this.add.text(this.centerX, this.scale.height - 150, '停止', {
      fontSize: '36px', color: '#fff', fontFamily: 'Noto Sans TC', fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive().setVisible(false).setDepth(2);
    this.stopBtn.on('pointerdown', () => this.stopGame());

    // 彩帶群組
    this.confettiGroup = this.add.group();
    
    // 移除四角黃色 blob 動畫
    // this.blobs = [];
    // const margin = 180;
    // const blobConfigs = [
    //   { x: margin, y: margin, color: 0xffe600 }, // 左上
    //   { x: this.scale.width - margin, y: margin, color: 0xffe600 }, // 右上
    //   { x: margin, y: this.scale.height - margin, color: 0xffe600 }, // 左下
    //   { x: this.scale.width - margin, y: this.scale.height - margin, color: 0xffe600 } // 右下
    // ];
    // for (let cfg of blobConfigs) {
    //   let g = this.add.graphics();
    //   g.x = cfg.x;
    //   g.y = cfg.y;
    //   g.color = cfg.color;
    //   this.blobs.push(g);
    // }
    
    // 鍵盤監聽
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.state === 'running') {
        this.stopGame();
      }
    });
  }

  update() {
    // 移除四角 blob 動畫
    // if (this.blobs) {
    //   const time = this.time.now / 1000;
    //   for (let g of this.blobs) {
    //     g.clear();
    //     g.fillStyle(g.color, 0.18);
    //     g.beginPath();
    //     const points = 32;
    //     const baseR = 180;
    //     for (let i = 0; i <= points; i++) {
    //       const angle = (Math.PI * 2 / points) * i;
    //       const r = baseR + Math.sin(angle * 4 + time * 2 + g.x * 0.01 + g.y * 0.01) * 18;
    //       const x = Math.cos(angle) * r;
    //       const y = Math.sin(angle) * r;
    //       if (i === 0) g.moveTo(x, y);
    //       else g.lineTo(x, y);
    //     }
    //     g.closePath();
    //     g.fillPath();
    //   }
    // }
    
    // 計時中顯示實時時間
    if (this.state === 'running') {
      this.elapsed = (this.time.now - this.startTime) / 1000;
      // 以0.1秒為單位，1秒顯示為10
      const displayTime = Math.floor(this.elapsed * 10);
      this.infoText.setText(displayTime.toString());
    }
  }

  // 彩帶動畫生成
  launchConfetti() {
    const confettiColors = [0xffe600, 0x00e676, 0x00b0ff, 0xff4081, 0x7c4dff, 0xff80ab];
    
    // 持續生成彩帶5秒
    const confettiInterval = this.time.addEvent({
      delay: 200, // 每200ms生成一批
      repeat: 24, // 重複25次 = 5秒
      callback: () => {
        for (let i = 0; i < 5; i++) { // 每批5個彩帶
          const x = Phaser.Math.Between(100, this.scale.width - 100);
          const y = -Phaser.Math.Between(20, 200);
          const size = Phaser.Math.Between(12, 28);
          const color = Phaser.Utils.Array.GetRandom(confettiColors);
          const confetti = this.add.rectangle(x, y, size, size * 0.3, color).setAngle(Phaser.Math.Between(-30, 30));
          this.confettiGroup.add(confetti);
          this.tweens.add({
            targets: confetti,
            y: this.scale.height + 50,
            x: x + Phaser.Math.Between(-100, 100),
            angle: confetti.angle + Phaser.Math.Between(-180, 180),
            duration: Phaser.Math.Between(2000, 3000), // 彩帶下落時間2-3秒
            ease: 'Cubic.easeIn',
            onComplete: () => confetti.destroy()
          });
        }
      }
    });
    
    // 5秒後自動停止彩帶
    this.confettiTimer = this.time.delayedCall(5000, () => {
      confettiInterval.remove();
      this.stopConfetti();
    });
  }

  // 停止彩帶動畫
  stopConfetti() {
    if (this.confettiTimer) {
      this.confettiTimer.remove();
      this.confettiTimer = null;
    }
    this.confettiGroup.clear(true, true);
  }

  startCountdown() {
    if (this.state !== 'idle') return;
    this.state = 'countdown';
    // 隱藏開始畫面
    this.startBtn.setVisible(false);
    this.startBtnBg.setVisible(false);
    // 顯示倒數
    this.countdownText.setVisible(true);
    this.infoText.setVisible(false);
    this.resultText.setVisible(false);
    let count = 3;
    this.countdownText.setText(count);
    this.countdownText.setScale(1);
    this.sound.play('pop');
    this.tweens.add({
      targets: this.countdownText,
      scale: 2.5,
      duration: 300,
      yoyo: true,
      ease: 'Quad.easeOut',
      onUpdate: () => {
        // 確保縮放時保持清晰度
        this.countdownText.setScale(Math.round(this.countdownText.scale * 100) / 100);
      }
    });
    this.countdownEvent = this.time.addEvent({
      delay: 1000,
      repeat: 2,
      callback: () => {
        count--;
        if (count > 0) {
          this.countdownText.setText(count);
          this.countdownText.setScale(1);
          this.sound.play('pop');
          this.tweens.add({
            targets: this.countdownText,
            scale: 2.5,
            duration: 300,
            yoyo: true,
            ease: 'Quad.easeOut',
            onUpdate: () => {
              // 確保縮放時保持清晰度
              this.countdownText.setScale(Math.round(this.countdownText.scale * 100) / 100);
            }
          });
        } else {
          this.countdownText.setText('Start!');
          this.countdownText.setScale(1);
          this.sound.play('pop');
          this.sound.play('whistle'); // 播放哨子聲
          this.tweens.add({
            targets: this.countdownText,
            scale: 2.5,
            duration: 300,
            yoyo: true,
            ease: 'Quad.easeOut',
            onUpdate: () => {
              // 確保縮放時保持清晰度
              this.countdownText.setScale(Math.round(this.countdownText.scale * 100) / 100);
            }
          });
          this.time.delayedCall(600, () => this.startGame());
        }
      }
    });
  }

  startGame() {
    this.state = 'running';
    this.countdownText.setVisible(false);
    this.infoText.setText('0');
    this.infoText.setVisible(true);
    this.stopBtn.setVisible(true);
    this.stopBtnBg.setVisible(true);
    this.resultText.setVisible(false);
    this.startTime = this.time.now;
    this.elapsed = 0;
    this.tictacSound = this.sound.add('tictac');
    this.tickSound = this.sound.add('tick');
    this.playTicTac();
    this.playTick();
  }

  playTicTac() {
    if (this.state !== 'running') return;
    this.tictacSound.play();
    this.tictacTimer = this.time.delayedCall(1000, () => this.playTicTac());
  }

  playTick() {
    if (this.state !== 'running') return;
    this.tickSound.play();
    this.tickTimer = this.time.delayedCall(100, () => this.playTick());
  }

  stopGame() {
    if (this.state !== 'running') return;
    this.state = 'stopped';
    this.stopBtn.setVisible(false);
    this.stopBtnBg.setVisible(false);
    if (this.tictacTimer) this.tictacTimer.remove();
    if (this.tickTimer) this.tickTimer.remove();
    if (this.tictacSound) this.tictacSound.stop();
    if (this.tickSound) this.tickSound.stop();
    this.elapsed = (this.time.now - this.startTime) / 1000;
    // 以0.1秒為單位，1秒顯示為10
    const displayTime = Math.floor(this.elapsed * 10);
    this.infoText.setVisible(false);
    this.resultText.setText(displayTime.toString()).setVisible(true);
    this.startBtn.setText('返回首頁').setVisible(true);
    this.startBtnBg.setVisible(true);
    this.sound.play('clap'); // 播放拍手聲效
    this.launchConfetti();
    this.state = 'finished'; // 改為 'finished' 而不是 'idle'
  }

  // 修改 startBtn 事件，回首頁
  // 在 create() 內：
  // this.startBtn.on('pointerdown', () => this.startCountdown());
  // 改為：
  // this.startBtn.on('pointerdown', () => {
  //   if (this.state === 'idle') this.startCountdown();
  //   else this.resetToHome();
  // });

  // 新增回首頁方法
  resetToHome() {
    console.log('=== resetToHome 被調用 ===');
    console.log('調用前狀態:', this.state);
    this.startBtn.setText('開始').setVisible(true);
    this.startBtnBg.setVisible(true);
    this.infoText.setVisible(false);
    this.resultText.setVisible(false);
    this.stopConfetti(); // 停止彩帶動畫
    this.sound.stopAll(); // 停止所有音效包括拍手聲
    this.state = 'idle';
    console.log('調用後狀態:', this.state);
    console.log('=== resetToHome 完成 ===');
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1920, // 設計稿基準寬
  height: 1080, // 設計稿基準高
  backgroundColor: '#000',
  parent: 'game-container',
  scene: [MainScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  audio: { disableWebAudio: false }
};

new Phaser.Game(config);

// 等待遊戲初始化完成後再設置監控
setTimeout(() => {
    // 嘗試多種方式獲取遊戲實例
    let game = null;
    
    // 方法1: 從 window 物件獲取
    if (window.game) {
        game = window.game;
    }
    // 方法2: 從 canvas 元素獲取
    else if (document.querySelector('canvas')) {
        const canvas = document.querySelector('canvas');
        if (canvas.__phaser) {
            game = canvas.__phaser;
        }
    }
    // 方法3: 從 Phaser 全域變數獲取
    else if (window.Phaser && window.Phaser.Game) {
        // 嘗試獲取最後創建的遊戲實例
        const games = window.Phaser.Game.instances;
        if (games && games.length > 0) {
            game = games[games.length - 1];
        }
    }
    
    if (game && game.scene && game.scene.scenes[0]) {
        const scene = game.scene.scenes[0];
        console.log('成功獲取遊戲實例');
        console.log('場景狀態:', scene.state);
        
        // 監控遊戲狀態變化
        const originalResetToHome = scene.resetToHome;
        scene.resetToHome = function() {
            console.log('resetToHome 被調用了');
            console.log('當前狀態:', this.state);
            console.log('按鈕文字:', this.startBtn.text);
            return originalResetToHome.call(this);
        };

        // 監控按鈕點擊
        if (scene.startBtn && scene.startBtn.listeners) {
            const listeners = scene.startBtn.listeners('pointerdown');
            if (listeners.length > 0) {
                const originalStartBtnOnPointerDown = listeners[0];
                scene.startBtn.off('pointerdown');
                scene.startBtn.on('pointerdown', function() {
                    console.log('按鈕被點擊了');
                    console.log('當前狀態:', scene.state);
                    console.log('按鈕文字:', scene.startBtn.text);
                    originalStartBtnOnPointerDown.call(this);
                });
            }
        }
        
        console.log('Debug 監控已設置完成');
    } else {
        console.log('無法獲取遊戲實例，嘗試手動設置...');
        // 手動設置監控
        const scene = window.MainScene || document.querySelector('canvas')?.__phaser?.scene?.scenes[0];
        if (scene) {
            console.log('通過手動方式獲取場景');
            // 這裡可以設置監控
        } else {
            console.log('完全無法獲取遊戲實例');
        }
    }
}, 1000); 