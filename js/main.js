let mainContent = document.getElementById('content');
let gameField = document.getElementById('gameField');
let bgImage = document.getElementById('body-image');

mainContent.className = 'content hide-block';
gameField.className = 'gameField';
bgImage.className = 'body-image blur-bg';




(function() { "use strict";

  const TILE_SIZE = 4;
  canvas.height = 436;
  canvas.width = 872;

  
  //////////////////////////////////////////////
  //===========Анимация объектов==============//
  //////////////////////////////////////////////
  
  let Animation = function(frame_set, delay) {
    this.frame_set = frame_set; // Текущий набор изображений
    this.frame_index = 0; 
    this.frame_value = frame_set[0]; 
    this.delay = delay; 
    this.count = 0; // Подсчитывает количество игровых циклов с момента последнего изменения кадра
  };

  Animation.prototype = {
    // Cмена фрейма у сета из спрайта
    change:function(frame_set, delay) {
      if (this.frame_set != frame_set) {

        this.frame_set = frame_set;
        this.frame_index = 0;
        this.frame_value = this.frame_set[this.frame_index];
        this.count = 0;
        this.delay = delay || 10;
      }
    },

    // Вызывается каждый игрoвой цикл
    update:function() {
      this.count ++;
      if (this.count >= this.delay) {

        this.count = 0;
        /* Если индекс кадра соответствует последнему значению в наборе кадров, сбрасываем до 0.
        Если индекс кадра не соответствует последнему значению, добавляем к нему 1. 
        Обновляем содержимое кадра*/
        this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
        this.frame_value = this.frame_set[this.frame_index];
      }
    }
  };

  //===========Получение картинки из набора - то есть отслеживание ее физического положения в спрайте==============//
    
  let Frame = function(x, y, width, height) {
    this.height = height;
    this.width  = width;
    this.x      = x;
    this.y      = y;
  };


  ///////////////////////////////////////////////////////
  //===========Хранилище игровых объектов==============//
  ///////////////////////////////////////////////////////
  
  let Pool = function(object) {
    this.object = object; // Конструктор объектов
    this.objects = [];
    this.pool = [];
  };

  Pool.prototype = {

    // Если в хранилище неиспользуемых объектов есть нужный объект - берем его и используем снова
    get:function(parameters) {
      if (this.pool.length != 0) {
        let object = this.pool.pop();
        object.reset(parameters);
        this.objects.push(object);
      } 
      else {
        this.objects.push(new this.object(parameters.x, parameters.y));
      }
    },

    // Если запрашиваемый объект есть в массиве используемыех объектов - перемещаем его в хранилище 
    store:function(object) {
      let index = this.objects.indexOf(object);
      if (index != -1) {
        this.pool.push(this.objects.splice(index, 1)[0]);
      }
    },

    // Перемещение всех обхектов из массива используемых в хранилище
    storeAll:function() {
      for (let index = this.objects.length - 1; index > -1; -- index) {
        this.pool.push(this.objects.pop());
      }
    }
  };

////////////////////////////////////////////////////
//===========Классы игровых объектов==============//
////////////////////////////////////////////////////

//===========1==============//
  let DangerousGround = function(x, y) {
    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[1], 15);
    this.height = 190; 
    this.width = Math.floor(Math.random() * 200 + 50);
    this.x = x; 
    this.y = y;
  };

  DangerousGround.prototype = {
    constructor: DangerousGround,

    // Проверка столкновений навешивается на "вражеские" объекты
    // Проверяем находится ли игрок в пределах столкновения
    collideObject:function(player) {
      if (!player.jumping && player.x + player.width * 0.5 > this.x + this.width * 0.2 && player.x + player.width * 0.5 < this.x + this.width * 0.8) {
        player.alive = false;
        player.y = canvas.height - 162;
        player.animation.change(display.tile_sheet.frame_sets[5], 6);
      }
    },

    // Когда объект уходит за пределы поля, он перестает "существовать", this.alive = false - для отправки в хранилище
    collideWorld:function() {
      if (this.x + this.width < 0) this.alive = false;
    },

    // Обнуление параметров объекта
    reset:function(parameters) {
      this.alive = true;
      this.x = parameters.x;
      this.y = parameters.y;
    },

    update:function(){
      this.animation.update();
      this.x -= game.speed;
    }
  };

//===========2==============//
  let Cactus = function(x, y) {
    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[0], 15);
    this.height = 100; 
    this.width = 60;
    this.x = x; 
    this.y = y;
  };

  Cactus.prototype = {
    constructor: Cactus,

    collideObject:function(player) {
      if (!player.jumping && player.x + player.width * 0.5 > this.x - this.width * 0.1 && player.x + player.width * 0.5 < this.x + this.width * 0.8) {
        player.alive = false;
        player.y = canvas.height - 162;
        player.animation.change(display.tile_sheet.frame_sets[5], 6);
      }
    },

    // Когда объект уходит за пределы поля, он перестает "существовать", this.alive = false - для отправки в хранилище
    collideWorld:function() {
      if (this.x + this.width < 0) this.alive = false;
    },

    // Обнуление параметров объекта
    reset:function(parameters) {
      this.alive = true;
      this.x = parameters.x;
      this.y = parameters.y;
    },

    update:function(){
      this.animation.update();
      this.x -= game.speed;
    }
  };

