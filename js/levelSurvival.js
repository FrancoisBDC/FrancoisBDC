//I am not the developper of this game, you can find the original project here "https://landgreen.github.io/sidescroller/" or his GitHub page here: "https://github.com/landgreen/n-gon"

let body = []; //non static bodies
let map = []; //all static bodies
let cons = []; //all constraints between a point and a body
let consBB = []; //all constraints between two bodies
let composite = [] //rotors and other map elements that don't fit 
  const level = {

    defaultZoom: 1400,
    onLevel: 0,
    levelsCleared: 0,
    isPauseTime: false,
    levels: ["survival"],
    start() {
      game.enableConstructMode()

      if (level.levelsCleared === 0) { //this code only runs on the first level
        level.survival();
      } else {
        spawn.setSpawnList(); //picks a couple mobs types for a themed random mob spawns
        level[level.levels[level.onLevel]](); //picks the current map from the the levels array
      if (!game.isCheating) {
        localSettings.runCount += level.levelsCleared //track the number of total runs locally
        localSettings.levelsClearedLastGame = level.levelsCleared
        localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
      }
      }
      level.levelAnnounce();
      game.noCameraScroll();
      game.setZoom();
      level.addToWorld(); //add bodies to game engine
      game.draw.setPaths();
      b.respawnBots();
      if (mod.isArmorFromPowerUps) {
        mech.maxHealth += 0.05 * powerUps.totalPowerUps
        if (powerUps.totalPowerUps) game.makeTextLog("<span style='font-size:115%;'> max health increased by " + (0.05 * powerUps.totalPowerUps * 100).toFixed(0) + "%</span>", 300)
      }
      if (mod.isHealLowHealth) {
        const len = Math.floor((mech.maxHealth - mech.health) / 0.5)
        for (let i = 0; i < len; i++) {
          powerUps.spawn(mech.pos.x, mech.pos.y, "heal", false);
        }
      }
      if (mod.isGunCycle) {
        b.inventoryGun++;
        if (b.inventoryGun > b.inventory.length - 1) b.inventoryGun = 0;
        game.switchGun();
      }
    },
    custom() {},
    customTopLayer() {},

survival() {  //aerie
    let numberOfMobsLeft = mob.length
    level.custom = () => {
      if (numberOfMobsLeft > mob.length){
        game.replaceMobLog = true;
        game.makeNumberMobsLeft(`<span style='font-size:115%;'>mobs left: ${mob.length}</span>`, 180);
      }
      numberOfMobsLeft = mob.length
      if (mob.length == 0 && level.isPauseTime != true) {
        level.nextLevel();
      }

      

    };
    level.customTopLayer = () => {
      // elevator.move()
    };

    // game.difficulty = 4; //for testing to simulate possible mobs spawns
    level.defaultZoom = 2100
    game.zoomTransition(level.defaultZoom)

      level.setPosToSpawn(-50, -1050); //normal spawn
      level.exit.x = 3950;
      level.exit.y = -3275;
    

    spawn.mapRect(level.enter.x, level.enter.y + 20, 100, 20);
    spawn.mapRect(level.exit.x, level.exit.y + 15, 100, 20);

    powerUps.spawnStartingPowerUps(1075, -550);
    document.body.style.backgroundColor = "#dcdcde";

    //foreground
    level.fill.push({
      x: -100,
      y: -1000,
      width: 1450,
      height: 1400,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 2000,
      y: -1110,
      width: 450,
      height: 1550,
      color: "rgba(0,0,0,0.1)"
    });
    level.fill.push({
      x: 3700,
      y: -3150,
      width: 1100,
      height: 950,
      color: "rgba(0,0,0,0.1)"
    });

    //background
    level.fillBG.push({
      x: 4200,
      y: -2200,
      width: 100,
      height: 2600,
      color: "#c7c7ca"
    });

      level.fill.push({
        x: 3750,
        y: -3650,
        width: 550,
        height: 400,
        color: "rgba(0,0,0,0.1)"
      });
      level.fillBG.push({
        x: -275,
        y: -1275,
        width: 425,
        height: 300,
        color: "#d4f4f4"
      });
    

    // starting room
    spawn.mapRect(-300, -1000, 600, 50);
    spawn.mapRect(-300, -1300, 450, 50);
    spawn.mapRect(-300, -1300, 50, 350);
    spawn.bodyRect(100, -1250, 200, 240); //remove on backwards
    //left building
    spawn.mapRect(-100, -975, 100, 975);
    spawn.mapRect(-500, 100, 1950, 400);
    spawn.boost(-425, 100, 1400);
    spawn.mapRect(600, -1000, 750, 50);
    spawn.mapRect(900, -500, 550, 50);
    spawn.mapRect(1250, -975, 100, 375);
    spawn.bodyRect(1250, -600, 100, 100, 0.7);
    spawn.mapRect(1250, -450, 100, 450);
    spawn.bodyRect(1250, -1225, 100, 200); //remove on backwards
    spawn.bodyRect(1200, -1025, 350, 25); //remove on backwards
    //middle super tower
    spawn.bodyRect(1750, -800, 700, 35);
    spawn.mapVertex(2225, -2100, "0 0 450 0 300 -2500 150 -2500")
    spawn.mapRect(2000, -700, 450, 300);
    spawn.bodyRect(2360, -450, 100, 300, 0.6);
    spawn.mapRect(2000, -75, 450, 275);
    spawn.bodyRect(2450, 150, 150, 150, 0.4);
    spawn.mapRect(1550, 300, 4600, 200); //ground
    spawn.boost(5350, 275, 2850);
    // spawn.mapRect(6050, -700, 450, 1200);
    spawn.mapRect(6050, -1060, 450, 1560);
    spawn.mapVertex(6275, -2100, "0 0 450 0 300 -2500 150 -2500")

    //right tall tower
    spawn.mapRect(3700, -3200, 100, 800);
    spawn.mapRect(4700, -2910, 100, 510);
    spawn.mapRect(3700, -2600, 300, 50);
    spawn.mapRect(4100, -2900, 900, 50);
    spawn.mapRect(3450, -2300, 750, 100);
    spawn.mapRect(4300, -2300, 750, 100);
    spawn.mapRect(4150, -1600, 200, 25);
    spawn.mapRect(4150, -700, 200, 25);
    //exit room on top of tower
    spawn.mapRect(3700, -3700, 600, 50);
    spawn.mapRect(3700, -3700, 50, 500);
    spawn.mapRect(4250, -3700, 50, 300);
    spawn.mapRect(3700, -3250, 1100, 100);

    
    level.spawnSurvivalMobs();
    powerUps.addRerollToLevel() //needs to run after mobs are spawned
  },

  // survival() {
  //   level.custom = () => {
  //   };
  //   level.customTopLayer = () => {};

  //   level.defaultZoom = 1800
  //   game.zoomTransition(level.defaultZoom)
  //   document.body.style.backgroundColor = "#dcdcde";

  //   level.setPosToSpawn(0, -30); //normal spawn
  //   spawn.mapRect(level.enter.x, -10, 100, 20);

  //   level.exit.x = -50;
  //   level.exit.y = 0;

  //   spawn.mapRect(-650, 0, 1300, 75);
  //   spawn.mapRect(-550, 0, 75, 600);
  //   spawn.mapRect(475, 0, 75, 600);
  //   spawn.mapRect(-550, -600, 50, 375);
  //   spawn.mapRect(-650, -600, 425, 50);
  //   spawn.mapRect(200, -600, 625, 50);
  //   spawn.mapRect(500, -600, 50, 375);
  //   spawn.mapRect(-225, -350, 425, 50);
  //   spawn.mapRect(475, 525, 1350, 75);
  //   spawn.mapRect(1750, -25, 75, 625);
  //   spawn.mapRect(1575, 325, 250, 275);
  //   spawn.mapRect(1750, 450, 850, 150);
  //   spawn.mapRect(2525, -50, 75, 650);

  //   spawn.mapVertex(525, -1210, "0 0 320 0 255 -500 60 -500")
  //   spawn.mapVertex(525, -2000, "0 0  154 0  125 -460  35 -460")
  //   spawn.mapRect(175, -1850, 700, 50);
  //   // spawn.mapVertex(0, -200, "-50 0  -40 -43.58  -30 -60  -20 -71.42  -10 -80  0 -86.6  10 -91.65  20 -95.40  30 -97.98  40 -99.50  50 -100  50 -80  40 -79.40  30 -77.46  20 -74.16  10 -69.28  0 -62.45  -10 -52.915  -20 -38.73  -30 0")
  //   // spawn.boost(2020, 480, 2000);
  // },


    difficultyIncrease(num = 1) {
      for (let i = 0; i < num; i++) {
        game.difficulty++
        game.dmgScale += 0.37; //damage done by mobs increases each level
        b.dmgScale *= 0.92; //damage done by player decreases each level
        if (game.accelScale < 5) game.accelScale *= 1.027 //mob acceleration increases each level
        if (game.lookFreqScale > 0.2) game.lookFreqScale *= 0.975 //mob cycles between looks decreases each level
        if (game.CDScale > 0.2) game.CDScale *= 0.966 //mob CD time decreases each level
      }
      game.healScale = 1 / (1 + game.difficulty * 0.07) //a higher denominator makes for lower heals // mech.health += heal * game.healScale;
    },
    difficultyDecrease(num = 1) { //used in easy mode for game.reset()
      for (let i = 0; i < num; i++) {
        game.difficulty--
        game.dmgScale -= 0.37; //damage done by mobs increases each level
        if (game.dmgScale < 0.1) game.dmgScale = 0.1;
        b.dmgScale /= 0.92; //damage done by player decreases each level
        if (game.accelScale > 0.2) game.accelScale /= 1.027 //mob acceleration increases each level
        if (game.lookFreqScale < 5) game.lookFreqScale /= 0.975 //mob cycles between looks decreases each level
        if (game.CDScale < 5) game.CDScale /= 0.966 //mob CD time decreases each level
      }
      if (game.difficulty < 1) game.difficulty = 0;
      game.healScale = 1 / (1 + game.difficulty * 0.07)
    },
    difficultyText(mode = document.getElementById("difficulty-select").value) {
      if (mode === "0") {
        return "easy"
      } else if (mode === "1") {
        return "normal"
      } else if (mode === "2") {
        return "hard"
      } else if (mode === "4") {
        return "why"
      }
    },
    drawOnTheMapBodyRect(x, y, dx, dy) {
      spawn.bodyRect(x, y, dx, dy);
      len = body.length - 1
      body[len].collisionFilter.category = cat.body;
      body[len].collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet
      World.add(engine.world, body[len]); //add to world
      body[len].classType = "body"
    },
    spawnSurvivalMobs() {
      spawn.randomBoss(350, -500, 1)
      spawn.randomSmallMob(-225, 25, 1);
      spawn.randomSmallMob(1000, -1100);
      spawn.randomSmallMob(4000, -250);
      spawn.randomSmallMob(4450, -3000);
      spawn.randomSmallMob(5600, 100);
      spawn.randomMob(4275, -2600, 0.8);
      spawn.randomMob(1050, -700, 0.8)
      spawn.randomMob(6050, -850, 0.7);
      spawn.randomMob(2150, -300, 0.6)
      spawn.randomMob(3900, -2700, 0.8);
      spawn.randomMob(3600, -500, 0.8);
      spawn.randomMob(3400, -200, 0.8);
      spawn.randomMob(1650, -1300, 0.7)
      spawn.randomMob(-4100, -50, 0.7);
      spawn.randomMob(4100, -50, 0.5);
      spawn.randomMob(1700, -50, 0.3)
      spawn.randomMob(2350, -900, 0.3)
      spawn.randomMob(4700, -150, 0.2);
      spawn.randomBoss(4000, -350, 0.6);
      spawn.randomBoss(2750, -550, 0.1);
      if (game.difficulty > 3) {
        if (Math.random() < 0.1) { // tether ball
          spawn.tetherBoss(4250, 0)
          cons[cons.length] = Constraint.create({
            pointA: {
              x: 4250,
              y: -675
            },
            bodyB: mob[mob.length - 1],
            stiffness: 0.00007
          });
          if (game.difficulty > 4) spawn.nodeBoss(4250, 0, "spawns", 8, 20, 105); //chance to spawn a ring of exploding mobs around this boss
        } else if (Math.random() < 0.15) {
          spawn.randomLevelBoss(4250, -250);
          spawn.debris(-250, 50, 1650, 2); //16 debris per level
          spawn.debris(2475, 0, 750, 2); //16 debris per level
          spawn.debris(3450, 0, 2000, 16); //16 debris per level
          spawn.debris(3500, -2350, 1500, 2); //16 debris per level
        } else {
          powerUps.chooseRandomPowerUp(4000, 200);
          powerUps.chooseRandomPowerUp(4000, 200);
          //floor below right tall tower
          level.drawOnTheMapBodyRect(3000, 50, 150, 250);
          level.drawOnTheMapBodyRect(4500, -500, 300, 250);
          level.drawOnTheMapBodyRect(3500, -100, 100, 150);
          level.drawOnTheMapBodyRect(4200, -500, 110, 30);
          level.drawOnTheMapBodyRect(3800, -500, 150, 130);
          level.drawOnTheMapBodyRect(4000, 50, 200, 150);
          level.drawOnTheMapBodyRect(4500, 50, 300, 200);
          level.drawOnTheMapBodyRect(4200, -350, 200, 50);
          level.drawOnTheMapBodyRect(4700, -350, 50, 200);
          level.drawOnTheMapBodyRect(4900, -100, 300, 300);

          spawn.suckerBoss(4500, -400);
        }
      }
    },
    timeNextWave() {
      let i = 11
      function showTimeLeft() {
        if (i>0  && !game.isChoosing){
          game.replaceMobLog = true;
          game.makeNumberMobsLeft(`<span style='font-size:115%;'>Time before next wave: ${i-1}</span>`, 60);
          i--;
        } else if (i>=0 && !game.isChoosing){
          level.spawnSurvivalMobs();
          level.isPauseTime = false;
          i--
        }
      }
      if (i>-1){
        setInterval(showTimeLeft, 1000)
      }
    },
    levelAnnounce() {
      if (level.levelsCleared >= 0) {
        document.title = "n-gon: L" + (level.levelsCleared) + " " + level.levels[level.onLevel] + " (" + level.difficultyText() + ")";
      }
    },
    custom() {}, //each level runs it's own custom code (level exits, ...)
    nextLevel() {
      level.levelsCleared++;
      level.onLevel++; //cycles map to next level
      if (level.onLevel > level.levels.length - 1) level.onLevel = 0;
      level.difficultyIncrease(game.difficultyMode) //increase difficulty based on modes
      if (level.levelsCleared > level.levels.length) level.difficultyIncrease(game.difficultyMode)
      if (level.levelsCleared > level.levels.length * 1.5) level.difficultyIncrease(game.difficultyMode)
      if (level.levelsCleared > level.levels.length * 2) level.difficultyIncrease(game.difficultyMode)
      if (game.isEasyMode && level.levelsCleared % 2) level.difficultyDecrease(1);
      //reset lost mod display
      for (let i = 0; i < mod.mods.length; i++) {
        if (mod.mods[i].isLost) mod.mods[i].isLost = false;
      }
      game.updateModHUD();
      level.isPauseTime = true;
      level.timeNextWave();
    },
    setPosToSpawn(xPos, yPos) {
      mech.spawnPos.x = mech.pos.x = xPos;
      mech.spawnPos.y = mech.pos.y = yPos;
      level.enter.x = mech.spawnPos.x - 50;
      level.enter.y = mech.spawnPos.y + 20;
      mech.transX = mech.transSmoothX = canvas.width2 - mech.pos.x;
      mech.transY = mech.transSmoothY = canvas.height2 - mech.pos.y;
      mech.Vx = mech.spawnVel.x;
      mech.Vy = mech.spawnVel.y;
      player.force.x = 0;
      player.force.y = 0;
      Matter.Body.setPosition(player, mech.spawnPos);
      Matter.Body.setVelocity(player, mech.spawnVel);
    },
    enter: {
      x: 0,
      y: 0,
      draw() {
        ctx.beginPath();
        ctx.moveTo(level.enter.x, level.enter.y + 30);
        ctx.lineTo(level.enter.x, level.enter.y - 80);
        ctx.bezierCurveTo(level.enter.x, level.enter.y - 170, level.enter.x + 100, level.enter.y - 170, level.enter.x + 100, level.enter.y - 80);
        ctx.lineTo(level.enter.x + 100, level.enter.y + 30);
        ctx.lineTo(level.enter.x, level.enter.y + 30);
        ctx.fillStyle = "#ccc";
        ctx.fill();
      }
    },
    exit: {
      x: 0,
      y: 0,
      draw() {
        ctx.beginPath();
        ctx.moveTo(level.exit.x, level.exit.y + 30);
        ctx.lineTo(level.exit.x, level.exit.y - 80);
        ctx.bezierCurveTo(level.exit.x, level.exit.y - 170, level.exit.x + 100, level.exit.y - 170, level.exit.x + 100, level.exit.y - 80);
        ctx.lineTo(level.exit.x + 100, level.exit.y + 30);
        ctx.lineTo(level.exit.x, level.exit.y + 30);
        ctx.fillStyle = "#0ff";
        ctx.fill();
      }
    },
    fillBG: [],
    drawFillBGs() {
      for (let i = 0, len = level.fillBG.length; i < len; ++i) {
        const f = level.fillBG[i];
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x, f.y, f.width, f.height);
      }
    },
    fill: [],
    drawFills() {
      for (let i = 0, len = level.fill.length; i < len; ++i) {
        const f = level.fill[i];
        ctx.fillStyle = f.color;
        ctx.fillRect(f.x, f.y, f.width, f.height);
      }
    },
    queryList: [], //queries do actions on many objects in regions
    checkQuery() {
      let bounds, action, info;

      function isInZone(targetArray) {
        let results = Matter.Query.region(targetArray, bounds);
        for (let i = 0, len = results.length; i < len; ++i) {
          level.queryActions[action](results[i], info);
        }
      }
      for (let i = 0, len = level.queryList.length; i < len; ++i) {
        bounds = level.queryList[i].bounds;
        action = level.queryList[i].action;
        info = level.queryList[i].info;
        for (let j = 0, l = level.queryList[i].groups.length; j < l; ++j) {
          isInZone(level.queryList[i].groups[j]);
        }
      }
    },
    //oddly query regions can't get smaller than 50 width?
    addQueryRegion(x, y, width, height, action, groups = [
      [player], body, mob, powerUp, bullet
    ], info) {
      level.queryList[level.queryList.length] = {
        bounds: {
          min: {
            x: x,
            y: y
          },
          max: {
            x: x + width,
            y: y + height
          }
        },
        action: action,
        groups: groups,
        info: info
      };
    },
    queryActions: {
      bounce(target, info) {
        //jerky fling upwards
        Matter.Body.setVelocity(target, {
          x: info.Vx + (Math.random() - 0.5) * 6,
          y: info.Vy
        });
        target.torque = (Math.random() - 0.5) * 2 * target.mass;
      },
      boost(target, yVelocity) {
        mech.buttonCD_jump = 0; // reset short jump counter to prevent short jumps on boosts
        mech.hardLandCD = 0 // disable hard landing
        if (target.velocity.y > 30) {
          Matter.Body.setVelocity(target, {
            x: target.velocity.x + (Math.random() - 0.5) * 2,
            y: -15 //gentle bounce if coming down super fast
          });
        } else {
          Matter.Body.setVelocity(target, {
            x: target.velocity.x + (Math.random() - 0.5) * 2,
            y: yVelocity
          });
        }

      },
      force(target, info) {
        if (target.velocity.y < 0) { //gently force up if already on the way up
          target.force.x += info.Vx * target.mass;
          target.force.y += info.Vy * target.mass;
        } else {
          target.force.y -= 0.0007 * target.mass; //gently fall in on the way down
        }
      },
      antiGrav(target) {
        target.force.y -= 0.0011 * target.mass;
      },
      death(target) {
        target.death();
      }
    },
    addToWorld() { //needs to be run to put bodies into the world
      for (let i = 0; i < body.length; i++) {
        //body[i].collisionFilter.group = 0;
        if (body[i] !== mech.holdingTarget) {
          body[i].collisionFilter.category = cat.body;
          body[i].collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.mob | cat.mobBullet
        }
        body[i].classType = "body";
        World.add(engine.world, body[i]); //add to world
      }
      for (let i = 0; i < map.length; i++) {
        //map[i].collisionFilter.group = 0;
        map[i].collisionFilter.category = cat.map;
        map[i].collisionFilter.mask = cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet;
        Matter.Body.setStatic(map[i], true); //make static
        World.add(engine.world, map[i]); //add to world
      }
      for (let i = 0; i < cons.length; i++) {
        World.add(engine.world, cons[i]);
      }
      // for (let i = 0; i < consBB.length; i++) {
      //   World.add(engine.world, consBB[i]);
      // }
    },
    spinner(x, y, width, height, density = 0.001) {
      x = x + width / 2
      y = y + height / 2
      const who = body[body.length] = Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
          category: cat.body,
          mask: cat.player | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet //cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
        },
        isNotHoldable: true,
        frictionAir: 0.001,
        friction: 1,
        frictionStatic: 1,
        restitution: 0,
      });

      Matter.Body.setDensity(who, density)
      const constraint = Constraint.create({ //fix rotor in place, but allow rotation
        pointA: {
          x: x,
          y: y
        },
        bodyB: who,
        stiffness: 1,
        damping: 1
      });
      World.add(engine.world, constraint);
      return constraint
    },
    platform(x, y, width, height, speed = 0, density = 0.001) {
      x = x + width / 2
      y = y + height / 2
      const who = body[body.length] = Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
          category: cat.body,
          mask: cat.player | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet //cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
        },
        inertia: Infinity, //prevents rotation
        isNotHoldable: true,
        friction: 1,
        frictionStatic: 1,
        restitution: 0,
      });

      Matter.Body.setDensity(who, density)
      const constraint = Constraint.create({ //fix rotor in place, but allow rotation
        pointA: {
          x: x,
          y: y
        },
        bodyB: who,
        stiffness: 0.1,
        damping: 0.3
      });
      World.add(engine.world, constraint);
      constraint.plat = {
        position: who.position,
        speed: speed,
      }
      constraint.pauseUntilCycle = 0 //to to pause platform at top and bottom
      return constraint
    },
    rotor(x, y, rotate = 0, radius = 800, width = 40, density = 0.0005) {
      const rotor1 = Matter.Bodies.rectangle(x, y, width, radius, {
        density: density,
        isNotHoldable: true
      });
      const rotor2 = Matter.Bodies.rectangle(x, y, width, radius, {
        angle: Math.PI / 2,
        density: density,
        isNotHoldable: true
      });
      rotor = Body.create({ //combine rotor1 and rotor2
        parts: [rotor1, rotor2],
        restitution: 0,
        collisionFilter: {
          category: cat.body,
          mask: cat.body | cat.mob | cat.mobBullet | cat.mobShield | cat.powerUp | cat.player | cat.bullet
        },
      });
      Matter.Body.setPosition(rotor, {
        x: x,
        y: y
      });
      World.add(engine.world, [rotor]);
      body[body.length] = rotor1
      body[body.length] = rotor2

      setTimeout(function () {
        rotor.collisionFilter.category = cat.body;
        rotor.collisionFilter.mask = cat.body | cat.player | cat.bullet | cat.mob | cat.mobBullet //| cat.map
      }, 1000);

      const constraint = Constraint.create({ //fix rotor in place, but allow rotation
        pointA: {
          x: x,
          y: y
        },
        bodyB: rotor
      });
      World.add(engine.world, constraint);

      if (rotate) {
        rotor.rotate = function () {
          if (!mech.isBodiesAsleep) {
            Matter.Body.applyForce(rotor, {
              x: rotor.position.x + 100,
              y: rotor.position.y + 100
            }, {
              x: rotate * rotor.mass,
              y: 0
            })
          } else {
            Matter.Body.setAngularVelocity(rotor, 0);
          }
        }
      }
      composite[composite.length] = rotor
      return rotor
    },
    button(x, y, width = 126) {
      spawn.mapVertex(x + 65, y + 2, "100 10 -100 10 -70 -10 70 -10");
      map[map.length - 1].restitution = 0;
      map[map.length - 1].friction = 1;
      map[map.length - 1].frictionStatic = 1;

      // const buttonSensor = Bodies.rectangle(x + 35, y - 1, 70, 20, {
      //   isSensor: true
      // });

      return {
        isUp: false,
        min: {
          x: x + 2,
          y: y - 11
        },
        max: {
          x: x + width,
          y: y - 10
        },
        width: width,
        height: 20,
        query() {
          // if (Matter.Query.collides(buttonSensor, body).length === 0 && Matter.Query.collides(buttonSensor, [player]).length === 0) {
          if (Matter.Query.region(body, this).length === 0 && Matter.Query.region([player], this).length === 0) {
            this.isUp = true;
          } else {
            this.isUp = false;
            // const list = Matter.Query.collides(buttonSensor, body)
            // if (list.length > 0) {
            //   Matter.Body.setVelocity(list[0].bodyB, {
            //     x: 0,
            //     y: 0
            //   });
            // }
          }
        },
        draw() {
          ctx.fillStyle = "hsl(0, 100%, 70%)"
          if (this.isUp) {
            ctx.fillRect(this.min.x, this.min.y - 10, this.width, 20)
          } else {
            ctx.fillRect(this.min.x, this.min.y - 3, this.width, 25)
          }
          //draw sensor zone
          // ctx.beginPath();
          // sensor = buttonSensor.vertices;
          // ctx.moveTo(sensor[0].x, sensor[0].y);
          // for (let i = 1; i < sensor.length; ++i) {
          //   ctx.lineTo(sensor[i].x, sensor[i].y);
          // }
          // ctx.lineTo(sensor[0].x, sensor[0].y);
          // ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
          // ctx.fill();
        }
      }
    },
    door(x, y, width, height, distance) {
      x = x + width / 2
      y = y + height / 2
      const doorBlock = body[body.length] = Bodies.rectangle(x, y, width, height, {
        collisionFilter: {
          category: cat.body,
          mask: cat.player | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet //cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
        },
        inertia: Infinity, //prevents rotation
        isNotHoldable: true,
        friction: 1,
        frictionStatic: 1,
        restitution: 0,
        isOpen: false,
        openClose() {
          if (!mech.isBodiesAsleep) {
            if (!this.isOpen) {
              if (this.position.y > y - distance) { //try to open 
                const position = {
                  x: this.position.x,
                  y: this.position.y - 1
                }
                Matter.Body.setPosition(this, position)
              }
            } else {
              if (this.position.y < y) { //try to close
                if (
                  Matter.Query.collides(this, [player]).length === 0 &&
                  Matter.Query.collides(this, body).length < 2 &&
                  Matter.Query.collides(this, mob).length === 0
                ) {
                  const position = {
                    x: this.position.x,
                    y: this.position.y + 1
                  }
                  Matter.Body.setPosition(this, position)
                }
              }
            }
          }
        },
        draw() {
          ctx.fillStyle = "#555"
          ctx.beginPath();
          const v = this.vertices;
          ctx.moveTo(v[0].x, v[0].y);
          for (let i = 1; i < v.length; ++i) {
            ctx.lineTo(v[i].x, v[i].y);
          }
          ctx.lineTo(v[0].x, v[0].y);
          ctx.fill();
        }
      });
      Matter.Body.setStatic(doorBlock, true); //make static
      return doorBlock
    },
    portal(centerA, angleA, centerB, angleB) {
      const width = 50
      const height = 150
      const mapWidth = 200
      const unitA = Matter.Vector.rotate({
        x: 1,
        y: 0
      }, angleA)
      const unitB = Matter.Vector.rotate({
        x: 1,
        y: 0
      }, angleB)

      draw = function () {
        ctx.beginPath(); //portal
        let v = this.vertices;
        ctx.moveTo(v[0].x, v[0].y);
        for (let i = 1; i < v.length; ++i) {
          ctx.lineTo(v[i].x, v[i].y);
        }
        ctx.fillStyle = this.color
        ctx.fill();
      }
      query = function () {
        if (Matter.Query.collides(this, [player]).length === 0) { //not touching player
          if (player.isInPortal === this) player.isInPortal = null
        } else if (player.isInPortal !== this) { //touching player
          if (mech.buttonCD_jump === mech.cycle) player.force.y = 0 // undo a jump right before entering the portal
          mech.buttonCD_jump = 0 //disable short jumps when letting go of jump key
          player.isInPortal = this.portalPair
          //teleport
          if (this.portalPair.angle % (Math.PI / 2)) { //if left, right up or down
            Matter.Body.setPosition(player, this.portalPair.portal.position);
          } else { //if at some odd angle
            Matter.Body.setPosition(player, this.portalPair.position);
          }
          //rotate velocity
          let mag
          if (this.portalPair.angle !== 0 && this.portalPair.angle !== Math.PI) { //portal that fires the player up
            mag = Math.max(10, Math.min(50, player.velocity.y * 0.8)) + 11
          } else {
            mag = Math.max(6, Math.min(50, Vector.magnitude(player.velocity)))
          }
          let v = Vector.mult(this.portalPair.unit, mag)
          Matter.Body.setVelocity(player, v);
          // move bots to follow player
          for (let i = 0; i < bullet.length; i++) {
            if (bullet[i].botType) {
              Matter.Body.setPosition(bullet[i], this.portalPair.portal.position);
              Matter.Body.setVelocity(bullet[i], {
                x: 0,
                y: 0
              });
            }
          }
        }
        if (body.length) {
          for (let i = 0, len = body.length; i < len; i++) {
            if (body[i] !== mech.holdingTarget) {
              // body[i].bounds.max.x - body[i].bounds.min.x < 100 && body[i].bounds.max.y - body[i].bounds.min.y < 100
              if (Matter.Query.collides(this, [body[i]]).length === 0) {
                if (body[i].isInPortal === this) body[i].isInPortal = null
              } else if (body[i].isInPortal !== this) {
                body[i].isInPortal = this.portalPair
                //teleport
                if (this.portalPair.angle % (Math.PI / 2)) { //if left, right up or down
                  Matter.Body.setPosition(body[i], this.portalPair.portal.position);
                } else { //if at some odd angle
                  Matter.Body.setPosition(body[i], this.portalPair.position);
                }
                //rotate velocity
                let mag
                if (this.portalPair.angle !== 0 && this.portalPair.angle !== Math.PI) { //portal that fires the player up
                  mag = Math.max(10, Math.min(50, body[i].velocity.y * 0.8)) + 11
                } else {
                  mag = Math.max(6, Math.min(50, Vector.magnitude(body[i].velocity)))
                }
                let v = Vector.mult(this.portalPair.unit, mag)
                Matter.Body.setVelocity(body[i], v);
              }
            }
          }
        }

        //remove block if touching
        // if (body.length) {
        //   touching = Matter.Query.collides(this, body)
        //   for (let i = 0; i < touching.length; i++) {
        //     if (touching[i].bodyB !== mech.holdingTarget) {
        //       for (let j = 0, len = body.length; j < len; j++) {
        //         if (body[j] === touching[i].bodyB) {
        //           body.splice(j, 1);
        //           len--
        //           Matter.World.remove(engine.world, touching[i].bodyB);
        //           break;
        //         }
        //       }
        //     }
        //   }
        // }

        // if (touching.length !== 0 && touching[0].bodyB !== mech.holdingTarget) {
        //   if (body.length) {
        //     for (let i = 0; i < body.length; i++) {
        //       if (body[i] === touching[0].bodyB) {
        //         body.splice(i, 1);
        //         break;
        //       }
        //     }
        //   }
        //   Matter.World.remove(engine.world, touching[0].bodyB);
        // }
      }

      const portalA = composite[composite.length] = Bodies.rectangle(centerA.x, centerA.y, width, height, {
        isSensor: true,
        angle: angleA,
        color: "hsla(197, 100%, 50%,0.7)",
        draw: draw,
      });
      const portalB = composite[composite.length] = Bodies.rectangle(centerB.x, centerB.y, width, height, {
        isSensor: true,
        angle: angleB,
        color: "hsla(29, 100%, 50%, 0.7)",
        draw: draw
      });
      const mapA = composite[composite.length] = Bodies.rectangle(centerA.x - 0.5 * unitA.x * mapWidth, centerA.y - 0.5 * unitA.y * mapWidth, mapWidth, height + 10, {
        collisionFilter: {
          category: cat.map,
          mask: cat.bullet | cat.powerUp | cat.mob | cat.mobBullet //cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
        },
        unit: unitA,
        angle: angleA,
        color: game.draw.mapFill,
        draw: draw,
        query: query,
        lastPortalCycle: 0
      });
      Matter.Body.setStatic(mapA, true); //make static
      World.add(engine.world, mapA); //add to world

      const mapB = composite[composite.length] = Bodies.rectangle(centerB.x - 0.5 * unitB.x * mapWidth, centerB.y - 0.5 * unitB.y * mapWidth, mapWidth, height + 10, {
        collisionFilter: {
          category: cat.map,
          mask: cat.bullet | cat.powerUp | cat.mob | cat.mobBullet //cat.player | cat.map | cat.body | cat.bullet | cat.powerUp | cat.mob | cat.mobBullet
        },
        unit: unitB,
        angle: angleB,
        color: game.draw.mapFill,
        draw: draw,
        query: query,
        lastPortalCycle: 0,
      });
      Matter.Body.setStatic(mapB, true); //make static
      World.add(engine.world, mapB); //add to world

      mapA.portal = portalA
      mapB.portal = portalB
      mapA.portalPair = mapB
      mapB.portalPair = mapA
      return [portalA, portalB, mapA, mapB]
    },
    hazard(x, y, width, height, damage = 0.0005, color = "hsla(160, 100%, 35%,0.75)") {
      return {
        min: {
          x: x,
          y: y
        },
        max: {
          x: x + width,
          y: y + height
        },
        width: width,
        height: height,
        maxHeight: height,
        isOn: true,
        query() {
          if (this.isOn && this.height > 0 && Matter.Query.region([player], this).length && !mech.isStealth) {
            if (damage < 0.02) {
              mech.damage(damage)
            } else if (mech.immuneCycle < mech.cycle) {
              mech.immuneCycle = mech.cycle + mod.collisionImmuneCycles;
              mech.damage(damage)
              game.drawList.push({ //add dmg to draw queue
                x: player.position.x,
                y: player.position.y,
                radius: damage * 1500,
                color: game.mobDmgColor,
                time: 20
              });
            }
            const drain = 0.005
            if (mech.energy > drain) mech.energy -= drain
          }
        },
        draw() {
          if (this.isOn) {
            ctx.fillStyle = color
            ctx.fillRect(this.min.x, this.min.y, this.width, this.height)
          }
        },
        level(isFill) {
          if (!mech.isBodiesAsleep) {
            const growSpeed = 1
            if (isFill) {
              if (this.height < this.maxHeight) {
                this.height += growSpeed
                this.min.y -= growSpeed
                this.max.y = this.min.y + this.height
              }
            } else if (this.height > 0) {
              this.height -= growSpeed
              this.min.y += growSpeed
              this.max.y = this.min.y + this.height
            }
          }
        }
      }
    },
    chain(x, y, angle = 0, isAttached = true, len = 15, radius = 20, stiffness = 1, damping = 1) {
      const gap = 2 * radius
      const unit = {
        x: Math.cos(angle),
        y: Math.sin(angle)
      }
      for (let i = 0; i < len; i++) {
        body[body.length] = Bodies.polygon(x + gap * unit.x * i, y + gap * unit.y * i, 12, radius, {
          inertia: Infinity,
          isNotHoldable: true
        });
      }
      for (let i = 1; i < len; i++) { //attach blocks to each other
        consBB[consBB.length] = Constraint.create({
          bodyA: body[body.length - i],
          bodyB: body[body.length - i - 1],
          stiffness: stiffness,
          damping: damping
        });
        World.add(engine.world, consBB[consBB.length - 1]);
      }
      cons[cons.length] = Constraint.create({ //pin first block to a point in space
        pointA: {
          x: x,
          y: y
        },
        bodyB: body[body.length - len],
        stiffness: 1,
        damping: damping
      });
      if (isAttached) {
        cons[cons.length] = Constraint.create({ //pin last block to a point in space
          pointA: {
            x: x + gap * unit.x * (len - 1),
            y: y + gap * unit.y * (len - 1)
          },
          bodyB: body[body.length - 1],
          stiffness: 1,
          damping: damping
        });
      }
    },
  };