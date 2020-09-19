//I am not the developper of this game, you can find the original project here "https://landgreen.github.io/sidescroller/" or his GitHub page here: "https://github.com/landgreen/n-gon"

const mod = {
    totalCount: null,
    setupAllMods() {
        for (let i = 0, len = mod.mods.length; i < len; i++) {
            mod.mods[i].remove();
            mod.mods[i].count = 0
        }
        mod.totalCount = 0;
        game.updateModHUD();
    },
    removeMod(index) {
        mod.mods[index].remove();
        mod.mods[index].count = 0;
        game.updateModHUD();
    },
    giveMod(index = 'random') {
        if (index === 'random') {
            let options = [];
            for (let i = 0; i < mod.mods.length; i++) {
                if (mod.mods[i].count < mod.mods[i].maxCount && mod.mods[i].allowed())
                    options.push(i);
            }
            // give a random mod from the mods I don't have
            if (options.length > 0) {
                let newMod = options[Math.floor(Math.random() * options.length)]
                mod.giveMod(newMod)
            }
        } else {
            if (isNaN(index)) { //find index by name
                let found = false;
                for (let i = 0; i < mod.mods.length; i++) {
                    if (index === mod.mods[i].name) {
                        index = i;
                        found = true;
                        break;
                    }
                }
                if (!found) return //if name not found don't give any mod
            }
            mod.mods[index].effect(); //give specific mod
            mod.mods[index].count++
            mod.totalCount++ //used in power up randomization
            game.updateModHUD();
        }
    },
    // giveBasicMod(index = 'random') {
    //     // if (isNaN(index)) { //find index by name
    //     //     let found = false;
    //     //     for (let i = 0; i < mod.mods.length; i++) {
    //     //         if (index === mod.mods[i].name) {
    //     //             index = i;
    //     //             found = true;
    //     //             break;
    //     //         }
    //     //     }
    //     //     if (!found) return //if name not found don't give any mod
    //     // }

    //     mod.basicMods[index].effect(); //give specific mod
    //     mod.mods[index].count++
    //     mod.totalCount++ //used in power up randomization
    //     game.updateModHUD();

    // },
    haveGunCheck(name) {
        if (
            !build.isCustomSelection &&
            b.inventory.length > 2 &&
            name !== b.guns[b.activeGun].name &&
            Math.random() > 2 / (b.inventory.length + mod.isGunCycle * 3) //lower chance of mods specific to a gun if you have lots of guns
        ) {
            return false
        }

        for (i = 0, len = b.inventory.length; i < len; i++) {
            if (b.guns[b.inventory[i]].name === name) return true
        }
        return false
    },
    damageFromMods() {
        let dmg = 1
        if (mod.isEnergyNoAmmo) dmg *= 1.4
        if (mod.isDamageForGuns) dmg *= 1 + 0.07 * b.inventory.length
        if (mod.isLowHealthDmg) dmg *= 1 + 0.6 * Math.max(0, 1 - mech.health)
        if (mod.isHarmDamage && mech.lastHarmCycle + 600 > mech.cycle) dmg *= 2;
        if (mod.isEnergyLoss) dmg *= 1.37;
        if (mod.isAcidDmg && mech.health > 1) dmg *= 1.4;
        if (mod.isRest && player.speed < 1) dmg *= 1.20;
        if (mod.isEnergyDamage) dmg *= 1 + mech.energy / 5.5;
        if (mod.isDamageFromBulletCount) dmg *= 1 + bullet.length * 0.0038
        if (mod.isRerollDamage) dmg *= 1 + 0.05 * powerUps.reroll.rerolls
        if (mod.isOneGun && b.inventory.length < 2) dmg *= 1.25
        return dmg * mod.slowFire
    },
    totalBots() {
        return mod.foamBotCount + mod.nailBotCount + mod.laserBotCount + mod.boomBotCount + mod.plasmaBotCount
    },
    mods: [{
            name: "integrated armament",
            description: "increase <strong class='color-d'>damage</strong> by <strong>25%</strong><br>your inventory can only hold <strong>1 gun</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return b.inventory.length < 2
            },
            requires: "no more than 1 gun",
            effect() {
                mod.isOneGun = true;
            },
            remove() {
                mod.isOneGun = false;
            }
        }, {
            name: "capacitor",
            // nameInfo: "<span id='mod-capacitor'></span>",
            description: "increase <strong class='color-d'>damage</strong> by <strong>1%</strong><br>for every <strong>5.5%</strong> stored <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.maxEnergy > 1 || mod.isEnergyRecovery || mod.isPiezo || mod.energySiphon > 0
            },
            requires: "increased energy regen or max energy",
            effect: () => {
                mod.isEnergyDamage = true // used in mech.grabPowerUp
            },
            remove() {
                mod.isEnergyDamage = false;
            }
        },
        {
            name: "exciton-lattice",
            description: `increase <strong class='color-d'>damage</strong> by <strong>40%</strong>, but<br><strong class='color-g'>ammo</strong> will no longer <strong>spawn</strong>`,
            maxCount: 1,
            count: 0,
            allowed() {
                return (mod.haveGunCheck("nail gun") && mod.isIceCrystals) || mod.haveGunCheck("laser") || mod.haveGunCheck("pulse") || mech.fieldUpgrades[mech.fieldMode].name === "plasma torch" || mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" || mech.fieldUpgrades[mech.fieldMode].name === "pilot wave"
            },
            requires: "energy based damage",
            effect() {
                mod.isEnergyNoAmmo = true;
            },
            remove() {
                mod.isEnergyNoAmmo = false;
            }
        },
        {
            name: "acute stress response",
            description: "increase <strong class='color-d'>damage</strong> by <strong>37%</strong><br>if a mob <strong>dies</strong> drain stored <strong class='color-f'>energy</strong> by <strong>25%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth
            },
            requires: "not mass-energy equivalence",
            effect() {
                mod.isEnergyLoss = true;
            },
            remove() {
                mod.isEnergyLoss = false;
            }
        },
        {
            name: "rest frame",
            // nameInfo: "<span id='mod-rest'></span>",
            description: "increase <strong class='color-d'>damage</strong> by <strong>20%</strong><br>when not <strong>moving</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect: () => {
                mod.isRest = true // used in mech.grabPowerUp
            },
            remove() {
                mod.isRest = false;
            }
        },
        {
            name: "kinetic bombardment",
            description: "increase <strong class='color-d'>damage</strong> by up to <strong>33%</strong><br>at a <strong>distance</strong> of 40 steps from the target",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.isFarAwayDmg = true; //used in mob.damage()
            },
            remove() {
                mod.isFarAwayDmg = false;
            }
        },
        {
            name: "fluoroantimonic acid",
            description: "increase <strong class='color-d'>damage</strong> by <strong>40%</strong><br>when your base <strong>health</strong> is above <strong>100%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.maxHealth > 1;
            },
            requires: "health above 100%",
            effect() {
                mod.isAcidDmg = true;
            },
            remove() {
                mod.isAcidDmg = false;
            }
        },
        {
            name: "negative feedback",
            description: "increase <strong class='color-d'>damage</strong> by <strong>6%</strong><br>for every <strong>10%</strong> missing base <strong>health</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.health < 0.6 || build.isCustomSelection
            },
            requires: "health below 60%",
            effect() {
                mod.isLowHealthDmg = true; //used in mob.damage()
            },
            remove() {
                mod.isLowHealthDmg = false;
            }
        },
        {
            name: "radiative equilibrium",
            description: "for <strong>10 seconds</strong> after receiving <strong class='color-harm'>harm</strong><br>increase <strong class='color-d'>damage</strong> by <strong>100%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.harmReduction() < 1
            },
            requires: "some harm reduction",
            effect() {
                mod.isHarmDamage = true;
            },
            remove() {
                mod.isHarmDamage = false;
            }
        },
        {
            name: "perturbation theory",
            description: "increase <strong class='color-d'>damage</strong> by <strong>5%</strong><br>for each of your <strong class='color-r'>rerolls</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return powerUps.reroll.rerolls > 3 || build.isCustomSelection
            },
            requires: "at least 4 rerolls",
            effect() {
                mod.isRerollDamage = true;
            },
            remove() {
                mod.isRerollDamage = false;
            }
        },
        {
            name: "Ψ(t) collapse",
            description: "<strong>40%</strong> decreased <strong>delay</strong> after firing<br>if you have no <strong class='color-r'>rerolls</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return powerUps.reroll.rerolls === 0 && !mod.manyWorlds
            },
            requires: "no rerolls",
            effect() {
                mod.isRerollHaste = true;
                mod.rerollHaste = 0.6;
                b.setFireCD();
            },
            remove() {
                mod.isRerollHaste = false;
                mod.rerollHaste = 1;
                b.setFireCD();
            }
        },
        {
            name: "electrostatic discharge",
            description: "increase <strong class='color-d'>damage</strong> by <strong>20%</strong><br><strong>20%</strong> increased <strong>delay</strong> after firing",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            effect() {
                mod.slowFire = 1.2
                b.setFireCD();
            },
            remove() {
                mod.slowFire = 1;
                b.setFireCD();
            }
        },
        {
            name: "auto-loading heuristics",
            description: "<strong>25%</strong> decreased <strong>delay</strong> after firing",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.fireRate *= 0.75
                b.setFireCD();
            },
            remove() {
                mod.fireRate = 1;
                b.setFireCD();
            }
        },
        {
            name: "mass driver",
            description: "increase <strong>block</strong> collision <strong class='color-d'>damage</strong> by <strong>100%</strong><br>charge <strong>throws</strong> more <strong>quickly</strong> for less <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.throwChargeRate = 2
            },
            remove() {
                mod.throwChargeRate = 1
            }
        },
        {
            name: "reaction inhibitor",
            description: "mobs spawn with <strong>12%</strong> less <strong>health</strong>",
            maxCount: 3,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect: () => {
                mod.mobSpawnWithHealth *= 0.88

                //set all mobs at full health to 0.85
                for (let i = 0; i < mob.length; i++) {
                    if (mob.health > mod.mobSpawnWithHealth) mob.health = mod.mobSpawnWithHealth
                }
            },
            remove() {
                mod.mobSpawnWithHealth = 1;
            }
        },
        {
            name: "zoospore vector",
            description: "mobs produce <strong class='color-p' style='letter-spacing: 2px;'>spores</strong> when they <strong>die</strong><br><strong>9%</strong> chance",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.sporesOnDeath += 0.09;
                for (let i = 0; i < 10; i++) {
                    b.spore(mech.pos)
                }
            },
            remove() {
                mod.sporesOnDeath = 0;
            }
        },
        {
            name: "impact shear",
            description: "mobs release a <strong>nail</strong> when they <strong>die</strong><br>nails target nearby mobs",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect: () => {
                mod.nailsDeathMob++
            },
            remove() {
                mod.nailsDeathMob = 0;
            }
        },
        {
            name: "thermal runaway",
            description: "mobs <strong class='color-e'>explode</strong> when they <strong>die</strong><br><em>be careful</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect: () => {
                mod.isExplodeMob = true;
            },
            remove() {
                mod.isExplodeMob = false;
            }
        },
        {
            name: "trinitrotoluene",
            description: "increase <strong class='color-e'>explosive</strong> <strong class='color-d'>damage</strong> by <strong>50%</strong><br>decrease <strong class='color-e'>explosive</strong> <strong>area</strong> by <strong>71%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("missiles") || mod.haveGunCheck("flak") || mod.haveGunCheck("grenades") || mod.haveGunCheck("vacuum bomb") || mod.haveGunCheck("pulse") || mod.isMissileField || mod.boomBotCount > 1;
            },
            requires: "an explosive damage source",
            effect: () => {
                mod.isSmallExplosion = true;
            },
            remove() {
                mod.isSmallExplosion = false;
            }
        },
        {
            name: "ammonium nitrate",
            description: "increase <strong class='color-e'>explosive</strong> <strong>area</strong> by <strong>60%</strong>, but<br>you take <strong>300%</strong> more <strong class='color-harm'>harm</strong> from <strong class='color-e'>explosions</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("missiles") || mod.haveGunCheck("flak") || mod.haveGunCheck("grenades") || mod.haveGunCheck("vacuum bomb") || mod.haveGunCheck("pulse") || mod.isMissileField
            },
            requires: "an explosive damage source",
            effect: () => {
                mod.isExplosionHarm = true;
            },
            remove() {
                mod.isExplosionHarm = false;
            }
        },
        {
            name: "electric reactive armor",
            // description: "<strong class='color-e'>explosions</strong> do no <strong class='color-harm'>harm</strong><br> while your <strong class='color-f'>energy</strong> is above <strong>98%</strong>",
            description: "<strong class='color-harm'>harm</strong> from <strong class='color-e'>explosions</strong> is passively reduced<br>by <strong>6%</strong> for every <strong>10</strong> stored <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("missiles") || mod.haveGunCheck("flak") || mod.haveGunCheck("grenades") || mod.haveGunCheck("vacuum bomb") || mod.isMissileField || mod.isExplodeMob
            },
            requires: "an explosive damage source",
            effect: () => {
                mod.isImmuneExplosion = true;
            },
            remove() {
                mod.isImmuneExplosion = false;
            }
        },
        {
            name: "scrap bots",
            description: "<strong>11%</strong> chance to build a <strong>bot</strong> after killing a mob<br>the bot only functions until the end of the level",
            maxCount: 6,
            count: 0,
            allowed() {
                return mod.totalBots() > 0
            },
            requires: "a bot",
            effect() {
                mod.isBotSpawner += 0.11;
            },
            remove() {
                mod.isBotSpawner = 0;
            }
        },
        {
            name: "bot fabrication",
            description: "anytime you collect <strong>4</strong> <strong class='color-r'>rerolls</strong><br>use them to build a <strong>random bot</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return powerUps.reroll.rerolls > 3 || build.isCustomSelection
            },
            requires: "at least 4 rerolls",
            effect() {
                mod.isRerollBots = true;
                powerUps.reroll.changeRerolls(0)
            },
            remove() {
                mod.isRerollBots = false;
            }
        },
        {
            name: "nail-bot",
            description: "a bot fires <strong>nails</strong> at targets in line of sight",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.nailBotCount++;
                b.nailBot();
            },
            remove() {
                mod.nailBotCount = 0;
            }
        },
        {
            name: "nail-bot upgrade",
            description: "<strong>100%</strong> increased nail-bot <strong> fire rate</strong><br><em>applies to all current and future nail-bots</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.nailBotCount > 1
            },
            requires: "2 or more nail bots",
            effect() {
                mod.isNailBotUpgrade = true
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'nail') bullet[i].isUpgraded = true
                }
            },
            remove() {
                mod.isNailBotUpgrade = false
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'nail') bullet[i].isUpgraded = false
                }
            }
        },
        {
            name: "foam-bot",
            description: "a bot fires <strong>foam</strong> at targets in line of sight",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.foamBotCount++;
                b.foamBot();
            },
            remove() {
                mod.foamBotCount = 0;
            }
        },
        {
            name: "foam-bot upgrade",
            description: "<strong>100%</strong> increased foam-bot <strong>foam size</strong><br><em>applies to all current and future foam-bots</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.foamBotCount > 1
            },
            requires: "2 or more foam bots",
            effect() {
                mod.isFoamBotUpgrade = true
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'foam') bullet[i].isUpgraded = true
                }
            },
            remove() {
                mod.isFoamBotUpgrade = false
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'foam') bullet[i].isUpgraded = false
                }
            }
        },
        {
            name: "boom-bot",
            description: "a bot <strong>defends</strong> the space around you<br>ignites an <strong class='color-e'>explosion</strong> after hitting a mob",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.boomBotCount++;
                b.boomBot();
            },
            remove() {
                mod.boomBotCount = 0;
            }
        },
        {
            name: "boom-bot upgrade",
            description: "<strong>100%</strong> increased boom-bot <strong class='color-e'>explosion</strong> size<br><em>applies to all current and future boom-bots</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.boomBotCount > 1
            },
            requires: "2 or more boom bots",
            effect() {
                mod.isBoomBotUpgrade = true
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'boom') bullet[i].isUpgraded = true
                }
            },
            remove() {
                mod.isBoomBotUpgrade = false
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'boom') bullet[i].isUpgraded = false
                }
            }
        },
        {
            name: "laser-bot",
            description: "a bot <strong>defends</strong> the space around you<br>uses a <strong>short range</strong> laser that drains <strong class='color-f'>energy</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.laserBotCount++;
                b.laserBot();
            },
            remove() {
                mod.laserBotCount = 0;
            }
        },
        {
            name: "laser-bot upgrade",
            description: "<strong>100%</strong> increased laser-bot <strong class='color-d'>damage</strong><br><em>applies to all current and future laser-bots</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.laserBotCount > 1
            },
            requires: "2 or more laser bots",
            effect() {
                mod.isLaserBotUpgrade = true
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'laser') bullet[i].isUpgraded = true
                }
            },
            remove() {
                mod.isLaserBotUpgrade = false
                for (let i = 0; i < bullet.length; i++) {
                    if (bullet[i].botType = 'laser') bullet[i].isUpgraded = false
                }
            }
        },
        {
            name: "perimeter defense",
            description: "reduce <strong class='color-harm'>harm</strong> by <strong>4%</strong><br>for each of your permanent <strong>bots</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.totalBots() > 4 && !mod.isEnergyHealth
            },
            requires: "5 or more bots",
            effect() {
                mod.isBotArmor = true
            },
            remove() {
                mod.isBotArmor = false
            }
        },
        {
            name: "bot replication",
            description: "<strong>duplicate</strong> your permanent <strong>bots</strong><br>remove <strong>all</strong> of your <strong class='color-g'>guns</strong>",
            maxCount: 1,
            count: 0,
            // isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return mod.totalBots() > 3
            },
            requires: "at least 3 bots",
            effect() {
                b.removeAllGuns();
                game.makeGunHUD();
                //double bots
                for (let i = 0; i < mod.nailBotCount; i++) {
                    b.nailBot();
                }
                mod.nailBotCount *= 2
                for (let i = 0; i < mod.laserBotCount; i++) {
                    b.laserBot();
                }
                mod.laserBotCount *= 2
                for (let i = 0; i < mod.foamBotCount; i++) {
                    b.foamBot();
                }
                mod.foamBotCount *= 2
                for (let i = 0; i < mod.boomBotCount; i++) {
                    b.boomBot();
                }
                mod.boomBotCount *= 2
                for (let i = 0; i < mod.plasmaBotCount; i++) {
                    b.plasmaBot();
                }
                mod.plasmaBotCount *= 2
            },
            remove() {}
        },
        {
            name: "ablative drones",
            description: "rebuild your broken parts as <strong>drones</strong><br>chance to occur after receiving <strong class='color-harm'>harm</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.harmReduction() < 1
            },
            requires: "some harm reduction",
            effect() {
                mod.isDroneOnDamage = true;
                for (let i = 0; i < 4; i++) {
                    b.drone() //spawn drone
                }
            },
            remove() {
                mod.isDroneOnDamage = false;
            }
        },
        {
            name: "mine synthesis",
            description: "drop a <strong>mine</strong> after picking up a <strong>power up</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.isMineDrop = true;
            },
            remove() {
                mod.isMineDrop = false;
            }
        },
        {
            name: "squirrel-cage rotor",
            description: "<strong>jump</strong> higher and <strong>move</strong> faster",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() { // good with melee builds, content skipping builds
                mod.squirrelFx += 0.2;
                mod.squirrelJump += 0.09;
                mech.setMovement()
            },
            remove() {
                mod.squirrelFx = 1;
                mod.squirrelJump = 1;
                mech.setMovement()
            }
        },
        {
            name: "Pauli exclusion",
            description: `<strong>immune</strong> to <strong class='color-harm'>harm</strong> for <strong>1</strong> second<br>after receiving <strong class='color-harm'>harm</strong> from a collision`,
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.collisionImmuneCycles += 60;
                mech.immuneCycle = mech.cycle + mod.collisionImmuneCycles; //player is immune to collision damage for 30 cycles
            },
            remove() {
                mod.collisionImmuneCycles = 25;
            }
        },
        {
            name: "non-Newtonian armor",
            description: "for <strong>10 seconds</strong> after receiving <strong class='color-harm'>harm</strong><br>reduce <strong class='color-harm'>harm</strong> by <strong>50%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth && mech.harmReduction() < 1
            },
            requires: "some harm reduction",
            effect() {
                mod.isHarmArmor = true;
            },
            remove() {
                mod.isHarmArmor = false;
            }
        },
        {
            name: "clock gating",
            description: `<strong>slow</strong> <strong>time</strong> by <strong>50%</strong> after receiving <strong class='color-harm'>harm</strong><br>reduce <strong class='color-harm'>harm</strong> by <strong>15%</strong>`,
            maxCount: 1,
            count: 0,
            allowed() {
                return game.fpsCapDefault > 45 && !mod.isRailTimeSlow
            },
            requires: "FPS above 45",
            effect() {
                mod.isSlowFPS = true;
            },
            remove() {
                mod.isSlowFPS = false;
            }
        },
        {
            name: "liquid cooling",
            description: `<strong class='color-s'>freeze</strong> all mobs for <strong>5</strong> seconds<br>after receiving <strong class='color-harm'>harm</strong>`,
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.isSlowFPS
            },
            requires: "clock gating",
            effect() {
                mod.isHarmFreeze = true;
            },
            remove() {
                mod.isHarmFreeze = false;
            }
        },

        {
            name: "osmoprotectant",
            description: `collisions with <strong>stunned</strong> or <strong class='color-s'>frozen</strong> mobs<br>cause you <strong>no</strong> <strong class='color-harm'>harm</strong>`,
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.superposition || mod.isStunField || mod.isPulseStun || mod.isNeutronStun || mod.oneSuperBall || mod.isHarmFreeze || mod.isIceField || mod.isIceCrystals || mod.isSporeFreeze || mod.isAoESlow || mod.isFreezeMobs || mod.isPilotFreeze || mod.haveGunCheck("ice IX")
            },
            requires: "a freezing or stunning effect",
            effect() {
                mod.isFreezeHarmImmune = true;
            },
            remove() {
                mod.isFreezeHarmImmune = false;
            }
        },
        {
            name: "piezoelectricity",
            description: "<strong>colliding</strong> with mobs fills your <strong class='color-f'>energy</strong><br><strong>15%</strong> less <strong class='color-harm'>harm</strong> from mob collisions",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth
            },
            requires: "not mass-energy equivalence",
            effect() {
                mod.isPiezo = true;
                mech.energy = mech.maxEnergy;
            },
            remove() {
                mod.isPiezo = false;
            }
        },
        {
            name: "ground state",
            description: "reduce <strong class='color-harm'>harm</strong> by <strong>50%</strong><br>you <strong>no longer</strong> passively regenerate <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.isPiezo
            },
            requires: "piezoelectricity",
            effect: () => {
                mod.energyRegen = 0;
                mech.fieldRegen = mod.energyRegen;
            },
            remove() {
                mod.energyRegen = 0.001;
                mech.fieldRegen = mod.energyRegen;
            }
        },
        {
            name: "mass-energy equivalence",
            description: "<strong class='color-f'>energy</strong> protects you instead of <strong>health</strong><br><strong class='color-harm'>harm</strong> <strong>reduction</strong> effects provide <strong>no</strong> benefit",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isPiezo
            },
            requires: "not piezoelectricity<br>or acute stress response",
            effect: () => {
                mech.health = 0
                // mech.displayHealth();
                document.getElementById("health").style.display = "none"
                document.getElementById("health-bg").style.display = "none"
                document.getElementById("dmg").style.backgroundColor = "#0cf";
                mod.isEnergyHealth = true;
                mech.displayHealth();
            },
            remove() {
                mod.isEnergyHealth = false;
                document.getElementById("health").style.display = "inline"
                document.getElementById("health-bg").style.display = "inline"
                document.getElementById("dmg").style.backgroundColor = "#f67";
                mech.health = Math.min(mech.maxHealth, mech.energy);
                mech.displayHealth();

            }
        },
        {
            name: "energy conservation",
            description: "<strong>10%</strong> of <strong class='color-d'>damage</strong> done recovered as <strong class='color-f'>energy</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.energySiphon += 0.1;
            },
            remove() {
                mod.energySiphon = 0;
            }
        },
        {
            name: "overcharge",
            description: "increase your <strong>maximum</strong> <strong class='color-f'>energy</strong> by <strong>50%</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mech.maxEnergy += 0.5
                mech.energy += 0.5
            },
            remove() {
                mech.maxEnergy = 1;
            }
        },
        {
            name: "waste energy recovery",
            description: "if a mob has <strong>died</strong> in the last <strong>5 seconds</strong><br>regen <strong>6%</strong> of max <strong class='color-f'>energy</strong> every second",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.isEnergyRecovery = true;
            },
            remove() {
                mod.isEnergyRecovery = false;
            }
        },
        {
            name: "scrap recycling",
            description: "if a mob has <strong>died</strong> in the last <strong>5 seconds</strong><br><strong class='color-h'>heal</strong> up to <strong>1%</strong> of max health every second",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth
            },
            requires: "not mass-energy equivalence",
            effect() {
                mod.isHealthRecovery = true;
            },
            remove() {
                mod.isHealthRecovery = false;
            }
        },
        {
            name: "entropy exchange",
            description: "<strong class='color-h'>heal</strong> for <strong>1%</strong> of <strong class='color-d'>damage</strong> done",
            maxCount: 9,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth
            },
            requires: "not mass-energy equivalence",
            effect() {
                mod.healthDrain += 0.01;
            },
            remove() {
                mod.healthDrain = 0;
            }
        },
        {
            name: "supersaturation",
            description: "increase your <strong>maximum</strong> <strong class='color-h'>health</strong> by <strong>50%</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth
            },
            requires: "not mass-energy equivalence",
            effect() {
                mech.maxHealth += 0.50
                mech.addHealth(0.50)
            },
            remove() {
                mech.maxHealth = 1;
                mech.displayHealth();
            }
        },
        {
            name: "crystallized armor",
            description: "increase <strong>maximum</strong> <strong class='color-h'>health</strong> by <strong>5%</strong> for each<br>unused <strong>power up</strong> at the end of a <strong>level</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth && !mod.isDroneGrab
            },
            requires: "not mass-energy equivalence",
            effect() {
                mod.isArmorFromPowerUps = true;
            },
            remove() {
                mod.isArmorFromPowerUps = false;
            }
        },
        {
            name: "negentropy",
            description: `at the start of each <strong>level</strong><br>spawn a <strong class='color-h'>heal</strong> for every <strong>50%</strong> missing health`,
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.maxHealth > 1 || mod.isArmorFromPowerUps
            },
            requires: "increased max health",
            effect() {
                mod.isHealLowHealth = true;
            },
            remove() {
                mod.isHealLowHealth = false;
            }
        },
        {
            name: "adiabatic healing",
            description: "<strong class='color-h'>heal</strong> <strong>power ups</strong> are <strong>100%</strong> more effective",
            maxCount: 3,
            count: 0,
            allowed() {
                return (mech.health < 0.7 || build.isCustomSelection) && !mod.isEnergyHealth
            },
            requires: "not mass-energy equivalence",
            effect() {
                mod.largerHeals++;
            },
            remove() {
                mod.largerHeals = 1;
            }
        },
        {
            name: "anthropic principle",
            nameInfo: "<span id = 'mod-anthropic'></span>",
            addNameInfo() {
                setTimeout(function () {
                    powerUps.reroll.changeRerolls(0)
                }, 1000);
            },
            description: "instead of <strong>dying</strong> consume a <strong class='color-r'>reroll</strong><br>and spawn <strong>4</strong> <strong class='color-h'>heal</strong> power ups",
            maxCount: 1,
            count: 0,
            allowed() {
                return powerUps.reroll.rerolls > 0 || build.isCustomSelection
            },
            requires: "at least 1 reroll",
            effect() {
                mod.isDeathAvoid = true;
                setTimeout(function () {
                    powerUps.reroll.changeRerolls(0)
                }, 1000);
            },
            remove() {
                mod.isDeathAvoid = false;
            }
        },
        {
            name: "bubble fusion",
            description: "after destroying a mob's <strong>shield</strong><br>spawn <strong>1-2</strong> <strong class='color-h'>heals</strong>, <strong class='color-g'>ammo</strong>, or <strong class='color-r'>rerolls</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.isShieldAmmo = true;
            },
            remove() {
                mod.isShieldAmmo = false;
            }
        },
        {
            name: "Bayesian statistics",
            description: "<strong>17%</strong> chance to <strong>duplicate</strong> spawned <strong>power ups</strong><br>after a <strong>collision</strong>, <strong>eject</strong> one of your <strong class='color-m'>mods</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect: () => {
                mod.isBayesian = true
            },
            remove() {
                mod.isBayesian = false
            }
        },
        {
            name: "entanglement",
            nameInfo: "<span id = 'mod-entanglement'></span>",
            addNameInfo() {
                setTimeout(function () {
                    game.boldActiveGunHUD();
                }, 1000);
            },
            description: "while your <strong>first</strong> <strong class='color-g'>gun</strong> is equipped<br>reduce <strong class='color-harm'>harm</strong> by <strong>13%</strong> for each of your <strong class='color-g'>guns</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return b.inventory.length > 1 && !mod.isEnergyHealth
            },
            requires: "at least 2 guns",
            effect() {
                mod.isEntanglement = true
                setTimeout(function () {
                    game.boldActiveGunHUD();
                }, 1000);

            },
            remove() {
                mod.isEntanglement = false;
            }
        },
        {
            name: "arsenal",
            description: "increase <strong class='color-d'>damage</strong> by <strong>7%</strong><br>for each <strong class='color-g'>gun</strong> in your inventory",
            maxCount: 1,
            count: 0,
            allowed() {
                return b.inventory.length > 1
            },
            requires: "at least 2 guns",
            effect() {
                mod.isDamageForGuns = true;
            },
            remove() {
                mod.isDamageForGuns = false;
            }
        },
        {
            name: "generalist",
            description: "<strong>spawn</strong> 5 <strong class='color-g'>guns</strong>, but you can't <strong>switch</strong> <strong class='color-g'>guns</strong><br><strong class='color-g'>guns</strong> cycle automatically with each new level",
            maxCount: 1,
            count: 0,
            isNonRefundable: true,
            allowed() {
                return mod.isDamageForGuns
            },
            requires: "arsenal",
            effect() {
                mod.isGunCycle = true;
                for (let i = 0; i < 5; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "gun");
                }
            },
            remove() {
                mod.isGunCycle = false;
            }
        },
        {
            name: "logistics",
            description: "<strong class='color-g'>ammo</strong> power ups give <strong>200%</strong> <strong class='color-g'>ammo</strong><br>but <strong class='color-g'>ammo</strong> is only added to your <strong>current gun</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyNoAmmo
            },
            requires: "not exciton-lattice",
            effect() {
                mod.isAmmoForGun = true;
            },
            remove() {
                mod.isAmmoForGun = false;
            }
        },
        {
            name: "supply chain",
            description: "double your current <strong class='color-g'>ammo</strong> for all <strong class='color-g'>guns</strong>",
            maxCount: 9,
            count: 0,
            isNonRefundable: true,
            allowed() {
                return mod.isAmmoForGun
            },
            requires: "logistics",
            effect() {
                for (let i = 0; i < b.guns.length; i++) {
                    if (b.guns[i].have) b.guns[i].ammo = Math.floor(2 * b.guns[i].ammo)
                }
                game.makeGunHUD();
            },
            remove() {}
        },
        {
            name: "catabolism",
            description: "gain <strong class='color-g'>ammo</strong> when you <strong>fire</strong> while <strong>out</strong> of <strong class='color-g'>ammo</strong><br>drains <strong>2%</strong> of <strong>max health</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isEnergyHealth && !mod.isEnergyNoAmmo
            },
            requires: "not mass-energy equivalence<br>not exciton-lattice",
            effect: () => {
                mod.isAmmoFromHealth = 0.023;
            },
            remove() {
                mod.isAmmoFromHealth = 0;
            }
        },
        {
            name: "desublimated ammunition",
            description: "use <strong>50%</strong> less <strong class='color-g'>ammo</strong> when <strong>crouching</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                mod.isCrouchAmmo = true
            },
            remove() {
                mod.isCrouchAmmo = false;
            }
        },
        {
            name: "gun turret",
            description: "reduce <strong class='color-harm'>harm</strong> by <strong>40%</strong> when <strong>crouching</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.isCrouchAmmo
            },
            requires: "desublimated ammunition",
            effect() {
                mod.isTurret = true
            },
            remove() {
                mod.isTurret = false;
            }
        },
        {
            name: "cardinality",
            description: "<strong class='color-m'>mods</strong>, <strong class='color-f'>fields</strong>, and <strong class='color-g'>guns</strong> have <strong>5</strong> <strong>choices</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isDeterminism
            },
            requires: "not determinism",
            effect: () => {
                mod.isExtraChoice = true;
            },
            remove() {
                mod.isExtraChoice = false;
            }
        },
        {
            name: "determinism",
            description: "spawn <strong>5</strong> <strong class='color-m'>mods</strong><br><strong class='color-m'>mods</strong>, <strong class='color-f'>fields</strong>, and <strong class='color-g'>guns</strong> have only <strong>1 choice</strong>",
            maxCount: 1,
            count: 0,
            isNonRefundable: true,
            allowed() {
                return !mod.isExtraChoice
            },
            requires: "not cardinality",
            effect: () => {
                mod.isDeterminism = true;
                for (let i = 0; i < 5; i++) { //if you change the six also change it in Born rule
                    powerUps.spawn(mech.pos.x, mech.pos.y, "mod");
                }
            },
            remove() {
                mod.isDeterminism = false;
            }
        },
        {
            name: "superdeterminism",
            description: "spawn <strong>4</strong> <strong class='color-m'>mods</strong><br><strong class='color-r'>rerolls</strong>, <strong class='color-g'>guns</strong>, and <strong class='color-f'>fields</strong> no longer <strong>spawn</strong>",
            maxCount: 1,
            count: 0,
            isNonRefundable: true,
            allowed() {
                return mod.isDeterminism && !mod.manyWorlds
            },
            requires: "determinism",
            effect: () => {
                mod.isSuperDeterminism = true;
                for (let i = 0; i < 4; i++) { //if you change the six also change it in Born rule
                    powerUps.spawn(mech.pos.x, mech.pos.y, "mod");
                }
            },
            remove() {
                mod.isSuperDeterminism = false;
            }
        },
        {
            name: "many-worlds",
            description: "if you have no <strong class='color-r'>rerolls</strong> spawn one<br>after choosing a <strong class='color-m'>mod</strong>, <strong class='color-f'>field</strong>, or <strong class='color-g'>gun</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isSuperDeterminism && !mod.isRerollHaste
            },
            requires: "not superdeterminism or Ψ(t) collapse",
            effect: () => {
                mod.manyWorlds = true;
            },
            remove() {
                mod.manyWorlds = false;
            }
        },
        {
            name: "renormalization",
            description: "consuming a <strong class='color-r'>reroll</strong> for <strong>any</strong> purpose<br>has a <strong>37%</strong> chance to spawn a <strong class='color-r'>reroll</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isSuperDeterminism && !mod.isRerollHaste
            },
            requires: "not superdeterminism or Ψ(t) collapse",
            effect() {
                mod.renormalization = true;
            },
            remove() {
                mod.renormalization = false;
            }
        },
        {
            name: "quantum immortality",
            description: "after <strong>dying</strong>, continue in an <strong>alternate reality</strong><br>spawn <strong>5</strong> <strong class='color-r'>rerolls</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return powerUps.reroll.rerolls > 1 || build.isCustomSelection
            },
            requires: "at least 2 rerolls",
            effect() {
                mod.isImmortal = true;
                for (let i = 0; i < 5; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "reroll", false);
                }
            },
            remove() {
                mod.isImmortal = false;
            }
        },
        {
            name: "Born rule",
            description: "<strong>remove</strong> all current <strong class='color-m'>mods</strong><br>spawn new <strong class='color-m'>mods</strong> to replace them",
            maxCount: 1,
            count: 0,
            // isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return (mod.totalCount > 6)
            },
            requires: "more than 6 mods",
            effect: () => {
                //remove active bullets  //to get rid of bots
                for (let i = 0; i < bullet.length; ++i) Matter.World.remove(engine.world, bullet[i]);
                bullet = [];

                let count = 0 //count mods
                for (let i = 0, len = mod.mods.length; i < len; i++) { // spawn new mods power ups
                    if (!mod.mods[i].isNonRefundable) count += mod.mods[i].count
                }
                if (mod.isDeterminism) count -= 3 //remove the bonus mods 
                if (mod.isSuperDeterminism) count -= 2 //remove the bonus mods 

                mod.setupAllMods(); // remove all mods
                for (let i = 0; i < count; i++) { // spawn new mods power ups
                    powerUps.spawn(mech.pos.x, mech.pos.y, "mod");
                }
                //have state is checked in mech.death()
            },
            remove() {}
        },
        {
            name: "reallocation",
            description: "convert <strong>1</strong> random <strong class='color-m'>mod</strong> into <strong>2</strong> new <strong class='color-g'>guns</strong><br><em>recursive mods lose all stacks</em>",
            maxCount: 1,
            count: 0,
            isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return (mod.totalCount > 0) && !mod.isSuperDeterminism
            },
            requires: "at least 1 mod",
            effect: () => {
                const have = [] //find which mods you have
                for (let i = 0; i < mod.mods.length; i++) {
                    if (mod.mods[i].count > 0) have.push(i)
                }
                const choose = have[Math.floor(Math.random() * have.length)]
                game.makeTextLog(`<div class='circle mod'></div> &nbsp; <strong>${mod.mods[choose].name}</strong> removed by reallocation`, 300)
                for (let i = 0; i < 2 * mod.mods[choose].count; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "gun");
                }
                mod.mods[choose].count = 0;
                mod.mods[choose].remove(); // remove a random mod form the list of mods you have
                mod.mods[choose].isLost = true
                game.updateModHUD();
            },
            remove() {}
        },
        //************************************************** 
        //************************************************** gun
        //************************************************** mods
        //************************************************** 
        {
            name: "Lorentzian topology",
            description: "your <strong>bullets</strong> last <strong>33% longer</strong>",
            maxCount: 3,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" || mod.haveGunCheck("spores") || mod.haveGunCheck("drones") || mod.haveGunCheck("super balls") || mod.haveGunCheck("foam") || mod.haveGunCheck("wave beam") || mod.haveGunCheck("ice IX") || mod.haveGunCheck("neutron bomb")
            },
            requires: "drones, spores, super balls, foam<br>wave beam, ice IX, neutron bomb",
            effect() {
                mod.isBulletsLastLonger += 0.33
            },
            remove() {
                mod.isBulletsLastLonger = 1;
            }
        },
        {
            name: "microstates",
            description: "increase <strong class='color-d'>damage</strong> by <strong>4%</strong><br>for every <strong>10</strong> active <strong>bullets</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.isBulletsLastLonger > 1
            },
            requires: "Lorentzian topology",
            effect() {
                mod.isDamageFromBulletCount = true
            },
            remove() {
                mod.isDamageFromBulletCount = false
            }
        },
        {
            name: "pneumatic actuator",
            description: "<strong>nail gun</strong> takes <strong>45%</strong> less time to ramp up<br>to it's shortest <strong>delay</strong> after firing",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("nail gun")
            },
            requires: "nail gun",
            effect() {
                mod.nailFireRate = true
            },
            remove() {
                mod.nailFireRate = false
            }
        },
        {
            name: "powder-actuated",
            description: "<strong>nail gun</strong> takes <strong>no</strong> time to ramp up<br>nails have a <strong>30%</strong> faster muzzle <strong>speed</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("nail gun") && mod.nailFireRate && !mod.isIceCrystals
            },
            requires: "nail gun",
            effect() {
                mod.nailInstantFireRate = true
            },
            remove() {
                mod.nailInstantFireRate = false
            }
        },
        {
            name: "ice crystal nucleation",
            description: "the <strong>nail gun</strong> uses <strong class='color-f'>energy</strong> to condense<br>unlimited <strong class='color-s'>freezing</strong> <strong>ice shards</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("nail gun") && !mod.nailInstantFireRate
            },
            requires: "nail gun",
            effect() {
                mod.isIceCrystals = true;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "nail gun") {
                        b.guns[i].ammoPack = Infinity
                        b.guns[i].recordedAmmo = b.guns[i].ammo
                        b.guns[i].ammo = Infinity
                        game.updateGunHUD();
                        break;
                    }
                }
            },
            remove() {
                mod.isIceCrystals = false;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "nail gun") {
                        b.guns[i].ammoPack = b.guns[i].defaultAmmoPack;
                        b.guns[i].ammo = b.guns[i].recordedAmmo
                        game.updateGunHUD();
                        break;
                    }
                }
            }
        },
        {
            name: "shotgun spin-statistics",
            description: "<strong>immune</strong> to <strong class='color-harm'>harm</strong> while firing the <strong>shotgun</strong><br>receive <strong>33%</strong> less <strong>shotgun</strong> <strong class='color-g'>ammo</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("shotgun")
            },
            requires: "shotgun",
            effect() {
                mod.isShotgunImmune = true;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "shotgun") {
                        b.guns[i].ammoPack = b.guns[i].defaultAmmoPack * 0.66
                        break;
                    }
                }
            },
            remove() {
                mod.isShotgunImmune = false;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "shotgun") {
                        b.guns[i].ammoPack = b.guns[i].defaultAmmoPack;
                        break;
                    }
                }
            }
        },
        {
            name: "nailshot",
            description: "the <strong>shotgun</strong> fires <strong>nails</strong><br><em>effective at a distance</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("shotgun")
            },
            requires: "shotgun",
            effect() {
                mod.isNailShot = true;
            },
            remove() {
                mod.isNailShot = false;
            }
        },
        {
            name: "automatic shotgun",
            description: "the <strong>shotgun</strong> fires <strong>66%</strong> faster<br><strong>recoil</strong> is greatly increased",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("shotgun")
            },
            requires: "shotgun",
            effect() {
                mod.isShotgunRecoil = true;
            },
            remove() {
                mod.isShotgunRecoil = false;
            }
        },
        {
            name: "super duper",
            description: "fire <strong>2</strong> additional <strong>super balls</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return mod.haveGunCheck("super balls") && !mod.oneSuperBall
            },
            requires: "super balls",
            effect() {
                mod.superBallNumber += 2
            },
            remove() {
                mod.superBallNumber = 4;
            }
        },
        {
            name: "super ball",
            description: "fire one <strong>large</strong> super <strong>ball</strong><br>that <strong>stuns</strong> mobs for <strong>3</strong> second",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("super balls") && mod.superBallNumber === 4
            },
            requires: "super balls",
            effect() {
                mod.oneSuperBall = true;
            },
            remove() {
                mod.oneSuperBall = false;
            }
        },
        {
            name: "super sized",
            description: `your <strong>super balls</strong> are <strong>22%</strong> larger<br>increases mass and physical <strong class='color-d'>damage</strong>`,
            count: 0,
            maxCount: 9,
            allowed() {
                return mod.haveGunCheck("super balls")
            },
            requires: "super balls",
            effect() {
                mod.bulletSize += 0.22
            },
            remove() {
                mod.bulletSize = 1;
            }
        },
        {
            name: "flechettes cartridges",
            description: "<strong>flechettes</strong> release <strong>three</strong> needles in each shot<br><strong class='color-g'>ammo</strong> cost are increases by <strong>3x</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("flechettes")
            },
            requires: "flechettes",
            effect() {
                mod.isFlechetteMultiShot = true;
                //cut current ammo by 1/3
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "flechettes") b.guns[i].ammo = Math.ceil(b.guns[i].ammo / 3);
                }
                //cut ammo packs by 1/3
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun
                    if (b.guns[i].name === "flechettes") b.guns[i].ammoPack = Math.ceil(b.guns[i].defaultAmmoPack / 3);
                }
                game.updateGunHUD();
            },
            remove() {
                mod.isFlechetteMultiShot = false;
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "flechettes") b.guns[i].ammo = Math.ceil(b.guns[i].ammo * 3);
                }
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "flechettes") b.guns[i].ammoPack = b.guns[i].defaultAmmoPack;
                }
                game.updateGunHUD();
            }
        },
        {
            name: "6s half-life",
            description: "<strong>flechette</strong> needles made of <strong class='color-p'>plutonium-238</strong><br>increase <strong class='color-d'>damage</strong> by <strong>100%</strong> over <strong>6</strong> seconds",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("flechettes") && !mod.isFastDot
            },
            requires: "flechettes",
            effect() {
                mod.isSlowDot = true;
            },
            remove() {
                mod.isSlowDot = false;
            }
        },
        {
            name: "1/2s half-life",
            description: "<strong>flechette</strong> needles made of <strong class='color-p'>lithium-8</strong><br>flechette <strong class='color-d'>damage</strong> occurs after <strong>1/2</strong> a second",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("flechettes") && !mod.isSlowDot
            },
            requires: "flechettes",
            effect() {
                mod.isFastDot = true;
            },
            remove() {
                mod.isFastDot = false;
            }
        },
        {
            name: "piercing needles",
            description: "<strong>needles</strong> penetrate <strong>mobs</strong> and <strong>blocks</strong><br>potentially hitting <strong>multiple</strong> targets",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("flechettes")
            },
            requires: "flechettes",
            effect() {
                mod.pierce = true;
            },
            remove() {
                mod.pierce = false;
            }
        },
        {
            name: "wave packet",
            description: "<strong>wave beam</strong> emits <strong>two</strong> oscillating particles<br>decrease wave <strong class='color-d'>damage</strong> by <strong>33%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("wave beam")
            },
            requires: "wave beam",
            effect() {
                mod.waveHelix = 2
            },
            remove() {
                mod.waveHelix = 1
            }
        },
        {
            name: "phase velocity",
            description: "the <strong>wave beam</strong> propagates faster in solids",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("wave beam") && !mod.isWaveReflect
            },
            requires: "wave beam",
            effect() {
                mod.waveSpeedMap = 3 //needs to be 3 to stop bound state require check
                mod.waveSpeedBody = 1.9
            },
            remove() {
                mod.waveSpeedMap = 0.08
                mod.waveSpeedBody = 0.25
            }
        },
        {
            name: "bound state",
            description: "<strong>wave beam</strong> bullets last <strong>5x</strong> longer<br>bullets are <strong>bound</strong> to a <strong>region</strong> around player",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("wave beam") && mod.waveSpeedMap !== 3
            },
            requires: "wave beam",
            effect() {
                mod.isWaveReflect = true
            },
            remove() {
                mod.isWaveReflect = false
            }
        },
        {
            name: "recursion",
            description: "after <strong>missiles</strong> <strong class='color-e'>explode</strong> they have a<br><strong>30%</strong> chance to launch a larger <strong>missile</strong>",
            maxCount: 6,
            count: 0,
            allowed() {
                return mod.haveGunCheck("missiles") || mod.isMissileField
            },
            requires: "missiles",
            effect() {
                mod.recursiveMissiles++
            },
            remove() {
                mod.recursiveMissiles = 0;
            }
        },
        {
            name: "MIRV",
            description: "launch <strong>3</strong> small <strong>missiles</strong> instead of <strong>1</strong> <br><strong>1.5x</strong> increase in <strong>delay</strong> after firing",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("missiles")
            },
            requires: "missiles",
            effect() {
                mod.is3Missiles = true;
            },
            remove() {
                mod.is3Missiles = false;
            }
        },
        {
            name: "optimized shell packing",
            description: "<strong>flak</strong> <strong class='color-g'>ammo</strong> drops contain <strong>3x</strong> more shells",
            maxCount: 3,
            count: 0,
            allowed() {
                return mod.haveGunCheck("flak")
            },
            requires: "flak",
            effect() {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "flak") b.guns[i].ammoPack = b.guns[i].defaultAmmoPack * (3 * (1 + this.count));
                }
            },
            remove() {
                for (i = 0, len = b.guns.length; i < len; i++) { //find which gun 
                    if (b.guns[i].name === "flak") b.guns[i].ammoPack = b.guns[i].defaultAmmoPack;
                }
            }
        },
        {
            name: "fragmentation grenade",
            description: "<strong>grenades</strong> are loaded with <strong>5</strong> nails<br>on detonation <strong>nails</strong> are ejected towards mobs",
            maxCount: 9,
            count: 0,
            allowed() {
                return mod.haveGunCheck("grenades")
            },
            requires: "grenades",
            effect() {
                mod.grenadeFragments += 5
            },
            remove() {
                mod.grenadeFragments = 0
            }
        },
        {
            name: "rocket-propelled grenade",
            description: "<strong>grenades</strong> rapidly <strong>accelerate</strong> forward<br>map <strong>collisions</strong> trigger an <strong class='color-e'>explosion</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("grenades")
            },
            requires: "grenades",
            effect() {
                mod.isRPG = true;
            },
            remove() {
                mod.isRPG = false;
            }
        },
        {
            name: "electromagnetic pulse",
            description: "<strong>vacuum bomb's </strong> <strong class='color-e'>explosion</strong> removes<br><strong>80%</strong> of <strong>shields</strong> and <strong>100%</strong> of <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("vacuum bomb")
            },
            requires: "vacuum bomb",
            effect() {
                mod.isVacuumShield = true;
            },
            remove() {
                mod.isVacuumShield = false;
            }
        },
        {
            name: "water shielding",
            description: "increase <strong>neutron bomb's</strong> range by <strong>20%</strong><br>player is <strong>immune</strong> to its harmful effects",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("neutron bomb")
            },
            requires: "neutron bomb",
            effect() {
                mod.isNeutronImmune = true
            },
            remove() {
                mod.isNeutronImmune = false
            }
        },
        {
            name: "inertial confinement",
            description: "<strong>neutron bomb's</strong> detonation <br><strong>stuns</strong> nearby mobs for <strong>1.5</strong> seconds",
            maxCount: 3,
            count: 0,
            allowed() {
                return mod.haveGunCheck("neutron bomb")
            },
            requires: "neutron bomb",
            effect() {
                mod.isNeutronStun += 90;
            },
            remove() {
                mod.isNeutronStun = 0;
            }
        },
        {
            name: "mine reclamation",
            description: "retrieve <strong class='color-g'>ammo</strong> from all undetonated <strong>mines</strong><br>and <strong>20%</strong> of <strong>mines</strong> after detonation",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("mine")
            },
            requires: "mine",
            effect() {
                mod.isMineAmmoBack = true;
            },
            remove() {
                mod.isMineAmmoBack = false;
            }
        },
        {
            name: "irradiated nails",
            description: "<strong>nails</strong> are made with a <strong class='color-p'>cobalt-60</strong> alloy<br><strong>85%</strong> <strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong> over <strong>2</strong> seconds",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.nailBotCount + mod.grenadeFragments + mod.nailsDeathMob / 2 + (mod.haveGunCheck("mine") + mod.isRailNails + mod.isNailShot + mod.haveGunCheck("nail gun")) * 2 > 1
            },
            requires: "nails",
            effect() {
                mod.isNailPoison = true;
            },
            remove() {
                mod.isNailPoison = false;
            }
        },
        {
            name: "railroad ties",
            description: "<strong>nails</strong> are <strong>70%</strong> <strong>larger</strong><br>increases physical <strong class='color-d'>damage</strong> by about <strong>25%</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.nailBotCount + mod.grenadeFragments + mod.nailsDeathMob / 2 + (mod.haveGunCheck("mine") + mod.isRailNails + mod.isNailShot + mod.haveGunCheck("nail gun")) * 2 > 1
            },
            requires: "nails",
            effect() {
                mod.biggerNails += 0.7
            },
            remove() {
                mod.biggerNails = 1
            }
        },
        {
            name: "mycelial fragmentation",
            description: "<strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> release an extra <strong class='color-p' style='letter-spacing: 2px;'>spore</strong><br> once a <strong>second</strong> during their <strong>growth</strong> phase",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("spores")
            },
            requires: "spores",
            effect() {
                mod.isSporeGrowth = true
            },
            remove() {
                mod.isSporeGrowth = false
            }
        },
        {
            name: "tinsellated flagella",
            description: "<strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> release <strong>2</strong> more <strong class='color-p' style='letter-spacing: 2px;'>spores</strong><br><strong class='color-p' style='letter-spacing: 2px;'>spores</strong> accelerate <strong>50% faster</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("spores") || mod.sporesOnDeath > 0 || mod.isSporeField
            },
            requires: "spores",
            effect() {
                mod.isFastSpores = true
            },
            remove() {
                mod.isFastSpores = false
            }
        },
        {
            name: "cryodesiccation",
            description: "<strong class='color-p' style='letter-spacing: 2px;'>sporangium</strong> release <strong>2</strong> more <strong class='color-p' style='letter-spacing: 2px;'>spores</strong><br><strong class='color-p' style='letter-spacing: 2px;'>spores</strong> <strong class='color-s'>freeze</strong> mobs for <strong>1</strong> second",
            // <br><strong class='color-p' style='letter-spacing: 2px;'>spores</strong> do <strong>1/3</strong> <strong class='color-d'>damage</strong>
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("spores") || mod.sporesOnDeath > 0 || mod.isSporeField
            },
            requires: "spores",
            effect() {
                mod.isSporeFreeze = true
            },
            remove() {
                mod.isSporeFreeze = false
            }
        },
        {
            name: "diplochory",
            description: "<strong class='color-p' style='letter-spacing: 2px;'>spores</strong> use the player for <strong>dispersal</strong><br>until they <strong>locate</strong> a viable host",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("spores") || mod.sporesOnDeath > 0 || mod.isSporeField
            },
            requires: "spores",
            effect() {
                mod.isSporeFollow = true
            },
            remove() {
                mod.isSporeFollow = false
            }
        },
        {
            name: "mutualism",
            description: "increase <strong class='color-p' style='letter-spacing: 2px;'>spore</strong> <strong class='color-d'>damage</strong> by <strong>100%</strong><br><strong class='color-p' style='letter-spacing: 2px;'>spores</strong> borrow <strong>1%</strong> <strong>health</strong> until they <strong>die</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return (mod.haveGunCheck("spores") || mod.sporesOnDeath > 0 || mod.isSporeField) && !mod.isEnergyHealth
            },
            requires: "spores",
            effect() {
                mod.isMutualism = true
            },
            remove() {
                mod.isMutualism = false
            }
        },
        {
            name: "brushless motor",
            description: "<strong>drones</strong> accelerate <strong>50%</strong> faster",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("drones") || (mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" && !(mod.isSporeField || mod.isMissileField || mod.isIceField))
            },
            requires: "drones",
            effect() {
                mod.isFastDrones = true
            },
            remove() {
                mod.isFastDrones = false
            }
        },
        {
            name: "harvester",
            description: "after a <strong>drone</strong> picks up a <strong>power up</strong>,<br>it's <strong>larger</strong>, <strong>faster</strong>, and infinitely <strong>durable</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return !mod.isArmorFromPowerUps && (mod.haveGunCheck("drones") || (mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" && !(mod.isSporeField || mod.isMissileField || mod.isIceField)))
            },
            requires: "drones",
            effect() {
                mod.isDroneGrab = true
            },
            remove() {
                mod.isDroneGrab = false
            }
        },
        {
            name: "superfluidity",
            description: "<strong class='color-s'>freeze</strong> effects apply to mobs near it's target",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("ice IX") || mod.isIceCrystals || mod.isSporeFreeze || mod.isIceField
            },
            requires: "a freeze effect",
            effect() {
                mod.isAoESlow = true
            },
            remove() {
                mod.isAoESlow = false
            }
        },
        {
            name: "heavy water",
            description: "<strong>ice IX</strong> is synthesized with an extra neutron<br>does <strong class='color-p'>radioactive</strong> <strong class='color-d'>damage</strong> over <strong>5</strong> seconds",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("ice IX") || (mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" && mod.isIceField)
            },
            requires: "ice IX",
            effect() {
                mod.isHeavyWater = true
            },
            remove() {
                mod.isHeavyWater = false;
            }
        },
        {
            name: "necrophoresis",
            description: "<strong>foam</strong> bullets grow and split into 3 <strong>copies</strong><br> when the mob they are stuck to <strong>dies</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("foam") || mod.foamBotCount > 1
            },
            requires: "foam",
            effect() {
                mod.isFoamGrowOnDeath = true
            },
            remove() {
                mod.isFoamGrowOnDeath = false;
            }
        },
        {
            name: "colloidal foam",
            description: "increase <strong>foam</strong> <strong class='color-d'>damage</strong> by <strong>200%</strong><br><strong>foam</strong> dissipates <strong>40%</strong> faster",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("foam") || mod.foamBotCount > 2
            },
            requires: "foam",
            effect() {
                mod.isFastFoam = true
            },
            remove() {
                mod.isFastFoam = false;
            }
        },
        // {
        //     name: "foam size",
        //     description: "increase <strong>foam</strong> <strong class='color-d'>damage</strong> by <strong>200%</strong><br><strong>foam</strong> dissipates <strong>50%</strong> faster",
        //     maxCount: 1,
        //     count: 0,
        //     allowed() {
        //         return mod.haveGunCheck("foam") || mod.foamBotCount > 2
        //     },
        //     requires: "foam",
        //     effect() {
        //         mod.isLargeFoam = true
        //     },
        //     remove() {
        //         mod.isLargeFoam = false;
        //     }
        // },
        {
            name: "frame-dragging",
            description: "<strong>slow time</strong> while charging the <strong>rail gun</strong><br>charging no longer drains <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return game.fpsCapDefault > 45 && mod.haveGunCheck("rail gun") && !mod.isSlowFPS && !mod.isCapacitor
            },
            requires: "rail gun and FPS above 45",
            effect() {
                mod.isRailTimeSlow = true;
            },
            remove() {
                mod.isRailTimeSlow = false;
                game.fpsCap = game.fpsCapDefault
                game.fpsInterval = 1000 / game.fpsCap;
            }
        },
        {
            name: "capacitor bank",
            description: "the <strong>rail gun</strong> no longer takes time to <strong>charge</strong><br><strong>rail gun</strong> rods are <strong>66%</strong> less massive",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("rail gun") && !mod.isRailTimeSlow
            },
            requires: "rail gun",
            effect() {
                mod.isCapacitor = true;
            },
            remove() {
                mod.isCapacitor = false;
            }
        },
        {
            name: "fragmenting projectiles",
            description: "<strong>rail gun</strong> rods fragment into <strong>nails</strong><br>after hitting mobs at high speeds",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("rail gun")
            },
            requires: "rail gun",
            effect() {
                mod.isRailNails = true;
            },
            remove() {
                mod.isRailNails = false;
            }
        },
        {
            name: "laser diodes",
            description: "<strong>lasers</strong> drain <strong>37%</strong> less <strong class='color-f'>energy</strong><br><em>effects laser gun, pulse gun, and laser-bot</em>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("pulse") || mod.haveGunCheck("laser") || mod.laserBotCount > 1
            },
            requires: "laser",
            effect() {
                mod.isLaserDiode = 0.63; //100%-37%
            },
            remove() {
                mod.isLaserDiode = 1;
            }
        },
        {
            name: "specular reflection",
            description: "<strong>laser</strong> beams gain <strong>1</strong> reflection<br><strong>50%</strong> laser <strong class='color-d'>damage</strong> and <strong class='color-f'>energy</strong> drain",
            maxCount: 9,
            count: 0,
            allowed() {
                return mod.haveGunCheck("laser")
            },
            requires: "laser",
            effect() {
                mod.laserReflections++;
                mod.laserDamage += 0.06; //base is 0.12
                mod.laserFieldDrain += 0.0008 //base is 0.002
            },
            remove() {
                mod.laserReflections = 2;
                mod.laserDamage = 0.12;
                mod.laserFieldDrain = 0.0016;
            }
        },
        {
            name: "waste heat recovery",
            description: "<strong>laser</strong> <strong class='color-d'>damage</strong> grows by <strong>400%</strong> as you fire<br>but you periodically <strong>eject</strong> your <strong class='color-h'>health</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("laser")
            },
            requires: "laser",
            effect() {
                mod.isLaserHealth = true;
            },
            remove() {
                mod.isLaserHealth = false
            }
        },
        {
            name: "shock wave",
            description: "mobs caught in <strong>pulse's</strong> explosion are <strong>stunned</strong><br>for up to <strong>2 seconds</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("pulse")
            },
            requires: "pulse",
            effect() {
                mod.isPulseStun = true;
            },
            remove() {
                mod.isPulseStun = false;
            }
        },

        {
            name: "neocognitron",
            description: "<strong>pulse</strong> automatically <strong>aims</strong> at a nearby mob<br><strong>50%</strong> decreased <strong>delay</strong> after firing",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.haveGunCheck("pulse")
            },
            requires: "pulse",
            effect() {
                mod.isPulseAim = true;
            },
            remove() {
                mod.isPulseAim = false;
            }
        },
        //************************************************** 
        //************************************************** field
        //************************************************** mods
        //************************************************** 
        {
            name: "flux pinning",
            description: "blocking with <strong>perfect diamagnetism</strong><br><strong>stuns</strong> mobs for <strong>+1</strong> second",
            maxCount: 9,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "perfect diamagnetism"
            },
            requires: "perfect diamagnetism",
            effect() {
                mod.isStunField += 60;
            },
            remove() {
                mod.isStunField = 0;
            }
        },
        {
            name: "timelike world line",
            description: "<strong>time dilation</strong> doubles your relative time <strong>rate</strong><br>and makes you <strong>immune</strong> to <strong class='color-harm'>harm</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "time dilation field"
            },
            requires: "time dilation field",
            effect() {
                mod.isTimeSkip = true;
                b.setFireCD();
            },
            remove() {
                mod.isTimeSkip = false;
                b.setFireCD();
            }
        },
        {
            name: "Lorentz transformation",
            description: "permanently increase your relative time rate<br><strong>move</strong>, <strong>jump</strong>, and <strong>shoot</strong> <strong>33%</strong> faster",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "time dilation field"
            },
            requires: "time dilation field",
            effect() {
                mod.fastTime = 1.33;
                mod.fastTimeJump = 1.09;
                mech.setMovement();
                b.setFireCD();
            },
            remove() {
                mod.fastTime = 1;
                mod.fastTimeJump = 1;
                mech.setMovement();
                b.setFireCD();
            }
        },
        {
            name: "plasma jet",
            description: "increase <strong>plasma torch's</strong> range by <strong>27%</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "plasma torch"
            },
            requires: "plasma torch",
            effect() {
                mod.isPlasmaRange += 0.27;
            },
            remove() {
                mod.isPlasmaRange = 1;
            }
        },
        {
            name: "plasma-bot",
            description: "a bot uses <strong class='color-f'>energy</strong> to emit short range <strong>plasma</strong><br>that <strong class='color-d'>damages</strong> and <strong>pushes</strong> mobs",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "plasma torch"
            },
            requires: "plasma torch",
            effect() {
                mod.plasmaBotCount++;
                b.plasmaBot();
            },
            remove() {
                mod.plasmaBotCount = 0;
            }
        },
        {
            name: "degenerate matter",
            description: "reduce <strong class='color-harm'>harm</strong> by <strong>40%</strong><br>while <strong>negative mass field</strong> is active",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "negative mass field"
            },
            requires: "negative mass field",
            effect() {
                mod.isHarmReduce = true
            },
            remove() {
                mod.isHarmReduce = false;
                // if (mech.fieldUpgrades[mech.fieldMode].name === "negative mass field") mech.setField("negative mass field") //reset harm reduction
            }
        },
        {
            name: "annihilation",
            description: "after <strong>touching</strong> mobs, they are <strong>annihilated</strong><br>drains <strong>33%</strong> of base <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "negative mass field"
            },
            requires: "negative mass field",
            effect() {
                mod.isAnnihilation = true
            },
            remove() {
                mod.isAnnihilation = false;
            }
        },
        {
            name: "negative temperature",
            description: "<strong>negative mass field</strong> uses <strong class='color-f'>energy</strong><br>to <strong class='color-s'>freeze</strong> mobs caught in it's effect",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "negative mass field"
            },
            requires: "negative mass field",
            effect() {
                mod.isFreezeMobs = true;
            },
            remove() {
                mod.isFreezeMobs = false;
            }
        },
        {
            name: "bremsstrahlung radiation",
            description: "<strong>blocking</strong> with <strong>standing wave harmonics</strong><br> does <strong class='color-d'>damage</strong> to mobs",
            maxCount: 9,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "standing wave harmonics"
            },
            requires: "standing wave harmonics",
            effect() {
                mod.blockDmg += 0.66 //if you change this value also update the for loop in the electricity graphics in mech.pushMass
            },
            remove() {
                mod.blockDmg = 0;
            }
        },
        {
            name: "frequency resonance",
            description: "<strong>standing wave harmonics</strong> shield is retuned<br>increase <strong>size</strong> and <strong>blocking</strong> efficiency by <strong>40%</strong>",
            maxCount: 9,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "standing wave harmonics"
            },
            requires: "standing wave harmonics",
            effect() {
                mech.fieldRange += 175 * 0.17
                mech.fieldShieldingScale *= 0.6
            },
            remove() {
                mech.fieldRange = 175;
                mech.fieldShieldingScale = 1;
            }
        },
        {
            name: "pair production",
            description: "<strong>power ups</strong> overfill your <strong class='color-f'>energy</strong><br>temporarily gain <strong>3x</strong> your maximum <strong class='color-f'>energy</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing"
            },
            requires: "nano-scale manufacturing",
            effect: () => {
                mod.isMassEnergy = true // used in mech.grabPowerUp
                mech.energy = mech.maxEnergy * 3
            },
            remove() {
                mod.isMassEnergy = false;
            }
        },
        {
            name: "mycelium manufacturing",
            description: "<strong>nano-scale manufacturing</strong> is repurposed<br>excess <strong class='color-f'>energy</strong> used to grow <strong class='color-p' style='letter-spacing: 2px;'>spores</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" && !(mod.isMissileField || mod.isIceField || mod.isFastDrones)
            },
            requires: "nano-scale manufacturing",
            effect() {
                mod.isSporeField = true;
            },
            remove() {
                mod.isSporeField = false;
            }
        },
        {
            name: "missile manufacturing",
            description: "<strong>nano-scale manufacturing</strong> is repurposed<br>excess <strong class='color-f'>energy</strong> used to construct <strong>missiles</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" && !(mod.isSporeField || mod.isIceField || mod.isFastDrones)
            },
            requires: "nano-scale manufacturing",
            effect() {
                mod.isMissileField = true;
            },
            remove() {
                mod.isMissileField = false;
            }
        },
        {
            name: "ice IX manufacturing",
            description: "<strong>nano-scale manufacturing</strong> is repurposed<br>excess <strong class='color-f'>energy</strong> used to synthesize <strong>ice IX</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "nano-scale manufacturing" && !(mod.isSporeField || mod.isMissileField || mod.isFastDrones)
            },
            requires: "nano-scale manufacturing",
            effect() {
                mod.isIceField = true;
            },
            remove() {
                mod.isIceField = false;
            }
        },
        {
            name: "superposition",
            description: "mobs that <strong>touch</strong> the <strong>phased</strong> player<br> are <strong>stunned</strong> for <strong>5</strong> seconds",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "phase decoherence field"
            },
            requires: "phase decoherence field",
            effect() {
                mod.superposition = true;
            },
            remove() {
                mod.superposition = false;
            }
        },
        {
            name: "fracture analysis",
            description: "bullet impacts do <strong>500%</strong> <strong class='color-d'>damage</strong><br>to mobs that are <strong>unaware</strong> of you or <strong>stunned</strong>",
            maxCount: 1,
            count: 0,
            allowed() {
                return mod.isStunField || mech.fieldUpgrades[mech.fieldMode].name === "phase decoherence field"
            },
            requires: "phase decoherence field or flux pinning",
            effect() {
                mod.isCrit = true;
            },
            remove() {
                mod.isCrit = false;
            }
        },
        {
            name: "Bose Einstein condensate",
            description: "<strong>mobs</strong> in superposition with the <strong>pilot wave</strong><br>are <strong class='color-s'>frozen</strong> for <strong>2</strong> seconds",
            maxCount: 1,
            count: 0,
            allowed() {
                return mech.fieldUpgrades[mech.fieldMode].name === "pilot wave"
            },
            requires: "pilot wave",
            effect() {
                mod.isPilotFreeze = true
            },
            remove() {
                mod.isPilotFreeze = false
            }
        },
        {
            name: "heals",
            description: "spawn <strong>6</strong> <strong class='color-h'>heal</strong> power ups",
            maxCount: 9,
            count: 0,
            isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                for (let i = 0; i < 6; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "heal");
                }
                this.count--
            },
            remove() {}
        },
        {
            name: "ammo",
            description: "spawn <strong>6</strong> <strong class='color-g'>ammo</strong> power ups",
            maxCount: 9,
            count: 0,
            isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return true
            },
            requires: "",
            effect() {
                for (let i = 0; i < 6; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "ammo");
                }
                this.count--
            },
            remove() {}
        },

        {
            name: "rerolls",
            description: "spawn <strong>5</strong> <strong class='color-r'>reroll</strong> power ups",
            maxCount: 9,
            count: 0,
            isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return !mod.isSuperDeterminism
            },
            requires: "not superdeterminism",
            effect() {
                for (let i = 0; i < 5; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "reroll");
                }
                this.count--
            },
            remove() {}
        },
        {
            name: "gun",
            description: "spawn a <strong class='color-g'>gun</strong> power up",
            maxCount: 9,
            count: 0,
            isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return !mod.isSuperDeterminism
            },
            requires: "not superdeterminism",
            effect() {
                powerUps.spawn(mech.pos.x, mech.pos.y, "gun");
                this.count--
            },
            remove() {}
        },
        {
            name: "field",
            description: "spawn a <strong class='color-f'>field</strong> power up",
            maxCount: 9,
            count: 0,
            isNonRefundable: true,
            isCustomHide: true,
            allowed() {
                return !mod.isSuperDeterminism
            },
            requires: "not superdeterminism",
            effect() {
                powerUps.spawn(mech.pos.x, mech.pos.y, "field");
                this.count--
            },
            remove() {}
        },
    ],
    //variables use for gun mod upgrades
    fireRate: null,
    bulletSize: null,
    energySiphon: null,
    healthDrain: null,
    isCrouchAmmo: null,
    isBulletsLastLonger: null,
    isImmortal: null,
    sporesOnDeath: null,
    isImmuneExplosion: null,
    isExplodeMob: null,
    isDroneOnDamage: null,
    isAcidDmg: null,
    isAnnihilation: null,
    largerHeals: null,
    squirrelFx: null,
    isCrit: null,
    isLowHealthDmg: null,
    isFarAwayDmg: null,
    isEntanglement: null,
    isMassEnergy: null,
    isExtraChoice: null,
    laserBotCount: null,
    nailBotCount: null,
    foamBotCount: null,
    boomBotCount: null,
    plasmaBotCount: null,
    collisionImmuneCycles: null,
    blockDmg: null,
    isPiezo: null,
    isFastDrones: null,
    isFastSpores: null,
    superBallNumber: null,
    oneSuperBall: null,
    laserReflections: null,
    laserDamage: null,
    laserFieldDrain: null,
    isAmmoFromHealth: null,
    mobSpawnWithHealth: null,
    isEnergyRecovery: null,
    isHealthRecovery: null,
    isEnergyLoss: null,
    isDeathAvoid: null,
    waveSpeedMap: null,
    waveSpeedBody: null,
    isSporeField: null,
    isMissileField: null,
    isIceField: null,
    isFlechetteMultiShot: null,
    isMineAmmoBack: null,
    isPlasmaRange: null,
    isRailNails: null,
    isFreezeMobs: null,
    recursiveMissiles: null,
    isIceCrystals: null,
    throwChargeRate: null,
    isBlockStun: null,
    isStunField: null,
    isHarmDamage: null,
    isHeavyWater: null,
    energyRegen: null,
    isVacuumShield: null,
    renormalization: null,
    grenadeFragments: null,
    isEnergyDamage: null,
    isBotSpawner: null,
    waveHelix: null,
    isSporeFollow: null,
    isNailPoison: null,
    isEnergyHealth: null,
    isPulseStun: null,
    isPilotFreeze: null,
    isRest: null,
    isRPG: null,
    is3Missiles: null,
    isDeterminism: null,
    isSuperDeterminism: null,
    isHarmReduce: null,
    nailsDeathMob: null,
    isSlowFPS: null,
    isNeutronStun: null,
    manyWorlds: null,
    isDamageFromBulletCount: null,
    isLaserDiode: null,
    isNailShot: null,
    slowFire: null,
    fastTime: null,
    squirrelJump: null,
    fastTimeJump: null,
    isFastDot: null,
    isArmorFromPowerUps: null,
    isAmmoForGun: null,
    isRapidPulse: null,
    isPulseAim: null,
    isSporeFreeze: null,
    isShotgunRecoil: null,
    isHealLowHealth: null,
    isAoESlow: null,
    isHarmArmor: null,
    isTurret: null,
    isRerollDamage: null,
    isHarmFreeze: null,
    isBotArmor: null,
    isRerollHaste: null,
    rerollHaste: null,
    isMineDrop: null,
    isRerollBots: null,
    isRailTimeSlow: null,
    isNailBotUpgrade: null,
    isFoamBotUpgrade: null,
    isLaserBotUpgrade: null,
    isBoomBotUpgrade: null,
    isDroneGrab: null,
    isOneGun: null,
    isDamageForGuns: null,
    isGunCycle: null,
    isFastFoam: null,
    isSporeGrowth: null,
    isBayesian: null,
    nailGun: null,
    nailInstantFireRate: null,
    isCapacitor: null,
    isEnergyNoAmmo: null,
    isFreezeHarmImmune: null,
    isSmallExplosion: null,
    isExplosionHarm: null,
    isLaserHealth: null
}