//===========3==============//
 let GoodGround = function(x, y) {
    this.alive = true;
    this.animation = new Animation(display.tile_sheet.frame_sets[2], 40);
    this.height = 90; 
    this.width = Math.floor(Math.random() * 200 + 150);
    this.x = x; 
    this.y = y;
    this.coins = true;
    this.coins_amount = Math.floor(4 + Math.random() * 5);
  };
 
  GoodGround.prototype = {
    constructor: GoodGround,

    collideObject:function(player) {
      if (this.y < canvas.height - 100 && player.x + player.width * 0.5 > this.x - this.width * 0.1 && player.x + player.width * 0.5 < this.x + this.width * 0.8 && player.jumping) {
        if (player.x + player.width < this.x + this.width + 15) {
          player.animation.change(display.tile_sheet.frame_sets[3], 6);
          player.y = this.y - player.height + 40;
        }
      }
    },

    collideWorld:function() {
      if (this.x + this.width < 0) this.alive = false;
    },

    reset:function(parameters) {
      this.alive = true;
      this.x = parameters.x;
      this.y = parameters.y;
    },

    update:function(){
    // this.animation.update();
      this.x -= game.speed;
    }

  };

//===========4==============//
  let Coin = function(x, y) {
    this.alive = true;
    this.animation = new Animation(display.tile_sheet.extra_set[0], 1);
    this.width = 25;
    this.height = 25;
    this.x = x; 
    this.y = y;
    this.grabbed = false;
  };

  Coin.prototype = {
    constructor: Coin,

    collideObject:function(player) {
      let vector_x = player.x + player.width * 0.5 - this.x - this.width * 0.5;
      let vector_y = player.y + player.height * 0.5 - this.y - this.height * 0.5;
      let combined_radius = player.height * 0.5 + this.width * 0.5;

      if (vector_x * vector_x + vector_y * vector_y < combined_radius * combined_radius) {
        player.bonus += 1;
        this.y = 0;
        this.grabbed = true;
        this.animation.change(display.tile_sheet.extra_set[1], 10);
      }
    },

    collideWorld: function() {
      if (this.x + this.width < 0) {
        this.alive = false;
        this.grabbed = false;
      }
    },

    reset:function(parameters) {
      this.alive = true;
      this.animation.change(display.tile_sheet.extra_set[0], 1);
      this.x = parameters.x;
      this.y = parameters.y;
      this.grabbed = parameters.grabbed;
    },

    update:function() {
    //  this.animation.update();
      this.x -= game.speed;
    }
  };

