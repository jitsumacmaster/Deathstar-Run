const MovingObject = require("../moving_object");
const Bullet = require("../weapons/bullet");
const GreenLaser = require("../weapons/green_laser");
const PhotonTorpedo = require('../weapons/photon_torpedo')
const SmallExplosion = require('../fx/small_explosion')

const Util = require("../util");
// const ShipSprite = require('./sprites/spritesheets/xwing.png')

const CONTROLS = {
  UP: 38,
  DOWN: 40,
  LEFT: 37,
  RIGHT: 39,
  SHIFT: 16,
  SPACE: 32,
  W: 87,
  A: 65,
  S: 83,
  D: 68,
  M: 77,
}

const COOLDOWN = 8;
const LONGCOOLDOWN = 16;

const SPECIALCOOLDOWN = 110;
// const SPECIALCOOLDOWN = 100;

class Ship extends MovingObject {
  constructor(options) {
    options.radius = Ship.RADIUS;
    options.vel = options.vel || [0, 0];
    options.color = 'red'
    super(options);
    this.isTrappable = true;

    this.isWrappable = false;
    this.movement = 1;
    this.focusMovement = 1;
    this.keyDown = {
      UP: false,
      DOWN: false,
      LEFT: false,
      RIGHT: false,
      SHIFT: false,
      SPACE: false,
      SPECIAL: false,
    }
    this.shipImage = new Image();
    this.shipImage.src = "../src/sprites/spritesheets/xwing.png";
    // this.fireBullet = this.fireBullet.bind(this);
    // this.fireTorpedo = this.fireTorpedo.bind(this);
    // this.update = this.update.bind(this);
    this.overheated = 0
    this.special_cooldown = 0

    this.burst = false
    this.trackMovements()
  }

  
  trackMovements() {
    // if(true) { 
      document.addEventListener('keydown', (e) => {
        // console.log(e.keyCode)
        switch (e.keyCode) {
          case CONTROLS.UP: 
            this.keyDown.UP = true;
            break;
          case CONTROLS.DOWN: 
            this.keyDown.DOWN = true;
            break;
          case CONTROLS.LEFT:
            this.keyDown.LEFT = true;
            break;
          case CONTROLS.RIGHT:
            this.keyDown.RIGHT = true;
            break;

          case CONTROLS.W: 
            this.keyDown.UP = true;
            break;
          case CONTROLS.S: 
            this.keyDown.DOWN = true;
            break;
          case CONTROLS.A:
            this.keyDown.LEFT = true;
            break;
          case CONTROLS.D:
            this.keyDown.RIGHT = true;
            break;

          case CONTROLS.SHIFT:
            this.keyDown.SHIFT = true;
            break;

          case CONTROLS.SPACE:
            this.keyDown.SPACE = true;
            break;

          case CONTROLS.M:
            this.keyDown.SPECIAL = true;
            break;

        }
      });

      document.addEventListener('keyup', (e) => {
        switch (e.keyCode) {
          // case CONTROLS.UP:
          case CONTROLS.UP || CONTROLS.W: 
            this.keyDown.UP = false;
            break;
          case CONTROLS.DOWN:
            this.keyDown.DOWN = false;
            break;
          case CONTROLS.LEFT:
            this.keyDown.LEFT = false;
            break;
          case CONTROLS.RIGHT:
            this.keyDown.RIGHT = false;
            break;

          case CONTROLS.W: 
            this.keyDown.UP = false;
            break;
          case CONTROLS.S: 
            this.keyDown.DOWN = false;
            break;
          case CONTROLS.A:
            this.keyDown.LEFT = false;
            break;
          case CONTROLS.D:
            this.keyDown.RIGHT = false;
            break;

          case CONTROLS.SHIFT:
            this.keyDown.SHIFT = false;
            break;

          case CONTROLS.SPACE:
            this.keyDown.SPACE = false;
            break;
          case CONTROLS.M:
            this.keyDown.SPECIAL = false;
            break;

        }
      })
    // }
  }

  update(delta) {
    // console.log(this.keyDown.SPECIAL)
    var moveDelta = delta * 0.6
    var overheatDelta = delta * 0.15
    var specialCooldownDelta = delta * 0.15
    // console.log(delta * 0.15)
    if (this.keyDown.UP) this.pos[1] -= (this.keyDown.SHIFT ? this.focusMovement : moveDelta);
    if (this.keyDown.DOWN) this.pos[1] += (this.keyDown.SHIFT ? this.focusMovement : moveDelta);
    if (this.keyDown.LEFT) this.pos[0] -= (this.keyDown.SHIFT ? this.focusMovement : moveDelta);
    if (this.keyDown.RIGHT) this.pos[0] += (this.keyDown.SHIFT ? this.focusMovement : moveDelta);
    // if (this.keyDown.UP) this.pos[1] -= (this.keyDown.SHIFT ? this.focusMovement : this.movement);
    // if (this.keyDown.DOWN) this.pos[1] += (this.keyDown.SHIFT ? this.focusMovement : this.movement);
    // if (this.keyDown.LEFT) this.pos[0] -= (this.keyDown.SHIFT ? this.focusMovement : this.movement);
    // if (this.keyDown.RIGHT) this.pos[0] += (this.keyDown.SHIFT ? this.focusMovement : this.movement);

    if (this.keyDown.SPECIAL) (this.special_cooldown <= 0 ? this.fireTorpedo() : null );
    if (this.keyDown.SPACE) (this.overheated <= 0 ? this.fireBullet() : null );

    this.overheated -= overheatDelta
    this.special_cooldown -= specialCooldownDelta
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    let shipImage = new Image();
    shipImage.src = "../src/sprites/spritesheets/xwing.png";
    ctx.drawImage(this.shipImage,this.pos[0]-30 ,this.pos[1]-30 , 60, 60);
  }

  fireTorpedo() {
    const vel = [0,-10]

    const torpedo = new PhotonTorpedo({
      pos: [this.pos[0], this.pos[1] - 28],
      vel: vel,
      color: this.color,
      game: this.game
    });

    this.game.add(torpedo);
    this.special_cooldown = SPECIALCOOLDOWN
  }


  fireBullet() {
    const norm = Util.norm(this.vel);
    const bulletVel = [0,-20]


    const right = new Bullet({
      pos: [this.pos[0] + 14, this.pos[1] - 28],
      vel: bulletVel,
      color: this.color,
      game: this.game
    });
    const left = new Bullet({
      pos: [this.pos[0] - 13, this.pos[1] - 28],
      vel: bulletVel,
      color: this.color,
      game: this.game
    });
    this.game.add(right);
    this.game.add(left);
    this.overheated = COOLDOWN
    if (this.burst) {
      this.overheated += LONGCOOLDOWN;
      this.burst = false
    } else {
      this.burst = true
    }
  }

  collideWith(otherObject) {

    if (otherObject instanceof GreenLaser) {
      const boom = new SmallExplosion({
        pos: [otherObject.pos[0], otherObject.pos[1]],
        vel: [0,0],
        color: 'yellow',
        game: this.game,
      });
      this.game.add(boom);
      // this.health--
      // if (this.health <= 0) {
      //   this.remove();
      // }
      otherObject.remove();
      return true;
    }

    return false;
  }

  relocate() {
    this.pos = this.game.startingPosition();
    // this.pos = this.game.randomPosition();
    this.vel = [0, 0];
  }
}

Ship.RADIUS = 15;
module.exports = Ship;
