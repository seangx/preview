require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = "function" == typeof require && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof require && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  DragonBonesCtrl: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "87671OpZoVAOJrmP9+gJ6EC", "DragonBonesCtrl");
    "use strict";
    if (!cc.runtime) {
      var NORMAL_ANIMATION_GROUP = "normal";
      var AIM_ANIMATION_GROUP = "aim";
      var ATTACK_ANIMATION_GROUP = "attack";
      var JUMP_SPEED = -20;
      var NORMALIZE_MOVE_SPEED = 3.6;
      var MAX_MOVE_SPEED_FRONT = 1.4 * NORMALIZE_MOVE_SPEED;
      var MAX_MOVE_SPEED_BACK = 1 * NORMALIZE_MOVE_SPEED;
      var WEAPON_R_LIST = [ "weapon_1502b_r", "weapon_1005", "weapon_1005b", "weapon_1005c", "weapon_1005d", "weapon_1005e" ];
      var WEAPON_L_LIST = [ "weapon_1502b_l", "weapon_1005", "weapon_1005b", "weapon_1005c", "weapon_1005d" ];
      var GROUND = -200;
      var G = -.6;
      cc.Class({
        extends: cc.Component,
        editor: {
          requireComponent: dragonBones.ArmatureDisplay
        },
        properties: {
          touchHandler: {
            default: null,
            type: cc.Node
          },
          upButton: {
            default: null,
            type: cc.Node
          },
          downButton: {
            default: null,
            type: cc.Node
          },
          leftButton: {
            default: null,
            type: cc.Node
          },
          rightButton: {
            default: null,
            type: cc.Node
          },
          _bullets: [],
          _left: false,
          _right: false,
          _isJumpingA: false,
          _isJumpingB: false,
          _isSquating: false,
          _isAttackingA: false,
          _isAttackingB: false,
          _weaponRIndex: 0,
          _weaponLIndex: 0,
          _faceDir: 1,
          _aimDir: 0,
          _moveDir: 0,
          _aimRadian: 0,
          _speedX: 0,
          _speedY: 0,
          _armature: null,
          _armatureDisplay: null,
          _weaponR: null,
          _weaponL: null,
          _aimState: null,
          _walkState: null,
          _attackState: null,
          _target: cc.p(0, 0)
        },
        onLoad: function onLoad() {
          var _this = this;
          this._armatureDisplay = this.getComponent(dragonBones.ArmatureDisplay);
          this._armature = this._armatureDisplay.armature();
          this._armatureDisplay.addEventListener(dragonBones.EventObject.FADE_IN_COMPLETE, this._animationEventHandler, this);
          this._armatureDisplay.addEventListener(dragonBones.EventObject.FADE_OUT_COMPLETE, this._animationEventHandler, this);
          this._armature.getSlot("effects_1").displayController = NORMAL_ANIMATION_GROUP;
          this._armature.getSlot("effects_2").displayController = NORMAL_ANIMATION_GROUP;
          this._weaponR = this._armature.getSlot("weapon_r").childArmature;
          this._weaponL = this._armature.getSlot("weapon_l").childArmature;
          this._weaponR.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
          this._weaponL.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
          this._updateAnimation();
          dragonBones.WorldClock.clock.add(this._armature);
          if (this.touchHandler) {
            this.touchHandler.on(cc.Node.EventType.TOUCH_START, function(event) {
              _this.attack(true);
            }, this);
            this.touchHandler.on(cc.Node.EventType.TOUCH_END, function(event) {
              _this.attack(false);
            }, this);
            this.touchHandler.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
              var touches = event.getTouches();
              var touchLoc = touches[0].getLocation();
              _this.aim(touchLoc.x, touchLoc.y);
            }, this);
          }
          this.upButton && this.upButton.on(cc.Node.EventType.TOUCH_START, function(event) {
            _this.jump();
          }, this);
          if (this.downButton) {
            this.downButton.on(cc.Node.EventType.TOUCH_START, function(event) {
              _this.squat(true);
            }, this);
            this.downButton.on(cc.Node.EventType.TOUCH_END, function(event) {
              _this.squat(false);
            }, this);
            this.downButton.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
              _this.squat(false);
            }, this);
          }
          if (this.leftButton) {
            this.leftButton.on(cc.Node.EventType.TOUCH_START, function(event) {
              _this._left = true;
              _this._updateMove(-1);
            }, this);
            this.leftButton.on(cc.Node.EventType.TOUCH_END, function(event) {
              _this._left = false;
              _this._updateMove(-1);
            }, this);
            this.leftButton.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
              _this._left = false;
              _this._updateMove(-1);
            }, this);
          }
          if (this.rightButton) {
            this.rightButton.on(cc.Node.EventType.TOUCH_START, function(event) {
              _this._right = true;
              _this._updateMove(1);
            }, this);
            this.rightButton.on(cc.Node.EventType.TOUCH_END, function(event) {
              _this._right = false;
              _this._updateMove(1);
            }, this);
            this.rightButton.on(cc.Node.EventType.TOUCH_CANCEL, function(event) {
              _this._right = false;
              _this._updateMove(1);
            }, this);
          }
          cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
              _this._keyHandler(keyCode, true);
            },
            onKeyReleased: function onKeyReleased(keyCode, event) {
              _this._keyHandler(keyCode, false);
            }
          }, this.node);
        },
        _keyHandler: function _keyHandler(keyCode, isDown) {
          switch (keyCode) {
           case cc.KEY.a:
           case cc.KEY.left:
            this._left = isDown;
            this._updateMove(-1);
            break;

           case cc.KEY.d:
           case cc.KEY.right:
            this._right = isDown;
            this._updateMove(1);
            break;

           case cc.KEY.w:
           case cc.KEY.up:
            isDown && this.jump();
            break;

           case cc.KEY.s:
           case cc.KEY.down:
            this.squat(isDown);
            break;

           case cc.KEY.q:
            isDown && this.switchWeaponR();
            break;

           case cc.KEY.e:
            isDown && this.switchWeaponL();
            break;

           case cc.KEY.space:
            if (isDown) {
              this.switchWeaponR();
              this.switchWeaponL();
            }
            break;

           default:
            return;
          }
        },
        _updateMove: function _updateMove(dir) {
          this._left && this._right ? this.move(dir) : this._left ? this.move(-1) : this._right ? this.move(1) : this.move(0);
        },
        move: function move(dir) {
          if (this._moveDir === dir) return;
          this._moveDir = dir;
          this._updateAnimation();
        },
        jump: function jump() {
          if (this._isJumpingA) return;
          this._isJumpingA = true;
          this._armature.animation.fadeIn("jump_1", -1, -1, 0, NORMAL_ANIMATION_GROUP);
          this._walkState = null;
        },
        squat: function squat(isSquating) {
          if (this._isSquating === isSquating) return;
          this._isSquating = isSquating;
          this._updateAnimation();
        },
        attack: function attack(isAttacking) {
          if (this._isAttackingA == isAttacking) return;
          this._isAttackingA = isAttacking;
        },
        switchWeaponL: function switchWeaponL() {
          this._weaponL.removeEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
          this._weaponLIndex = (this._weaponLIndex + 1) % WEAPON_L_LIST.length;
          var newWeaponName = WEAPON_L_LIST[this._weaponLIndex];
          this._weaponL = this._armatureDisplay.buildArmature(newWeaponName);
          this._armature.getSlot("weapon_l").childArmature = this._weaponL;
          this._weaponL.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
        },
        switchWeaponR: function switchWeaponR() {
          this._weaponR.removeEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
          this._weaponRIndex = (this._weaponRIndex + 1) % WEAPON_R_LIST.length;
          var newWeaponName = WEAPON_R_LIST[this._weaponRIndex];
          this._weaponR = this._armatureDisplay.buildArmature(newWeaponName);
          this._armature.getSlot("weapon_r").childArmature = this._weaponR;
          this._weaponR.addEventListener(dragonBones.EventObject.FRAME_EVENT, this._frameEventHandler, this);
        },
        aim: function aim(x, y) {
          this._aimDir = 100;
          this._target = this.node.parent.convertToNodeSpaceAR(cc.p(x, y));
        },
        update: function update(dt) {
          this._updatePosition();
          this._updateAim();
          this._updateAttack();
          this._enterFrameHandler(dt);
        },
        onDisable: function onDisable() {
          for (var i = this._bullets.length - 1; i >= 0; i--) {
            var bullet = this._bullets[i];
            bullet.doClean();
          }
          this._bullets = [];
          this._armature && dragonBones.WorldClock.clock.remove(this._armature);
        },
        addBullet: function addBullet(bullet) {
          this._bullets.push(bullet);
        },
        _enterFrameHandler: function _enterFrameHandler(dt) {
          for (var i = this._bullets.length - 1; i >= 0; i--) {
            var bullet = this._bullets[i];
            bullet.update() && this._bullets.splice(i, 1);
          }
          dragonBones.WorldClock.clock.advanceTime(dt);
        },
        _animationEventHandler: function _animationEventHandler(event) {
          if (event.type === dragonBones.EventObject.FADE_IN_COMPLETE) if ("jump_1" === event.detail.animationState.name) {
            this._isJumpingB = true;
            this._speedY = -JUMP_SPEED;
            this._armature.animation.fadeIn("jump_2", -1, -1, 0, NORMAL_ANIMATION_GROUP);
          } else "jump_4" === event.detail.animationState.name && this._updateAnimation(); else if (event.type === dragonBones.EventObject.FADE_OUT_COMPLETE && "attack_01" === event.detail.animationState.name) {
            this._isAttackingB = false;
            this._attackState = null;
          }
        },
        _frameEventHandler: function _frameEventHandler(event) {
          if ("onFire" === event.detail.name) {
            var firePointBone = event.detail.armature.getBone("firePoint");
            var localPoint = cc.p(firePointBone.global.x, -firePointBone.global.y);
            var display = event.detail.armature.display;
            var globalPoint = display.convertToWorldSpace(localPoint);
            this._fire(globalPoint);
          }
        },
        _fire: function _fire(firePoint) {},
        _updateAnimation: function _updateAnimation() {
          if (this._isJumpingA) return;
          if (this._isSquating) {
            this._speedX = 0;
            this._armature.animation.fadeIn("squat", -1, -1, 0, NORMAL_ANIMATION_GROUP);
            this._walkState = null;
            return;
          }
          if (0 === this._moveDir) {
            this._speedX = 0;
            this._armature.animation.fadeIn("idle", -1, -1, 0, NORMAL_ANIMATION_GROUP);
            this._walkState = null;
          } else {
            this._walkState || (this._walkState = this._armature.animation.fadeIn("walk", -1, -1, 0, NORMAL_ANIMATION_GROUP));
            this._moveDir * this._faceDir > 0 ? this._walkState.timeScale = MAX_MOVE_SPEED_FRONT / NORMALIZE_MOVE_SPEED : this._walkState.timeScale = -MAX_MOVE_SPEED_BACK / NORMALIZE_MOVE_SPEED;
            this._moveDir * this._faceDir > 0 ? this._speedX = MAX_MOVE_SPEED_FRONT * this._faceDir : this._speedX = -MAX_MOVE_SPEED_BACK * this._faceDir;
          }
        },
        _updatePosition: function _updatePosition() {
          if (0 !== this._speedX) {
            this.node.x += this._speedX;
            var minX = -cc.visibleRect.width / 2;
            var maxX = cc.visibleRect.width / 2;
            this.node.x < minX ? this.node.x = minX : this.node.x > maxX && (this.node.x = maxX);
          }
          if (0 != this._speedY) {
            this._speedY > 5 && this._speedY + G <= 5 && this._armature.animation.fadeIn("jump_3", -1, -1, 0, NORMAL_ANIMATION_GROUP);
            this._speedY += G;
            this.node.y += this._speedY;
            if (this.node.y < GROUND) {
              this.node.y = GROUND;
              this._isJumpingA = false;
              this._isJumpingB = false;
              this._speedY = 0;
              this._speedX = 0;
              this._armature.animation.fadeIn("jump_4", -1, -1, 0, NORMAL_ANIMATION_GROUP);
              (this._isSquating || this._moveDir) && this._updateAnimation();
            }
          }
        },
        _updateAim: function _updateAim() {
          this._faceDir = this._target.x > this.node.x ? 1 : -1;
          if (this.node.scaleX * this._faceDir < 0) {
            this.node.scaleX *= -1;
            this._moveDir && this._updateAnimation();
          }
          var aimOffsetY = this._armature.getBone("chest").global.y * this.node.scaleY;
          if (this._faceDir > 0) this._aimRadian = Math.atan2(-(this._target.y - this.node.y + aimOffsetY), this._target.x - this.node.x); else {
            this._aimRadian = Math.PI - Math.atan2(-(this._target.y - this.node.y + aimOffsetY), this._target.x - this.node.x);
            this._aimRadian > Math.PI && (this._aimRadian -= 2 * Math.PI);
          }
          var aimDir = 0;
          aimDir = this._aimRadian > 0 ? -1 : 1;
          if (this._aimDir != aimDir) {
            this._aimDir = aimDir;
            this._aimDir >= 0 ? this._aimState = this._armature.animation.fadeIn("aimUp", .1, 1, 1, AIM_ANIMATION_GROUP, dragonBones.AnimationFadeOutMode.SameGroup) : this._aimState = this._armature.animation.fadeIn("aimDown", 0, 1, 0, AIM_ANIMATION_GROUP, dragonBones.AnimationFadeOutMode.SameGroup);
          }
          this._aimState.weight = Math.abs(this._aimRadian / Math.PI * 2);
        },
        _updateAttack: function _updateAttack() {
          if (!this._isAttackingA || this._isAttackingB) return;
          this._isAttackingB = true;
          this._attackState = this._armature.animation.fadeIn("attack_01", -1, -1, 0, ATTACK_ANIMATION_GROUP, dragonBones.AnimationFadeOutMode.SameGroup);
          this._attackState.autoFadeOutTime = this._attackState.fadeTotalTime;
          this._attackState.addBoneMask("pelvis");
        }
      });
      var DragonBullet = cc.Class({
        name: "DragonBullet",
        _speedX: 0,
        _speedY: 0,
        _armature: null,
        _armatureDisplay: null,
        _effect: null,
        init: function init(parentNode, armature, effect, radian, speed, position) {
          this._speedX = Math.cos(radian) * speed;
          this._speedY = -Math.sin(radian) * speed;
          var thePos = parentNode.convertToNodeSpace(position);
          this._armature = armature;
          this._armatureDisplay = this._armature.display;
          this._armatureDisplay.setPosition(thePos);
          this._armatureDisplay.rotation = radian * dragonBones.DragonBones.RADIAN_TO_ANGLE;
          this._armature.animation.play("idle");
          if (effect) {
            this._effect = effect;
            var effectDisplay = this._effect.display;
            effectDisplay.rotation = radian * dragonBones.DragonBones.RADIAN_TO_ANGLE;
            effectDisplay.setPosition(thePos);
            effectDisplay.scaleX = 1 + 1 * Math.random();
            effectDisplay.scaleY = 1 + .5 * Math.random();
            Math.random() < .5 && (effectDisplay.scaleY *= -1);
            this._effect.animation.play("idle");
            dragonBones.WorldClock.clock.add(this._effect);
            parentNode.addChild(effectDisplay);
          }
          dragonBones.WorldClock.clock.add(this._armature);
          parentNode.addChild(this._armatureDisplay);
        },
        update: function update() {
          this._armatureDisplay.x += this._speedX;
          this._armatureDisplay.y += this._speedY;
          var worldPos = this._armatureDisplay.parent.convertToWorldSpace(this._armatureDisplay.getPosition());
          if (worldPos.x < -100 || worldPos.x >= cc.visibleRect.width + 100 || worldPos.y < -100 || worldPos.y >= cc.visibleRect.height + 100) {
            this.doClean();
            return true;
          }
          return false;
        },
        doClean: function doClean() {
          dragonBones.WorldClock.clock.remove(this._armature);
          this._armatureDisplay.removeFromParent();
          this._armature.dispose();
          if (this._effect) {
            dragonBones.WorldClock.clock.remove(this._effect);
            this._effect.display.removeFromParent();
            this._effect.dispose();
          }
        }
      });
    }
    cc._RF.pop();
  }, {} ],
  account: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7f3450apmNIV7/iHoMO9S7S", "account");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _playerData = require("./player-data");
    var _playerData2 = _interopRequireDefault(_playerData);
    var _gameCtl = require("./game-ctl");
    var _gameCtl2 = _interopRequireDefault(_gameCtl);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    var Account = function Account() {
      var that = {};
      that.playerData = (0, _playerData2.default)();
      that.gameCtl = (0, _gameCtl2.default)();
      return that;
    };
    exports.default = Account;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    "./game-ctl": "game-ctl",
    "./player-data": "player-data"
  } ],
  "bg-controller": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "80a351DW0ZOAY4jrUIzlhBr", "bg-controller");
    "use strict";
    var _global = require("./../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        bgList: {
          default: [],
          type: cc.Node
        },
        bgSpeed: 0,
        playerNode: cc.Node
      },
      onLoad: function onLoad() {
        var _this = this;
        this.oldBgSpeed = this.bgSpeed;
        _global2.default.account.gameCtl.onQuick(function() {
          console.log("加速跑");
          _this.bgSpeed += defines.addSpeed;
        });
        _global2.default.account.gameCtl.onQuickEnd(function() {
          _this.bgSpeed = _this.oldBgSpeed;
        });
      },
      update: function update(dt) {
        if (_global2.default.account.gameCtl.isRunning()) {
          var com = this.playerNode.getComponent("player");
          var speed = com.speeds[com.speedLevel];
          for (var i = 0; i < this.bgList.length; i++) this.bgList[i].x -= speed * dt * defines.timeScale;
          for (var _i = 0; _i < this.bgList.length; _i++) if (this.bgList[_i].position.x < -this.bgList[_i].width) {
            var index = _i + 1;
            index > this.bgList.length - 1 && (index = 0);
            this.bgList[_i].x = this.bgList[index].x + this.bgList[_i].width;
          }
        }
      }
    });
    cc._RF.pop();
  }, {
    "./../global": "global"
  } ],
  coin: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "69738LqiS5OLKbwtryk3n4y", "coin");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        var _this = this;
        this.node.dead = false;
        this.node.on("fly", function() {
          console.log("硬币飞走");
          var action = cc.bezierTo(.4, [ _this.node.position, cc.p(_this.node.x, _this.node.y + 200), cc.p(-530, 269) ]);
          _this.node.runAction(cc.sequence(action, cc.callFunc(function() {
            console.log("动作结束");
            _this.node.x = -1e3;
          })));
          _this.node.runAction(cc.scaleTo(.4, .2, .2));
        });
        this.node.on("pause", function() {
          _this.node.getComponent(cc.Animation).pause();
        });
        this.node.on("resume", function() {
          _this.node.getComponent(cc.Animation).resume();
        });
      },
      onEnable: function onEnable() {
        console.log("on enable");
      },
      onDestroy: function onDestroy() {
        console.log("销毁硬笔");
      }
    });
    cc._RF.pop();
  }, {} ],
  "dargon-bone-ctl": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02b25Bv/3ZNeqKzB3ii561U", "dargon-bone-ctl");
    "use strict";
    var _global = require("./../../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    var AnimateState = {
      invalid: -1,
      default: 1,
      idle: 2,
      walk: 3,
      run: 4,
      jump: 5,
      attack: 6
    };
    cc.Class({
      extends: cc.Component,
      editor: {
        requireComponent: dragonBones.ArmatureDisplay
      },
      properties: {
        defaultAnimate: "",
        idleAnimate: "",
        walkAnimate: "",
        jumpAnimate: "",
        attackAnimate: "",
        happyWalkAnimate: "",
        angryWalkAnimate: "",
        saidWalkAnimate: ""
      },
      onLoad: function onLoad() {
        var _this = this;
        this.displayTimeScale = 1;
        this._armatureDisplay = this.getComponent(dragonBones.ArmatureDisplay);
        this._armature = this._armatureDisplay.armature();
        this._armatureDisplay.addEventListener(dragonBones.EventObject.FADE_IN_COMPLETE, this.animateCompleteListener, this);
        dragonBones.WorldClock.clock.add(this._armature);
        this.state = AnimateState.invalid;
        this.node.parent.on("jump", function(event) {
          console.log("跳起来");
          _this.setState(AnimateState.jump);
        });
        this.node.parent.on("jump-end", function() {
          console.log("跳起来结束" + _this.oldState);
          _this.oldState !== AnimateState.walk && _this.oldState !== AnimateState.default || _this.setState(AnimateState.walk);
        });
        this.node.parent.on("walk", function(event) {
          console.log("走路");
          _this.setState(AnimateState.walk);
        });
        this.node.parent.on("idle", function(event) {
          console.log("动画播放，idle");
          _this.animateSpeed = event.detail;
          _this.setState(AnimateState.idle);
        });
        this.node.parent.on("attack", function(event) {
          console.log("播放攻击动画");
          _this.setState(AnimateState.attack);
        });
        this.node.parent.on("pause", function() {
          _this._armatureDisplay.timeScale = 0;
        });
        this.node.parent.on("resume", function() {
          _this._armatureDisplay.timeScale = 1;
        });
        this.node.parent.on("time-scale", function(event) {
          _this._armatureDisplay.timeScale = event.detail;
        });
        _global2.default.account.gameCtl.onRun(function() {
          _this.setState(AnimateState.default);
        });
        this.setState(AnimateState.default);
      },
      animateFrameListener: function animateFrameListener() {},
      animateCompleteListener: function animateCompleteListener(event) {
        console.log("播放动画完成");
        console.log("event = " + event.type);
      },
      idle: function idle() {},
      walk: function walk() {
        this.setState(AnimateState.walk);
      },
      jump: function jump() {},
      attack: function attack() {},
      playAnimate: function playAnimate(state) {},
      setState: function setState(state) {
        if (this.state === state) return;
        this.oldState = this.state;
        switch (state) {
         case AnimateState.default:
          this._armature.animation.fadeIn(this.defaultAnimate, .2, -1, 0);
          break;

         case AnimateState.jump:
          this._armature.animation.fadeIn(this.jumpAnimate, 0, 1, 0);
          break;

         case AnimateState.walk:
          console.log("dragon bone walk");
          this._armature.animation.fadeIn(this.walkAnimate, .2, -1, 0);
          break;

         case AnimateState.run:
          break;

         case AnimateState.idle:
          console.log("播放idle 动画");
          this._armature.animation.fadeIn(this.idleAnimate, .2, -1, 0);
          break;

         case AnimateState.attack:
          this._armature.animation.fadeIn(this.attackAnimate, 0, 1, 0);
        }
        this.state = state;
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
  "distance-node": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "30f99ozJhdG6otDIK90xCYl", "distance-node");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        numSpriteFrameList: {
          default: [],
          type: cc.SpriteFrame
        },
        mileIcon: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        var _this = this;
        this.numNodeMap = {};
        this.setNumber(0);
        this.node.on("distance-change", function(event) {
          var detail = event.detail;
          _this.setNumber(detail);
        });
      },
      setNumber: function setNumber(value) {
        var str = value + "";
        for (var i = str.length - 1; i >= 0; i--) {
          var char = str[i];
          if (this.numNodeMap.hasOwnProperty(i)) this.numNodeMap[i].getComponent(cc.Sprite).spriteFrame = this.numSpriteFrameList[char]; else {
            this.numNodeMap[i] = new cc.Node("node");
            this.numNodeMap[i].parent = this.node;
            var sp = this.numNodeMap[i].addComponent(cc.Sprite);
            sp.spriteFrame = this.numSpriteFrameList[char];
            this.numNodeMap[i].x += this.numNodeMap[i].width * i;
            this.mileIcon.x = this.numNodeMap[i].x + .5 * this.numNodeMap[i].width + .5 * this.mileIcon.width;
          }
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  enemy: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "6fd26qTZ8FGY7zOpQdIanzO", "enemy");
    "use strict";
    var _global = require("./../../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    var EnemyState = {
      invalid: -1,
      run: 1,
      tipsBegan: 2,
      tipsEnd: 3
    };
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        var _this = this;
        this.state = EnemyState.invalid;
        this.setState(EnemyState.run);
        this.node.on("fly", function() {
          console.log("飞走");
          var action1 = cc.bezierTo(1, [ cc.p(78, 9), cc.p(86, 302), cc.p(418, 319) ]);
          _this.node.runAction(cc.sequence(action1, cc.callFunc(function() {
            _this.node.dead = true;
          })));
          var raaction = cc.rotateTo(1, 1440);
          _this.node.runAction(raaction);
          _this.setState(EnemyState.tipsEnd);
          var scal1 = cc.scaleTo(1, .2, .2);
          _this.node.runAction(scal1);
          _this.node.isFly = true;
        });
      },
      update: function update() {
        if (this.state === EnemyState.run && !_global2.default.account.gameCtl.isQuick()) {
          var dis = cc.pDistance(this.node.position, _global2.default.account.playerData.playerNode.position);
          var speedX = this.node.getComponent("stub").speedX;
          dis / speedX < 2.4 && this.setState(EnemyState.tipsBegan);
        }
      },
      setState: function setState(state) {
        if (this.state === state) return;
        switch (state) {
         case EnemyState.tipsBegan:
          _global2.default.account.gameCtl.tipsBegan();
          break;

         case EnemyState.tipsEnd:
        }
        this.state = state;
      },
      onDestroy: function onDestroy() {
        console.log("销毁了敌人");
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
  "event-listener": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "27680LRP6hNVauuwpZEPqWs", "event-listener");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var EventListener = function EventListener(obj) {
      var Register = {};
      obj.on = function(type, method) {
        Register.hasOwnProperty(type) ? Register[type].push(method) : Register[type] = [ method ];
      };
      obj.fire = function(type) {
        if (Register.hasOwnProperty(type)) {
          var handlerList = Register[type];
          for (var i = 0; i < handlerList.length; i++) {
            var args = [];
            for (var j = 1; j < arguments.length; j++) args.push(arguments[j]);
            var handler = handlerList[i];
            handler.apply(this, args);
          }
        }
      };
      return obj;
    };
    exports.default = EventListener;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {} ],
  "game-ctl": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0e892h6g+pNbLCGpl9iuQFj", "game-ctl");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _eventListener = require("./../utility/event-listener");
    var _eventListener2 = _interopRequireDefault(_eventListener);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    var GameState = {
      invalid: -1,
      run: 1,
      pause: 2,
      resume: 3,
      tipsBegan: 4,
      quick: 5
    };
    var GameCtl = function GameCtl() {
      var that = {};
      var _event = (0, _eventListener2.default)({});
      that.event = _event;
      var _state = GameState.invalid;
      var _timeSpeed = void 0;
      var _distance = 0;
      var _distanceTimeCount = 0;
      var setState = function setState(state, data) {
        if (_state === state) return;
        switch (state) {
         case GameState.run:
          _event.fire("game-run");
          break;

         case GameState.pause:
          _event.fire("game-pause");
          break;

         case GameState.resume:
          _event.fire("game-resume");
          break;

         case GameState.tipsBegan:
          _event.fire("tips-began", data);
          _timeSpeed = -.02;
          break;

         case GameState.quick:
          _event.fire("quick");
        }
        _state = state;
      };
      that.pause = function() {
        setState(GameState.pause);
      };
      that.run = function() {
        setState(GameState.run);
      };
      that.resume = function() {
        setState(GameState.resume);
      };
      that.tipsBegan = function(data) {
        setState(GameState.tipsBegan, data);
      };
      that.tipsEnd = function(data) {
        console.log("tips end = " + JSON.stringify(data));
        defines.timeScale = 1;
        _event.fire("tips-end", data);
        setState(GameState.resume);
      };
      that.quick = function() {
        setState(GameState.quick);
      };
      that.qucikEnd = function() {
        _event.fire("quick-end");
        setState(GameState.run);
      };
      that.onQuickEnd = function(method) {
        _event.on("quick-end", method);
      };
      that.attackEnd = function() {
        _event.fire("attack-end");
      };
      that.onQuick = function(method) {
        console.log("注册加速事件");
        _event.on("quick", method);
      };
      that.onAttackEnd = function(method) {
        _event.on("attack-end", method);
      };
      that.onTipsBegan = function(method) {
        console.log("开始答题");
        _event.on("tips-began", method);
      };
      that.onTipsEnd = function(method) {
        _event.on("tips-end", method);
      };
      that.isRunning = function() {
        if (_state === GameState.run || _state === GameState.resume || _state === GameState.tipsBegan || _state === GameState.quick) return true;
        return false;
      };
      that.isQuick = function() {
        if (_state === GameState.quick) return true;
        return false;
      };
      that.onPause = function(method) {
        _event.on("game-pause", method);
      };
      that.onRun = function(method) {
        _event.on("game-run", method);
      };
      that.onResume = function(method) {
        _event.on("game-resume", method);
      };
      that.onTimeScale = function(method) {
        _event.on("time-scale", method);
      };
      that.onDistanceChange = function(method) {
        _event.on("distance-change", method);
      };
      that.update = function(dt) {
        if (that.isRunning()) {
          if (void 0 !== _timeSpeed) {
            defines.timeScale += _timeSpeed;
            _event.fire("time-scale", defines.timeScale);
            if (defines.timeScale < .05) {
              defines.timeScale = .05;
              _timeSpeed = void 0;
            }
          }
          if (_distanceTimeCount > 1) {
            _distanceTimeCount = 0;
            _distance++;
            _event.fire("distance-change", _distance);
          } else _distanceTimeCount += dt * defines.timeScale;
        }
      };
      return that;
    };
    exports.default = GameCtl;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    "./../utility/event-listener": "event-listener"
  } ],
  game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "60470Zt8u5IlpV9XQ29Uy5o", "game");
    "use strict";
    var _global = require("./../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        playerNode: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        cc.director.getCollisionManager().enabled = true;
        console.log("enter animate");
        this.playerNode.emit("walk");
        var action = cc.moveTo(1, cc.p(this.playerNode.position.x + 400, this.playerNode.position.y));
        this.playerNode.runAction(cc.sequence(action, cc.callFunc(function() {
          console.log("开始游戏");
          _global2.default.account.gameCtl.run();
        })));
      },
      start: function start() {},
      update: function update(dt) {
        _global2.default.account.gameCtl.update(dt);
      }
    });
    cc._RF.pop();
  }, {
    "./../global": "global"
  } ],
  global: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "73d90r0faZDk5ECCDFMZ5Ki", "global");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _account = require("./data/account");
    var _account2 = _interopRequireDefault(_account);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    var global = {};
    global.account = (0, _account2.default)();
    exports.default = global;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    "./data/account": "account"
  } ],
  jump: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0d6bdpYAWZGKLd19OpjSA0E", "jump");
    "use strict";
    var _global = require("../../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        accY: 0,
        jumpSpeed: 0
      },
      onLoad: function onLoad() {
        var self = this;
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          0 === opt.currentLevel ? self.jumpSpeed = 1300 : self.jumpSpeed = 1600;
        });
        this.node.on("jump", this.jump.bind(this));
        this.initPosY = this.node.position.y;
        this.timeSubSpeed = 0;
      },
      jump: function jump() {
        void 0 === this.speedY && (this.speedY = this.jumpSpeed);
      },
      playJumpSound: function playJumpSound(sound) {
        void 0 === this.speedY && cc.audioEngine.play(sound, false, 1);
      },
      update: function update(dt) {
        if (void 0 !== this.speedY) {
          this.node.position = cc.p(this.node.position.x, this.node.position.y + this.speedY * dt * defines.timeScale);
          this.speedY += this.accY * dt * defines.timeScale;
        }
        if (this.node.position.y <= this.initPosY && void 0 !== this.speedY) {
          this.node.position = cc.p(this.node.position.x, this.initPosY);
          this.speedY = void 0;
          console.log("落地");
          this.node.emit("jump-end");
        }
      }
    });
    cc._RF.pop();
  }, {
    "../../global": "global"
  } ],
  "mask-progress": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "daaddHL5h9G0aZ/5+cn06B9", "mask-progress");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        progress: 0
      },
      onLoad: function onLoad() {
        this.currentWidth = this.node.width;
      },
      update: function update() {
        this.node.width = this.currentWidth * this.progress;
      },
      setProgress: function setProgress(progress) {
        this.progress = progress;
      }
    });
    cc._RF.pop();
  }, {} ],
  pauseLayer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e38d5hWP6VOy6jvMdAyumJI", "pauseLayer");
    "use strict";
    var _global = require("./../../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {},
      onButtonClick: function onButtonClick(event, customData) {
        switch (customData) {
         case "resume":
          _global2.default.account.gameCtl.resume();
          this.node.destroy();
        }
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
  "player-data": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "cfc58NVXZFLeqvB0LKoddLU", "player-data");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var TitleType = {
      say: 1,
      listen: 2
    };
    var Title = function Title() {};
    var PlayerData = function PlayerData() {
      var that = {};
      that.titleList = [];
      that.goldCount = 0;
      that.gameData = [ "word1", "word2", "word3", "word4", "word5", "word6", "word7", "word8", "word9", "word10", "word11", "word12", "word13", "word14", "word15" ];
      that.initTitle = function(data) {
        for (var i = 0; i < data.length; i++) ;
      };
      that.initTitle(that.gameData);
      return that;
    };
    exports.default = PlayerData;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {} ],
  player: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "88f81BogZJPqb+CU7HL2iBP", "player");
    "use strict";
    var _global = require("./../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    function _defineProperty(obj, key, value) {
      key in obj ? Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      }) : obj[key] = value;
      return obj;
    }
    cc.Class(_defineProperty({
      extends: cc.Component,
      properties: {
        body: {
          default: null,
          type: cc.Node
        },
        jumpAudio: cc.AudioClip,
        attackAudio: cc.AudioClip,
        eatAudio: cc.AudioClip,
        speeds: [ cc.Float ],
        speedLevel: 0,
        uiSpeed: cc.ProgressBar
      },
      onLoad: function onLoad() {
        var _this = this;
        _global2.default.account.gameCtl.onTipsBegan(function() {
          console.log("游戏暂停");
        });
        _global2.default.account.gameCtl.onTipsEnd(function(data) {
          console.log("答题结束" + JSON.stringify(data));
          _this.tipsResult = data.result;
          _this.node.emit("attack");
          _this.node.emit("time-scale", 1);
        });
        this.node.zIndex = 1;
        this.node.on("jump", this.onJump.bind(this));
        _global2.default.account.gameCtl.onTimeScale(function() {
          _this.node.emit("time-scale", defines.timeScale);
        });
        _global2.default.account.gameCtl.onPause(function() {
          _this.node.emit("time-scale", 0);
        });
        _global2.default.account.gameCtl.onResume(function() {
          _this.node.emit("time-scale", defines.timeScale);
        });
        _global2.default.account.playerData.playerNode = this.node;
      },
      start: function start() {},
      onJump: function onJump(event) {
        console.log("on jump");
        var com = this.node.getComponent("jump");
        com.playJumpSound(this.jumpAudio);
      },
      onCollisionEnter: function onCollisionEnter(other, self) {
        if ("success" === this.tipsResult && other.getComponent("enemy")) {
          cc.audioEngine.play(this.attackAudio, false, 1);
          other.node.emit("fly");
          this.node.emit("walk");
          _global2.default.account.gameCtl.attackEnd();
          this.speedLevel++;
          this.speedLevel = Math.min(this.speedLevel, this.speeds.length - 1);
          _global2.default.account.gameCtl.event.fire("speed-changed", {
            currentLevel: this.speedLevel,
            maxLevel: this.speeds.length - 1,
            speedValue: this.speeds[this.speedLevel]
          });
        }
        if (other.getComponent("coin")) {
          cc.audioEngine.play(this.eatAudio, false, 1);
          other.node.emit("fly");
          _global2.default.account.playerData.goldCount++;
        }
      },
      onCollisionStay: function onCollisionStay(other, self) {},
      onCollisionExit: function onCollisionExit(other, self) {}
    }, "start", function start() {}));
    cc._RF.pop();
  }, {
    "./../global": "global"
  } ],
  "stub-controller": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2810dnFOCtJC7nz/gCPht7h", "stub-controller");
    "use strict";
    var _global = require("../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        gameNode: {
          default: null,
          type: cc.Node
        },
        stubPrefab: {
          default: null,
          type: cc.Prefab
        },
        prizePrefab: {
          default: null,
          type: cc.Prefab
        },
        enemyPrefabList: {
          default: [],
          type: cc.Prefab
        },
        initPosNode: {
          default: null,
          type: cc.Node
        },
        initPrizePosNodeList: {
          default: [],
          type: cc.Node
        },
        playerNode: cc.Node
      },
      onLoad: function onLoad() {
        var _this = this;
        this.player = this.playerNode.getComponent("player");
        this.stubList = [];
        this.addStubIndex = 0;
        this.prizeList = [];
        this.enemyList = [];
        this.coinList = [];
        this.addStub();
        this.addCoinFlag = 0;
        this.addCoinFlagDurection = 4;
        this.addCoinDurection = 0;
        _global2.default.account.gameCtl.onPause(function() {
          for (var i = 0; i < _this.stubList.length; i++) {
            var node = _this.stubList[i];
            node.emit("time-scale", 0);
          }
          for (var _i = 0; _i < _this.coinList.length; _i++) {
            var coin = _this.coinList[_i];
            coin.emit("pause");
          }
        });
        _global2.default.account.gameCtl.onResume(function() {
          for (var i = 0; i < _this.stubList.length; i++) {
            var node = _this.stubList[i];
            console.log("on resume = " + defines.timeScale);
            node.emit("time-scale", defines.timeScale);
          }
          for (var _i2 = 0; _i2 < _this.coinList.length; _i2++) {
            var coin = _this.coinList[_i2];
            coin.emit("resume");
          }
        });
        _global2.default.account.gameCtl.onQuick(function() {
          for (var i = 0; i < _this.stubList.length; i++) {
            var node = _this.stubList[i];
            node.emit("quick");
          }
          for (var _i3 = 0; _i3 < _this.coinList.length; _i3++) {
            var coin = _this.coinList[_i3];
            coin.emit("quick");
          }
        });
        _global2.default.account.gameCtl.onQuickEnd(function() {
          for (var i = 0; i < _this.stubList.length; i++) {
            var node = _this.stubList[i];
            node.emit("quick-end");
          }
          for (var _i4 = 0; _i4 < _this.coinList.length; _i4++) {
            var coin = _this.coinList[_i4];
            coin.emit("quick-end");
          }
        });
        _global2.default.account.gameCtl.onTimeScale(function() {
          for (var i = 0; i < _this.stubList.length; i++) {
            var node = _this.stubList[i];
            node.emit("time-scale", defines.timeScale);
          }
        });
        this.initPool();
      },
      initPool: function initPool() {
        this.coinPool = new cc.NodePool();
        var initCount = 6;
        for (var i = 0; i < initCount; i++) {
          var coin = cc.instantiate(this.prizePrefab);
          this.coinPool.put(coin);
        }
      },
      update: function update(dt) {
        for (var i = 0; i < this.stubList.length; i++) {
          var enemy = this.stubList[i];
          if (true === enemy.dead) {
            this.stubList.splice(i, 1);
            enemy.destroy();
          }
        }
        for (var _i5 = 0; _i5 < this.coinList.length; _i5++) {
          var coin = this.coinList[_i5];
          if (coin.x < -.5 * cc.winSize.width) {
            this.coinPool.put(coin);
            this.coinList.splice(_i5, 1);
          }
        }
        if (0 !== this.stubList.length && this.stubList[this.stubList.length - 1].position.x < .2 * cc.winSize.width) if (3 === this.addStubIndex) {
          this.addStubIndex = 0;
          this.addEnemy();
        } else this.addStub();
        this.addCoinFlagDurection -= dt;
        if (this.addCoinFlagDurection <= 0 && 0 === this.addCoinFlag) {
          this.addCoinFlagDurection = 4;
          this.addCoinFlag = Math.floor(3 * Math.random() + 2);
        }
        if (this.addCoinFlag > 0) if (0 === this.coinList.length) this.addCoin(); else {
          var maxX = -1e4;
          for (var _i6 = 0; _i6 < this.coinList.length; _i6++) this.coinList[_i6].x > maxX && (maxX = this.coinList[_i6].x);
          this.initPrizePosNodeList[0].x - maxX > 300 && this.addCoin();
        }
      },
      addCoin: function addCoin() {
        this.addCoinFlag--;
        var node = this.initPrizePosNodeList[Math.floor(Math.random() * this.initPrizePosNodeList.length)];
        var coin = null;
        if (this.coinPool.size() > 0) {
          console.log("取出一个对象来");
          coin = this.coinPool.get();
        } else {
          console.log("对象池不够用了");
          coin = cc.instantiate(this.prizePrefab);
        }
        coin.zIndex = 0;
        coin.parent = this.gameNode;
        coin.position = node.position;
        coin.scale = 1;
        coin.getComponent("stub") && coin.getComponent("stub").initWithData({
          speed: this.player.speeds[this.player.speedLevel],
          isQuick: _global2.default.account.gameCtl.isQuick(),
          manager: this
        });
        coin.dead = false;
        this.coinList.push(coin);
      },
      addStub: function addStub() {
        var stub = this.createStub(this.initPosNode, this.stubPrefab);
        this.stubList.push(stub);
        this.addStubIndex++;
      },
      addPrize: function addPrize() {
        var stub = this.createStub(this.initPrizePosNodeList[Math.floor(Math.random() * this.initPrizePosNodeList.length)], this.prizePrefab);
        stub.zIndex = 2;
        this.prizeList.push(stub);
      },
      addEnemy: function addEnemy() {
        var enemy = this.createStub(this.initPosNode, this.enemyPrefabList[0]);
        enemy.emit("init-manager", this);
        this.stubList.push(enemy);
      },
      createStub: function createStub(initPos, prefab) {
        var stub = cc.instantiate(prefab);
        stub.zIndex = 0;
        stub.parent = this.gameNode;
        stub.position = initPos.position;
        stub.getComponent("stub") && stub.getComponent("stub").initWithData({
          speed: this.player.speeds[this.player.speedLevel],
          isQuick: _global2.default.account.gameCtl.isQuick()
        });
        return stub;
      }
    });
    cc._RF.pop();
  }, {
    "../global": "global"
  } ],
  stub: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "23141ICrbhAh46D7my/c5US", "stub");
    "use strict";
    var _global = require("./../../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        stubSpriteFrameList: {
          default: [],
          type: cc.SpriteFrame
        }
      },
      initWithData: function initWithData(data) {
        this.node.dead = false;
        this.speedX = data.speed;
        this.oldSpeedX = this.speedX;
        var isQuick = data.isQuick;
        console.log("is qucik" + isQuick);
        isQuick && this.node.emit("quick");
        this.fly = false;
      },
      onLoad: function onLoad() {
        var _this = this;
        var self = this;
        if (0 !== this.stubSpriteFrameList.length) {
          this.addComponent(cc.Sprite).spriteFrame = this.stubSpriteFrameList[0];
          var collider = this.node.addComponent(cc.BoxCollider);
          collider.size = cc.size(this.node.width, this.node.height);
        }
        this.node.on("fly", function() {
          _this.fly = true;
          console.log("飞走了");
        });
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          console.log("player speed changed:", opt.speedValue);
          self.speedX = opt.speedValue;
        });
      },
      update: function update(dt) {
        _global2.default.account.gameCtl.isRunning() && this.speedX && false === this.fly && (this.node.position = cc.p(this.node.position.x - this.speedX * dt * defines.timeScale, this.node.position.y));
        this.node.position.x + .5 * this.node.width < -.5 * cc.winSize.width ? this.node.dead = true : this.node.dead = false;
      },
      onDestroy: function onDestroy() {
        console.log("销毁障碍物");
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
  "tips-ctl": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d915eFyCSdCor4UBzNBwfsh", "tips-ctl");
    "use strict";
    var _global = require("./../../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        timeCutDownLabel: {
          default: null,
          type: cc.Label
        },
        resultLabel: {
          default: null,
          type: cc.Label
        }
      },
      onLoad: function onLoad() {
        var _this = this;
        _global2.default.account.gameCtl.onTipsBegan(function(data) {
          console.log("开始答题了" + JSON.stringify(data));
          _this.node.active = true;
          _this.timeCutDown = 4;
        });
        _global2.default.account.gameCtl.onTipsEnd(function() {
          _this.node.active = false;
        });
      },
      start: function start() {
        this.node.active = false;
      },
      update: function update(dt) {
        var _this2 = this;
        if (_global2.default.account.gameCtl.isRunning() && this.timeCutDown > 0) {
          this.timeCutDown -= dt;
          if (this.timeCutDown <= 0) {
            this.timeCutDown = 0;
            this.resultLabel.string = "真棒!";
            setTimeout(function() {
              _this2.resultLabel.string = "";
            }, 1e3);
            _global2.default.account.gameCtl.tipsEnd({
              result: "success"
            });
          }
          this.timeCutDownLabel.string = Math.floor(this.timeCutDown) + "";
        }
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
  "ui-controller": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "7974bCe2whCPaAR+MgXoGWu", "ui-controller");
    "use strict";
    var _global = require("./../global");
    var _global2 = _interopRequireDefault(_global);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    cc.Class({
      extends: cc.Component,
      properties: {
        totalTime: 0,
        player: {
          default: null,
          type: cc.Node
        },
        runProgress: {
          default: null,
          type: cc.Node
        },
        upButton: {
          default: null,
          type: cc.Node
        },
        runButton: {
          default: null,
          type: cc.Node
        },
        runActiveButton: {
          default: null,
          type: cc.Node
        },
        runButtonProgress: {
          default: null,
          type: cc.ProgressBar
        },
        coinCountLabel: {
          default: null,
          type: cc.Label
        },
        distanceNode: {
          default: null,
          type: cc.Node
        },
        pauseLayer: {
          default: null,
          type: cc.Prefab
        },
        runButtonIcon: {
          default: null,
          type: cc.Node
        }
      },
      onLoad: function onLoad() {
        var _this = this;
        this.currentTime = 0;
        var self = this;
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          self.runButtonProgress.progress = opt.currentLevel / opt.maxLevel;
        });
        _global2.default.account.gameCtl.onTipsBegan(function(data) {
          console.log("开始答题 = " + JSON.stringify(data));
          _this.upButton.opacity = 100;
          _this.runButton.opacity = 100;
        });
        _global2.default.account.gameCtl.onAttackEnd(function() {
          _this.upButton.opacity = 255;
          _this.runButton.opacity = 255;
        });
        _global2.default.account.gameCtl.onDistanceChange(function(distance) {
          _this.distanceNode.emit("distance-change", distance);
        });
        cc.eventManager.addListener({
          event: cc.EventListener.KEYBOARD,
          onKeyPressed: function onKeyPressed(keyCode, event) {
            _this._keyHandler(keyCode, true);
          },
          onKeyReleased: function onKeyReleased(keyCode, event) {
            _this._keyHandler(keyCode, false);
          }
        }, this.node);
        this.isCanRun = false;
        this.runButtonProgressSpeed = .01;
        this.runButtonIcon.active = false;
      },
      _keyHandler: function _keyHandler(code, isDown) {
        switch (code) {
         case cc.KEY.up:
         case cc.KEY.space:
          console.log("跳");
          255 === this.upButton.opacity && this.player.emit("jump");
          break;

         case cc.KEY.enter:
          console.log("加速");
          this.isCanRun && _global2.default.account.gameCtl.quick();
        }
      },
      onButtonClick: function onButtonClick(event, customData) {
        switch (customData) {
         case "up-button":
          255 === this.upButton.opacity && this.player.emit("jump");
          break;

         case "run-button":
          if (255 === this.runButton.opacity && this.isCanRun) {
            console.log("run button");
            _global2.default.account.gameCtl.quick();
            this.runButtonIcon.active = false;
          }
          break;

         case "pause":
          var node = cc.instantiate(this.pauseLayer);
          node.parent = this.node;
          _global2.default.account.gameCtl.pause();
        }
      },
      update: function update(dt) {
        if (_global2.default.account.gameCtl.isRunning()) {
          this.currentTime += dt;
          this.runProgress.getComponent("mask-progress").setProgress((this.totalTime - this.currentTime) / this.totalTime);
          this.coinCountLabel.string = _global2.default.account.playerData.goldCount + "";
        }
      }
    });
    cc._RF.pop();
  }, {
    "./../global": "global"
  } ]
}, {}, [ "account", "game-ctl", "player-data", "bg-controller", "DragonBonesCtrl", "dargon-bone-ctl", "distance-node", "jump", "mask-progress", "stub", "tips-ctl", "game", "player", "coin", "enemy", "pauseLayer", "stub-controller", "ui-controller", "global", "event-listener" ]);
//# sourceMappingURL=project.dev.js.map