//===========5==============//
  let ImageObject = function(path, speed, x, y, width, height) {
      this.img = new Image();
      this.x = x || 0;
      this.y = y || 0;
      this.width = width || canvas.width;
      this.height = height || canvas.height;
      this.img.src = path;
      this.speed = speed || .2;
    };

  ImageObject.prototype = {
    constructor: ImageObject,

    update: function() {
      this.x -= this.speed;
      if (this.x + this.width <= 0) {
        this.x = canvas.width - 10;
      }
    }
  };


/////////////////////////////////
//===========ИГРА==============//
/////////////////////////////////


  let controller, display, game;


  controller = {
    active:false, state:false,

    onOff:function(event) {
      event.preventDefault();
      let key_state = event.type == "mousedown" ? true : false;
      if (controller.state != key_state) controller.active = key_state;
      controller.state = key_state;
    }
  };

  //логика отображения (отрисовеки фреймов)
  display = {

    buffer:document.createElement("canvas").getContext("2d"),
    context:document.querySelector("canvas").getContext("2d"),   

    tile_sheet: {

      frames: [new Frame( 5, 835, 130, 190), new Frame(1620, 625, 130, 190),// cactus
               new Frame(130, 843, 376, 150), new Frame(130, 843, 376, 150),// dangerous ground
               new Frame(375, 1050,  470,  170), new Frame(905, 820, 470,  170) // good ground
              ],

      coin_frames: [new Frame(10, 10,  141,  141), new Frame(171, 10, 141,  141), 
      new Frame(10, 171,  141,  141), new Frame(171, 171, 141,  141), 
      new Frame(332, 10,  141,  141), new Frame(332, 171, 141,  141), 
      new Frame(10, 332,  141,  141), new Frame(171, 332, 141,  141),
      new Frame(332, 332,  141,  141), new Frame(493, 10, 141,  141),
      new Frame(493, 171, 141, 141)],

      frame_sets:[[0,1], // cactus
                  [2,3], // dangerous ground
                  [4,5], // good ground
                  [6,7,8,9,10,11,12,13],// run
                  [14,15,16,17,18,19,20,21,22,23], // jump
                  [24,25,26,27,28,29,30,31,32,33], // die
                  [34,35,36,37,38,39,40,41,42,43]  // coin
      ],

      extra_set: [[0,1,2,3,4,5,6,7,8,9], //монеты... в моем случае все равно нормально не анимируются
                  [10]],// пустой квадрат

      image: new Image(),// Картинки загружаются в блоке инициализации
      coinFrames: new Image(),
    },

    bg: {
      sky: new Image(),
    },

    //отрисовка всего изображения в каждой итерации по слоям: сначала в буфере, потом все отрисовывается в контекст
    render:function() {

      this.buffer.drawImage(this.bg.sky, 0, 0, canvas.width, canvas.height);
      this.buffer.drawImage(horizont1.img, horizont1.x, horizont1.y, horizont1.width, horizont1.height);
      this.buffer.drawImage(horizont2.img, horizont2.x, horizont2.y, horizont2.width, horizont2.height);

      this.buffer.drawImage(sand1.img, sand1.x, sand1.y, sand1.width, sand1.height);
      this.buffer.drawImage(sand2.img, sand2.x, sand2.y, sand2.width, sand2.height);

      this.buffer.drawImage(cactuses1.img, cactuses1.x, cactuses1.y, cactuses1.width, cactuses1.height);
      this.buffer.drawImage(cactuses2.img, cactuses2.x, cactuses2.y, cactuses2.width, cactuses2.height);

      // Draw DangerousGround
      for (let index = game.object_manager.dangerousGround_pool.objects.length - 1; index > -1; -- index) {
        let dangerousGround = game.object_manager.dangerousGround_pool.objects[index];
        let frame = this.tile_sheet.frames[dangerousGround.animation.frame_value];

        this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, dangerousGround.x, dangerousGround.y, dangerousGround.width, dangerousGround.height);
      }

      this.buffer.drawImage(ground1.img, ground1.x, ground1.y, ground1.width, ground1.height);
      this.buffer.drawImage(ground2.img, ground2.x, ground2.y, ground2.width, ground2.height);

      // Draw goodGround
      for (let index = game.object_manager.goodGround_pool.objects.length - 1; index > -1; -- index) {
        let goodGround = game.object_manager.goodGround_pool.objects[index];
        let frame = this.tile_sheet.frames[goodGround.animation.frame_value];

        this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, goodGround.x, goodGround.y, goodGround.width, goodGround.height);
      }

      // Draw distance
      this.buffer.font = "18px Arial";
      this.buffer.fillStyle = "#ffffff";
      this.buffer.fillText(String(Math.floor(game.distance/40) + " / " + Math.floor(game.max_distance/40)), 10, 20);

      // Draw bonus
      this.buffer.font = "16px Arial";
      this.buffer.fillStyle = "#ffffff";
      this.buffer.fillText(String("Coins: " + Math.floor(game.player.bonus / 72) + " / " + Math.floor(game.max_bonus/72)), 100, 20);

      // Draw Player
      let frame = this.tile_sheet.frames[game.player.animation.frame_value];
      this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y, frame.width, frame.height, game.player.x, game.player.y, game.player.width, game.player.height);
     
      // Draw Cactus
      for (let index = game.object_manager.cactus_pool.objects.length - 1; index > -1; -- index) {
        let cactus = game.object_manager.cactus_pool.objects[index];
        let frame = this.tile_sheet.frames[cactus.animation.frame_value];
        this.buffer.drawImage(this.tile_sheet.image, frame.x, frame.y-22, frame.width, frame.height, cactus.x, cactus.y+2, cactus.width, cactus.height);
      }

      // Draw Coins
      for (let index = game.object_manager.coins_pool.objects.length - 1; index > -1; -- index) {
        let coin = game.object_manager.coins_pool.objects[index];
        let frame = this.tile_sheet.coin_frames[coin.animation.frame_value];
        this.buffer.drawImage(this.tile_sheet.coinFrames, frame.x, frame.y, frame.width, frame.height, coin.x, coin.y, coin.width, coin.height);
      }

      this.context.drawImage(this.buffer.canvas, 0, 0, canvas.width, canvas.height, 0, 0, this.context.canvas.width, this.context.canvas.height);
    }
  };

 //добавление фреймов из спрайта в массив frames (чтобы не высчитывать координаты вручную)
  (function getFrames() {
    let run = function() {
      let fullWidth = 1760;
      let fullHeight = 170;
      let startX = 9;
      let startY = 445;
      for (let i = 0; i < 8; i++) {
        display.tile_sheet.frames.push(new Frame(startX, startY, fullWidth/8, fullHeight));
        startX += fullWidth/8;
      }
    };
    run();

    let jump = function() {
      let fullWidth = 2200;
      let fullHeight = 189;
      let startX = 10;
      let startY = 10;
      for (let i = 0; i < 10; i++) {
        display.tile_sheet.frames.push(new Frame(startX, startY, fullWidth/10, fullHeight));
        startX += fullWidth/10;
      }
    };
    jump();

    let death = function() {
      let fullWidth = 1890;
      let fullHeight = 189;
      let startX = 10;
      let startY = 219;
      for (let i = 0; i < 10; i++) {
        display.tile_sheet.frames.push(new Frame(startX, startY, fullWidth/10, fullHeight));
        startX += fullWidth/10;
      }
    }
    death();
  })();


  //логика вычисляющая нахождение каждого объекта в каждой итерации и логика взаимодействия объектов
  game = {
    distance:0,
    max_distance:0,
    max_bonus: 0,
    speed: 5,
    max_speed: 10,

    area: {
      offset:0,

      scroll:function() {
        game.distance += game.speed * .8;
        if (game.distance > game.max_distance) game.max_distance = game.distance;

        if (game.player.bonus > game.max_bonus) game.max_bonus = game.player.bonus;
      }
    },

    engine: {

      loop:function() {
        game.engine.update();
        display.render();
        ID = window.requestAnimationFrame(game.engine.loop);
      },

      update:function() {

        if (game.player.alive) {
          horizont1.update();
          horizont2.update();
          cactuses1.update();
          cactuses2.update();
          sand1.update();
          sand2.update();
          ground1.update();
          ground2.update();
        }
        
        game.speed = (game.speed >= game.max_speed) ? game.max_speed : game.speed + 0.0025;/* Постепеное наращивание скорости игры */
        game.player.animation.delay = Math.floor(15 - game.speed);/* задержка кадров анимации игрока уменьшается с увеличением скорости игры, чтобы казалось, что игрок бежит быстрее */
        game.area.scroll();// Отражение результатов и бонусов по монетам

        if (game.player.alive) {

          if (controller.active && !game.player.jumping) {// Get user input
            controller.active = false;
            game.player.jumping = true;
            game.player.y_velocity -= 35;
            game.player.animation.change(display.tile_sheet.frame_sets[4], 15);
          }

          if (game.player.jumping == false) {
            game.player.animation.change(display.tile_sheet.frame_sets[3], Math.floor(15 - game.speed));
          }

          game.player.update();

          if (game.player.y > game.player.stateY) {
            controller.active = false;
            game.player.y = game.player.stateY;
            game.player.y_velocity = 0;
            game.player.jumping = false;
          }
        } 

        //при смерти игрока по промотке анимации (сета с соответствующими с фреймами) до конца игра перезапускается
        else {
          game.player.x -= game.speed;
          game.speed *= 0.9;
          if (game.player.animation.frame_index == game.player.animation.frame_set.length - 1) game.reset();
        }

        game.player.animation.update();

        game.object_manager.spawn();
        game.object_manager.update();
      }
    },


    object_manager: {

      count:0,
      delay:Math.floor(60 + Math.random() * 100),

      cactus_pool: new Pool(Cactus),
      goodGround_pool: new Pool(GoodGround),
      dangerousGround_pool: new Pool(DangerousGround),
      coins_pool: new Pool(Coin),

      spawn:function() {
        this.count ++;

        if (this.count == this.delay) {
          this.count = 0;
          game.speed <= 8 ? this.delay = Math.floor(60 + Math.random() * 80) : this.delay = Math.floor(50 + Math.random() * 50);


          /* Рандомное появление игровых обектов */
          let randomize = Math.floor(1 + Math.random() * 3); 

          if (randomize == 1) {
            this.dangerousGround_pool.get( {x: canvas.width, y: canvas.height - 120} );
          } 

          if (randomize == 2) {
            this.cactus_pool.get( {x: canvas.width, y: canvas.height - 150});
          }

          if (randomize == 3) {
            let options = [canvas.height - 80, canvas.height - 250];
            let y = options[Math.floor(Math.random() * 2)];
            this.goodGround_pool.get({x: canvas.width, y: y});
          }
        }
      },

      update:function() {

        //CACTUS
        for (let index = this.cactus_pool.objects.length - 1; index > -1; -- index) {
          let cactus = this.cactus_pool.objects[index];
          cactus.update();
          cactus.collideObject(game.player);
          cactus.collideWorld();

          if (!cactus.alive) {
            this.cactus_pool.store(cactus);
          };
        }

        //GOOD GROUND
        for (let index = this.goodGround_pool.objects.length - 1; index > -1; -- index) {
          let goodGround = this.goodGround_pool.objects[index];
          goodGround.update();
          goodGround.collideObject(game.player);
          goodGround.collideWorld();

          if (goodGround.coins) {
          let parameters = {x: undefined, y: undefined, grabbed: undefined};
          
          let gup = 0;
          let amount = goodGround.coins_amount; 

          for (let i = 0; i <= goodGround.coins_amount; i++) {
            parameters.y = goodGround.y - 10;
            parameters.x = goodGround.x + gup;

            for (let index = this.coins_pool.objects.length - 1; index > -1; -- index) {
              let coin = this.coins_pool.objects[index];
              if (coin.grabbed) parameters.grabbed = true;
            }

            this.coins_pool.get(parameters);

            gup += (goodGround.width + 20) / amount;
          }
        }
          if (!goodGround.alive) this.goodGround_pool.store(goodGround);
        }

        //COINS
        for (let index = this.coins_pool.objects.length - 1; index > -1; -- index) {
          let coin = this.coins_pool.objects[index];
          if (coin.grabbed) {
            coin.animation.change(display.tile_sheet.extra_set[1], 2);
          }
   
          coin.update();
          coin.collideObject(game.player);
          coin.collideWorld();

          if (!coin.alive) {
            this.coins_pool.store(coin);
          }
        }

        //DANGEROUS GROUND
        for (let index = this.dangerousGround_pool.objects.length - 1; index > -1; -- index) {
          let dangerousGround = this.dangerousGround_pool.objects[index];
          dangerousGround.update();
          dangerousGround.collideObject(game.player);
          dangerousGround.collideWorld();

          if (!dangerousGround.alive) this.dangerousGround_pool.store(dangerousGround);
        }
      }
    },

    player: {

      stateY: canvas.height - 165,
      alive: true,
      animation:new Animation([6], 12),
      jumping: false,
      height: 129, 
      width: 140,
      x: 20, 
      y: canvas.height - 165,
      y_velocity: 0,
      bonus: 0,

      reset:function() {
        this.alive = true;
        this.x = 20;
      },

      update:function() {
        game.player.y_velocity += .8;
        game.player.y += game.player.y_velocity;
        game.player.y_velocity *= 0.9;
      }
    },

    reset:function() {

      this.distance = 0;
      this.player.bonus = 0;
      this.player.reset();

      //убираем все объекты с карты
      this.object_manager.cactus_pool.storeAll();
      this.object_manager.goodGround_pool.storeAll();
      this.object_manager.dangerousGround_pool.storeAll();
      this.object_manager.coins_pool.storeAll();

      this.speed = 5;

    }

  };


  // BACKGROUND

  let horizont1 = new ImageObject('assets/images/2.png', .1*game.speed);
  let horizont2 = new ImageObject('assets/images/2.png', .1*game.speed, canvas.width, 0);

  let cactuses1 = new ImageObject('assets/images/4.png', .2*game.speed);
  let cactuses2 = new ImageObject('assets/images/4.png', .2*game.speed, canvas.width, 0);

  let sand1 = new ImageObject('assets/images/3.png', .2*game.speed);
  let sand2 = new ImageObject('assets/images/3.png', .2*game.speed, canvas.width, 0);

  let ground1 = new ImageObject('assets/images/5.png', game.speed);
  let ground2 = new ImageObject('assets/images/5.png', game.speed, canvas.width, 0);


  // INITIALIZE 
 
  display.buffer.canvas.height = canvas.height;
  display.buffer.canvas.width  = canvas.width;

  display.bg.sky.src = "assets/images/1.png";
  display.tile_sheet.coinFrames.src = 'assets/images/coins.png';
  display.tile_sheet.image.src = "assets/images/css_sprites(8).png";

  let ID; // requestAnimationFrame

  let playButton = document.querySelector('.gameField .menu__icons .menu__icons-play');
  let pauseButton = document.querySelector('.gameField .menu__icons .menu__icons-stop');
  let menuButton = document.querySelector('.gameField .menu__icons .menu__icons-main-menu');

  playButton.addEventListener('click', function() {
    if (!ID) {
      start();
    }
  }, true);

  pauseButton.addEventListener('click', function() {
    if (ID) {
      stop(ID);
      ID = null;
    }
  }, true);

  menuButton.addEventListener('click', function() {
    let overlay = document.createElement('div');
      overlay.className = 'overlay';
      document.body.appendChild(overlay);
      overlay.classList.add('overlay-animation');
      
      setTimeout(function() {
        js.include('js/startmenu.js');
      }, 1000);
      
      setTimeout(function() {
        overlay.remove();
      }, 3200);
  }, true);

    
  window.start = function() {
    game.engine.loop();
  };

  window.stop = function(ID) {
    window.cancelAnimationFrame(ID);
  };

  window.addEventListener("mousedown", controller.onOff);
  window.addEventListener("mouseup", controller.onOff);

  start();
})();
