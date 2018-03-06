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
  audio: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "42164AmjT5BvrOmurl6HH0A", "audio");
    "use strict";
    cc._RF.pop();
  }, {} ],
  coin: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "69738LqiS5OLKbwtryk3n4y", "coin");
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
      onLoad: function onLoad() {
        var _this = this;
        this.initPos = this.node.position;
        this.node.dead = false;
        this.p = this.node.convertToNodeSpace(cc.p(-212, 200));
        this.actionFlyToPlayer = cc.moveTo(1.5, this.p);
        this.node.on("fly", function() {
          if (_this.flying) {
            _this.node.removeFromParent(true);
            return;
          }
          _this.dead = true;
          var action = cc.bezierTo(.3, [ _this.node.position, cc.p(_this.node.x, _this.node.y + 200), cc.p(-530, 350) ]);
          _this.node.runAction(cc.sequence(action, cc.callFunc(function() {
            console.log("动作结束");
            _this.node.removeFromParent(true);
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
        this.node.position = this.initPos;
        this.node.scale = 1;
      },
      onDestroy: function onDestroy() {
        console.log("销毁硬笔");
      },
      update: function update(dt) {
        if (this.dead || this.flying) return;
        if (_global2.default.account.gameCtl.state() === GameState.quick) {
          this.flying = true;
          this.node.runAction(this.actionFlyToPlayer);
        }
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
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
        _global2.default.account.gameCtl.event.on("jump", function(event) {
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
      properties: {
        body: cc.Node
      },
      onLoad: function onLoad() {
        var _this = this;
        this.state = EnemyState.invalid;
        this.setState(EnemyState.run);
        var animationName = "idle" + parseInt(10 * Math.random()) % 3;
        this.body.getComponent(dragonBones.ArmatureDisplay).playAnimation(animationName, -1);
        this.node.on("fly", function() {
          console.log("飞走");
          var action1 = cc.bezierTo(.5, [ cc.p(78, 9), cc.p(86, 302), cc.p(418, 600) ]);
          var rotation = cc.rotateTo(.5, 1440);
          var scal1 = cc.scaleTo(.5, .2, .2);
          var finished = cc.callFunc(function() {
            console.log("enemy dead");
            _this.node.dead = true;
          });
          _this.node.runAction(cc.sequence(cc.spawn([ action1, rotation, scal1 ]), finished));
          _this.node.getComponent(cc.BoxCollider).enabled = false;
          _this.node.isFly = true;
        });
      },
      onEnable: function onEnable() {
        this.node.getComponent(cc.BoxCollider).enabled = true;
        this.state = EnemyState.run;
        this.node.scale = 1;
      },
      update: function update() {
        if (this.state === EnemyState.run && !_global2.default.account.gameCtl.isQuick()) {
          var dis = cc.pDistance(this.node.position, _global2.default.account.playerData.playerNode.position);
          var player = _global2.default.account.playerData.playerNode.getComponent("player");
          var speedX = player.speeds[player.speedLevel];
          var animationScale = speedX / player.speeds[0];
          dis / (speedX / animationScale) < 2 && player.node.emit("attack");
          dis / speedX / animationScale <= 2 && this.setState(EnemyState.tipsBegan);
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
      obj.removeAllListeners = function() {
        Register = {};
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
      quick: 5,
      endScene: 6
    };
    window.GameState = GameState;
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
          break;

         case GameState.endScene:
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
        if (_state === GameState.run || _state === GameState.resume || _state === GameState.tipsBegan || _state === GameState.quick || _state === GameState.endScene) return true;
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
      var _sceneList = [ "spring", "summer", "autumn", "winter" ];
      var _currentScene = null, _currentSceneIndex = 0;
      that.playerData = {
        goldCount: 0,
        distance: 0,
        speedLevel: 0,
        passedTime: 0
      };
      var _loadScene = function _loadScene(name) {
        cc.director.loadScene(name, function(err, scene) {
          if (err) {
            console.error(err);
            return;
          }
          console.log("load scene[" + name + "]success");
          _currentScene = scene;
        });
      };
      that.start = function(opt) {
        _loadScene(_sceneList[_currentSceneIndex]);
      };
      that.getSceneIndex = function() {
        return _currentSceneIndex;
      };
      that.nextScene = function() {
        _event.removeAllListeners();
        _currentSceneIndex++;
        that.pause();
        console.log(_sceneList[_currentSceneIndex]);
        _currentSceneIndex >= _sceneList.length && (_currentSceneIndex = 0);
        _loadScene(_sceneList[_currentSceneIndex]);
      };
      that.setState = setState;
      that.state = function() {
        return _state;
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
        },
        uiNode: cc.Node
      },
      onLoad: function onLoad() {},
      start: function start() {
        var _this = this;
        var self = this;
        console.log("on game loaded");
        var size = cc.view.getFrameSize();
        console.log(size.height, size.width);
        if (size.height / size.width > .6) {
          console.log("ipad,scale ui");
          this.uiNode.scale = .75;
        }
        cc.director.getCollisionManager().enabled = true;
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on("finished", this.onAnimationFinished.bind(this));
        var resList = [];
        for (var i in defines.config) resList.push(defines.config[i]);
        _global2.default.resourcesManager.loadList(resList, function() {
          _this.animation.play("player_in");
          _global2.default.account.gameCtl.run();
          self.playerNode.emit("walk");
        });
      },
      onAnimationFinished: function onAnimationFinished(event) {},
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
    var _resourcesManager = require("./utility/resources-manager");
    var _resourcesManager2 = _interopRequireDefault(_resourcesManager);
    var _poolManager = require("./utility/pool-manager");
    var _poolManager2 = _interopRequireDefault(_poolManager);
    function _interopRequireDefault(obj) {
      return obj && obj.__esModule ? obj : {
        default: obj
      };
    }
    var global = {};
    global.account = (0, _account2.default)();
    global.resourcesManager = (0, _resourcesManager2.default)();
    global.poolManager = (0, _poolManager2.default)();
    exports.default = global;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {
    "./data/account": "account",
    "./utility/pool-manager": "pool-manager",
    "./utility/resources-manager": "resources-manager"
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
        var oldAccY = this.accY;
        var oldJumpSpeed = this.jumpSpeed;
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          0 === opt.currentLevel ? self.jumpSpeed = oldJumpSpeed : self.jumpSpeed = self.jumpSpeed + 50;
        });
        _global2.default.account.gameCtl.event.on("jump", this.jump.bind(this));
        this.initPosY = this.node.position.y;
        this.timeSubSpeed = 0;
      },
      jump: function jump() {
        console.log("on jump");
        void 0 === this.speedY && (this.speedY = this.jumpSpeed);
      },
      playJumpSound: function playJumpSound(sound) {
        if (!this.playedSound) {
          this.playedSound = true;
          cc.audioEngine.play(sound, false, 1);
        }
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
          this.playedSound = false;
        }
      }
    });
    cc._RF.pop();
  }, {
    "../../global": "global"
  } ],
  main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c125f5ldmhPmLM51YlELfYg", "main");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        var size = cc.view.getFrameSize();
        75 === parseInt(size.width / size.height * 100) && console.log("4:3");
      },
      start: function start() {},
      onEnterGameClicked: function onEnterGameClicked() {
        cc.director.loadScene("spring", function(err, scene) {
          if (err) {
            console.error(err);
            return;
          }
          console.log("load scene[" + name + "]success");
        });
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
          cc.audioEngine.resumeAll();
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
      that.distance = 0;
      that.sceneDistance = 300;
      that.speedLevel = 0;
      that.speed = 400;
      that.passedTime = 0;
      that.power = 0;
      that.questions = [ {
        type: 2,
        answer_index: 1,
        word: "bag",
        image_urls: [ "http://47.52.247.115/1.jpg", "http://47.52.247.115/2.png", "http://47.52.247.115/3.jpg" ]
      }, {
        type: 1,
        word: "bag",
        image_url: "http://47.52.247.115/2.png"
      } ];
      that.questionIndex = 0;
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
    cc.Class({
      extends: cc.Component,
      properties: {
        body: {
          default: null,
          type: cc.Node
        },
        car: cc.Node,
        jumpAudio: cc.AudioClip,
        attackAudio: cc.AudioClip,
        eatAudio: cc.AudioClip,
        beAttacked: cc.AudioClip,
        auCar: cc.AudioClip,
        speeds: [ cc.Float ],
        speedLevel: 0,
        distanceCurrentScene: 0,
        superPowerDuration: 10,
        superSpeed: 700,
        rootNode: cc.Node
      },
      onLoad: function onLoad() {
        var _this = this;
        this.passedTimeSuper = 0;
        this.speedLevel = _global2.default.account.playerData.speedLevel;
        this.speed = _global2.default.account.playerData.speed;
        _global2.default.account.gameCtl.onTipsBegan(function() {
          console.log("游戏暂停");
        });
        _global2.default.account.gameCtl.onTipsEnd(function(data) {
          console.log("on tip end");
          _global2.default.account.playerData.power >= 4 && _this.enterSuperMode();
          _this.tipsResult = data.result;
          _this.node.emit("time-scale", 1);
        });
        this.node.zIndex = 1;
        _global2.default.account.gameCtl.event.on("jump", this.onJump.bind(this));
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
      getNowSpeed: function getNowSpeed() {
        return this.speeds[this.speedLevel];
      },
      onJump: function onJump(event) {
        console.log("on jump audio");
        var com = this.node.getComponent("jump");
        com.playJumpSound(this.jumpAudio);
      },
      onCollisionEnter: function onCollisionEnter(other, self) {
        if (other.getComponent("enemy")) {
          cc.audioEngine.play(this.attackAudio, false, 1);
          if (_global2.default.account.gameCtl.state() !== GameState.quick) {
            other.node.emit("fly");
            this.node.emit("walk");
            this.speedLevel++;
            this.speedLevel = Math.min(this.speedLevel, this.speeds.length - 1);
            this.changeSpeed(this.speeds[this.speedLevel]);
          } else other.node.emit("fly");
        }
        if (other.getComponent("stub-tag") && _global2.default.account.gameCtl.state() !== GameState.quick) {
          this.speedLevel--;
          this.speedLevel = Math.max(this.speedLevel, 0);
          this.changeSpeed(this.speeds[this.speedLevel]);
          cc.audioEngine.play(this.beAttacked, false, 1);
          var animate = this.body.getComponent(cc.Animation);
          animate.play("be-attacked");
        }
        if (other.getComponent("coin")) {
          cc.audioEngine.play(this.eatAudio, false, 1);
          other.node.emit("fly");
          _global2.default.account.playerData.goldCount++;
        }
      },
      changeSpeed: function changeSpeed(newSpeed) {
        _global2.default.account.playerData.speed = newSpeed;
        this.node.emit("time-scale", newSpeed / this.speeds[0]);
        _global2.default.account.gameCtl.event.fire("speed-changed", {
          currentLevel: this.speedLevel,
          maxLevel: this.speeds.length - 1,
          speedValue: newSpeed
        });
      },
      enterSuperMode: function enterSuperMode() {
        this.body.active = false;
        this.car.active = true;
        this.passedTimeSuper = 0;
        this.carAudiosID = cc.audioEngine.play(this.auCar, true);
        this.changeSpeed(this.superSpeed);
      },
      exitSuperMode: function exitSuperMode() {
        this.passedTimeSuper = 0;
        this.body.active = true;
        this.car.active = false;
        this.carAudiosID && cc.audioEngine.stop(this.carAudiosID);
        _global2.default.account.gameCtl.qucikEnd();
        this.changeSpeed(this.speeds[this.speedLevel]);
      },
      update: function update(dt) {
        if (!_global2.default.account.gameCtl.isRunning() || _global2.default.account.gameCtl.state() === GameState.tipsBegan) return;
        var speed = 0;
        if (_global2.default.account.gameCtl.state() !== GameState.quick) speed = this.speeds[this.speedLevel]; else {
          speed = this.superSpeed;
          this.passedTimeSuper += dt;
          this.passedTimeSuper >= this.superPowerDuration && this.exitSuperMode();
        }
        if (_global2.default.account.gameCtl.state() === GameState.endScene) {
          this.node.x += speed * dt;
          if (this.node.x > 600) {
            this.node.active = false;
            this.rootNode.active = false;
            this.exitSuperMode();
            _global2.default.account.gameCtl.nextScene();
          }
          return;
        }
        var distance = speed * dt / 150;
        _global2.default.account.playerData.distance += distance;
        this.distanceCurrentScene += distance;
        if (this.distanceCurrentScene > _global2.default.account.playerData.sceneDistance && _global2.default.account.gameCtl.state() !== GameState.endScene) {
          this.rootNode.getComponent(cc.Animation).play("player_out");
          _global2.default.account.gameCtl.setState(GameState.endScene);
        }
      },
      onDisable: function onDisable() {
        this.carAudiosID && cc.audioEngine.stop(this.carAudiosID);
      }
    });
    cc._RF.pop();
  }, {
    "./../global": "global"
  } ],
  "pool-manager": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fc79bJsEulMzJmmovwARlL5", "pool-manager");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var PoolManager = function PoolManager() {
      var that = {};
      var PoolResources = {};
      var PrefabResources = {};
      that.createPool = function(type, prefab, count) {
        if (!PoolResources.hasOwnProperty(type)) {
          PoolResources[type] = new cc.NodePool();
          PrefabResources[type] = prefab;
          var c = 5;
          count && (c = count);
          for (var i = 0; i < c; i++) {
            var node = cc.instantiate(prefab);
            PoolResources[type].put(node);
          }
        }
      };
      that.getNode = function(type) {
        var node = null;
        if (PoolResources.hasOwnProperty(type)) {
          if (PoolResources[type].size() > 0) node = PoolResources[type].get(); else {
            node = cc.instantiate(PrefabResources[type]);
            PoolResources[type].put(node);
          }
          return node;
        }
        return null;
      };
      that.putNode = function(type, node) {
        PoolResources.hasOwnProperty(type) && PoolResources[type].put(node);
      };
      return that;
    };
    exports.default = PoolManager;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {} ],
  "resources-manager": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "e6b76+5sa1COIL89xTdsJxz", "resources-manager");
    "use strict";
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var ResourcesManager = function ResourcesManager() {
      var that = {};
      that.resources = {};
      var load = function load(resPath, cb) {
        cc.loader.loadRes(resPath, function(err, res) {
          err && console.log("err =" + JSON.stringify(err));
          cb && cb(resPath, res);
        });
      };
      that.loadList = function(resList, cb) {
        var loadIndex = 0;
        var loadCb = function loadCb(resPath, res) {
          that.resources[resPath] = res;
          loadIndex++;
          loadIndex === resList.length && cb && cb();
        };
        for (var i = 0; i < resList.length; i++) load(resList[i], loadCb);
      };
      return that;
    };
    exports.default = ResourcesManager;
    module.exports = exports["default"];
    cc._RF.pop();
  }, {} ],
  "scroll-once": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "93bf1dQ9TJE6YtgBQrp2Ojr", "scroll-once");
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
        bgList: {
          default: [],
          type: cc.Node
        },
        bgSpeed: 0,
        speedOffset: 0,
        bgType: "middle",
        speedScaleRate: 0
      },
      onLoad: function onLoad() {
        var self = this;
        "middle" === self.bgType && (self.bgSpeed = _global2.default.account.playerData.speed + self.speedOffset);
        "forward" === self.bgType && (self.bgSpeed = _global2.default.account.playerData.speed + 80 + self.speedOffset);
        "after" === self.bgType && (self.bgSpeed = _global2.default.account.playerData.speed - 200 + self.speedOffset);
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          if ("middle" === self.bgType) {
            console.log("on speed changed,", opt.speedValue);
            self.bgSpeed = opt.speedValue + self.speedOffset;
          }
          if ("forward" === self.bgType) {
            console.log("on speed changed,", opt.speedValue);
            self.bgSpeed = opt.speedValue + 80 + self.speedOffset;
          }
          if ("after" === self.bgType) {
            console.log("on speed changed,", opt.speedValue);
            self.bgSpeed = opt.speedValue - 200 + self.speedOffset;
          }
        });
      },
      update: function update(dt) {
        if (!_global2.default.account.gameCtl.isRunning() || this.bgList.length <= 0 || _global2.default.account.gameCtl.state() === GameState.endScene) return;
        var dis = this.bgSpeed * dt * defines.timeScale;
        for (var i in this.bgList) this.bgList[i].x -= dis;
        this.bgList[0].x <= -2e3 && this.node.removeFromParent();
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
  } ],
  scroll: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "80a351DW0ZOAY4jrUIzlhBr", "scroll");
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
        bgList: {
          default: [],
          type: cc.Node
        },
        bgSpeed: 0,
        bgType: "middle",
        speedScaleRate: 0,
        speedOffset: 0
      },
      onLoad: function onLoad() {
        var self = this;
        "middle" === self.bgType && (self.bgSpeed = _global2.default.account.playerData.speed + self.speedOffset);
        "forward" === self.bgType && (self.bgSpeed = _global2.default.account.playerData.speed + 80 + self.speedOffset);
        "after" === self.bgType && (self.bgSpeed = _global2.default.account.playerData.speed - 200 + self.speedOffset);
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          if ("middle" === self.bgType) {
            console.log("on speed changed,", opt.speedValue);
            self.bgSpeed = opt.speedValue + self.speedOffset;
          }
          if ("forward" === self.bgType) {
            console.log("on speed changed,", opt.speedValue);
            self.bgSpeed = opt.speedValue + 80 + self.speedOffset;
          }
          if ("after" === self.bgType) {
            console.log("on speed changed,", opt.speedValue);
            self.bgSpeed = opt.speedValue - 200 + self.speedOffset;
          }
        });
      },
      update: function update(dt) {
        if (!_global2.default.account.gameCtl.isRunning() || _global2.default.account.gameCtl.state() === GameState.endScene) return;
        var dis = this.bgSpeed * dt * defines.timeScale;
        for (var i in this.bgList) this.bgList[i].x -= dis;
        if (this.bgList[0].x <= -1e3) {
          var item = this.bgList.shift();
          var lastItem = this.bgList[this.bgList.length - 1];
          item.x = lastItem.x + lastItem.width;
          this.bgList.push(item);
        }
      }
    });
    cc._RF.pop();
  }, {
    "./../../global": "global"
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
        terrainPrefabs: [ cc.Prefab ],
        ratesShowTerrain: [ cc.Float ],
        activeEnemies: [ cc.Prefab ],
        wordEnemies: [ cc.Prefab ],
        superModeTerrain: cc.Prefab,
        distanceAddTerrain: 10,
        durationAddEnemy: 20,
        durationAddWordEnemy: 60,
        durationAddSuperTerrain: 3,
        intervalAddWordEnemy: 3,
        initPosNodeTerrain: cc.Node,
        initPosNodeActiveEnemy: cc.Node
      },
      onLoad: function onLoad() {
        this.passedTimeForTerrain = 0;
        this.passedTimeForEnemy = 0;
        this.passedTimeForWordEnemy = 0;
        this.passedTimeForSuper = 0;
        this.totalTerrains = 0;
        this.sceneIndex = _global2.default.account.gameCtl.getSceneIndex();
        this.terrains = [];
        var prefabs = this.terrainPrefabs[this.sceneIndex];
        for (var i = 0; i < prefabs.length; i++) this.terrains.push(cc.instantiate(prefabs[i]));
      },
      randTerrain: function randTerrain(terrainList, rateList) {
        if (terrainList.length !== rateList.length) {
          console.error("terrainList and rateList must have same length");
          return;
        }
        var v = Math.random();
        var ret = null;
        for (var i = 0; i < rateList.length; i++) {
          if (i >= rateList.length - 1) {
            ret = cc.instantiate(terrainList[i]);
            break;
          }
          if (v < rateList[i]) {
            ret = cc.instantiate(terrainList[i]);
            break;
          }
        }
        return ret;
      },
      update: function update(dt) {
        if (!_global2.default.account.gameCtl.isRunning() || _global2.default.account.gameCtl.state() === GameState.tipsBegan) return;
        if (_global2.default.account.playerData.distance % _global2.default.account.playerData.sceneDistance >= _global2.default.account.playerData.sceneDistance - 20 || _global2.default.account.gameCtl.state() === GameState.endScene) return;
        if (_global2.default.account.gameCtl.state() === GameState.quick) {
          this.passedTimeForSuper -= dt;
          if (this.passedTimeForSuper <= 0) {
            console.log("add super terrain");
            this.passedTimeForSuper = this.durationAddSuperTerrain;
            var terrain = cc.instantiate(this.superModeTerrain);
            terrain.position = this.initPosNodeTerrain.position;
            terrain.parent = this.initPosNodeTerrain.parent;
          }
        }
        this.passedTimeForTerrain += dt;
        if (parseInt(_global2.default.account.playerData.distance % _global2.default.account.playerData.sceneDistance) % this.distanceAddTerrain === 0 && this.passedTimeForTerrain >= 1) {
          this.passedTimeForTerrain = 0;
          this.totalTerrains % this.intervalAddWordEnemy === 0 && this.totalTerrains > 0 ? this.addWordEnemy() : this.addTerrain();
          this.totalTerrains++;
        }
        this.passedTimeForEnemy += dt;
        if (this.passedTimeForEnemy >= this.durationAddEnemy) {
          this.addActiveEnemy();
          this.passedTimeForEnemy = 0;
        }
      },
      addActiveEnemy: function addActiveEnemy() {
        var v = Math.random();
        if (v > .5) return;
        var enemy = cc.instantiate(this.activeEnemies[this.sceneIndex]);
        enemy.position = this.initPosNodeActiveEnemy.position;
        enemy.parent = this.initPosNodeActiveEnemy.parent;
      },
      addTerrain: function addTerrain() {
        var terrain = this.randTerrain(this.terrainPrefabs, this.ratesShowTerrain);
        if (this.lastTerrain && this.lastTerrain.width + this.lastTerrain.x > this.initPosNodeTerrain.position.x - 400) return;
        terrain.position = this.initPosNodeTerrain.position;
        for (var i in terrain.children) terrain.children[i].enable = true;
        terrain.parent = this.initPosNodeTerrain.parent;
        this.lastTerrain = terrain;
      },
      addWordEnemy: function addWordEnemy() {
        var enemy = cc.instantiate(this.wordEnemies[this.sceneIndex]);
        enemy.position = this.initPosNodeTerrain.position;
        enemy.parent = this.initPosNodeTerrain.parent;
      }
    });
    cc._RF.pop();
  }, {
    "../global": "global"
  } ],
  "stub-tag": [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "51b7dxuR9NEFLO8XP7DD1NP", "stub-tag");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      start: function start() {}
    });
    cc._RF.pop();
  }, {} ],
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
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {});
      },
      update: function update(dt) {
        _global2.default.account.gameCtl.isRunning() && this.speedX && false === this.fly && (this.node.position = cc.p(this.node.position.x - this.speedX * dt * defines.timeScale, this.node.position.y));
        this.node.position.x + .5 * this.node.width < -.5 * cc.winSize.width && (this.node.dead = true);
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
        totalTime: 0,
        progressTime: {
          default: null,
          type: cc.ProgressBar
        },
        processTimeSprite: cc.Node,
        btnJump: {
          default: null,
          type: cc.Node
        },
        progressSpeed: {
          default: null,
          type: cc.ProgressBar
        },
        labelCoinCount: {
          default: null,
          type: cc.Label
        },
        labelDistance: cc.Label,
        progressSuperPower: cc.ProgressBar,
        pauseLayer: {
          default: null,
          type: cc.Prefab
        },
        particle: cc.Node
      },
      start: function start() {},
      onLoad: function onLoad() {
        var _this = this;
        var self = this;
        this.labelCoinCount.string = _global2.default.account.playerData.goldCount;
        this.progressSpeed.progress = _global2.default.account.playerData.speedLevel / 4;
        this.progressTime.progress = (this.totalTime - _global2.default.account.playerData.passedTime) / this.totalTime;
        this.progressSuperPower.progress = _global2.default.account.playerData.power / 4;
        _global2.default.account.gameCtl.event.on("speed-changed", function(opt) {
          self.progressSpeed.progress = opt.currentLevel / opt.maxLevel;
        });
        _global2.default.account.gameCtl.event.on("quick", function(opt) {
          console.log("quick mode begin");
          self.btnJump.getComponent(cc.Button).enabled = false;
        });
        _global2.default.account.gameCtl.event.on("quick-end", function(opt) {
          console.log("game resume");
          self.btnJump.getComponent(cc.Button).enabled = true;
          self.progressSuperPower.progress = _global2.default.account.playerData.power / 4;
        });
        _global2.default.account.gameCtl.onTipsBegan(function(data) {
          _this.btnJump.opacity = 100;
        });
        _global2.default.account.gameCtl.onTipsEnd(function(data) {
          _this.btnJump.opacity = 255;
          _this.node.getComponent(cc.Animation).play("speed_blink");
          _this.progressSuperPower.progress = _global2.default.account.playerData.power / 4;
        });
        _global2.default.account.gameCtl.onAttackEnd(function() {
          _this.btnJump.opacity = 255;
          _this.runButton.opacity = 255;
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
        this.passedPixel = 0;
      },
      _keyHandler: function _keyHandler(code, isDown) {
        switch (code) {
         case cc.KEY.up:
         case cc.KEY.space:
          console.log("跳");
          255 === this.btnJump.opacity && _global2.default.account.gameCtl.event.fire("jump");
          break;

         case cc.KEY.enter:
          console.log("加速");
          this.isCanRun && _global2.default.account.gameCtl.quick();
        }
      },
      onPauseClicked: function onPauseClicked() {
        var node = cc.instantiate(this.pauseLayer);
        node.parent = this.node;
        _global2.default.account.gameCtl.pause();
        cc.audioEngine.pauseAll();
      },
      onButtonClick: function onButtonClick(event, customData) {
        switch (customData) {
         case "up-button":
          255 === this.btnJump.opacity && _global2.default.account.gameCtl.event.fire("jump");
        }
      },
      update: function update(dt) {
        if (_global2.default.account.gameCtl.isRunning()) {
          _global2.default.account.playerData.passedTime += dt;
          this.progressTime.progress = (this.totalTime - _global2.default.account.playerData.passedTime) / this.totalTime;
          this.particle.x = this.progressTime.node.x + this.processTimeSprite.width;
          this.labelCoinCount.string = _global2.default.account.playerData.goldCount + "";
          this.labelDistance.string = parseInt(_global2.default.account.playerData.distance);
        }
      }
    });
    cc._RF.pop();
  }, {
    "../global": "global"
  } ],
  ui_question_layer: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "d915eFyCSdCor4UBzNBwfsh", "ui_question_layer");
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
        timeCutDownLabel: {
          default: null,
          type: cc.Label
        },
        resultLabel: {
          default: null,
          type: cc.Label
        },
        labelTip: cc.Label,
        labelWord: cc.Label,
        spAnswerList: [ cc.Sprite ],
        spReadImage: cc.Sprite,
        auCardIn: cc.AudioClip,
        auSuccess: cc.AudioClip,
        nodeChoose: cc.Node,
        nodeRead: cc.Node
      },
      getQuestion: function getQuestion() {
        var list = _global2.default.account.playerData.questions;
        if (list.length <= 0) {
          console.error("question list is empty");
          return;
        }
        _global2.default.account.playerData.questionIndex >= list.length && (_global2.default.account.playerData.questionIndex = 0);
        return list[_global2.default.account.playerData.questionIndex];
      },
      changeImageTexture: function changeImageTexture(imageSprite, url) {
        var texture = cc.textureCache.getTextureForKey(url);
        if (texture) {
          imageSprite.spriteFrame.clearTexture();
          imageSprite.spriteFrame.setTexture(texture);
        }
      },
      showQuestion: function showQuestion() {
        cc.audioEngine.play(this.auCardIn);
        var question = this.getQuestion();
        console.log("question:", question);
        this.question = question;
        if (1 === question.type) {
          this.nodeRead.active = true;
          this.nodeChoose.active = false;
          this.labelTip.string = "读单词";
          this.labelWord.string = question.word;
          this.changeImageTexture(this.spReadImage, question.image_url);
          this.animation.play("an_show_question_read");
        } else {
          this.nodeRead.active = false;
          this.nodeChoose.active = true;
          this.labelTip.string = "选择答案";
          this.labelWord.string = question.word;
          for (var i = 0; i < this.question.image_urls.length; i++) {
            var url = this.question.image_urls[i];
            var sprite = this.spAnswerList[i];
            this.changeImageTexture(sprite, url);
          }
          this.animation.play("an_show_question_choose");
        }
        _global2.default.account.playerData.questionIndex++;
      },
      onLoad: function onLoad() {
        cc.loader.load([ "http://47.52.247.115/1.jpg", "http://47.52.247.115/2.png", "http://47.52.247.115/3.jpg" ], function(err, items) {
          if (err) {
            console.error(err);
            return;
          }
          for (var i in items.map) cc.textureCache.getTextureForKey(items.map[i].content) || cc.textureCache.addImage(items.map[i].content);
        });
        var self = this;
        this.animation = this.node.getComponent(cc.Animation);
        this.animation.on("finished", this.onUiAnimationFinished.bind(this));
        _global2.default.account.gameCtl.onTipsBegan(function(data) {
          console.log("开始答题了" + JSON.stringify(data));
          self.node.active = true;
          self.timeCutDown = 5;
          self.showQuestion();
        });
      },
      start: function start() {
        this.node.active = false;
      },
      hideQuestion: function hideQuestion() {
        1 === this.question.type ? this.animation.play("an_hidden_question_read") : this.animation.play("an_hidden_question_choose");
        _global2.default.account.playerData.power++;
        _global2.default.account.gameCtl.tipsEnd({
          result: "success"
        });
        if (_global2.default.account.playerData.power >= 4) {
          _global2.default.account.gameCtl.quick();
          _global2.default.account.playerData.power = 0;
        }
        cc.audioEngine.play(this.auSuccess);
      },
      onUiAnimationFinished: function onUiAnimationFinished(event) {
        var state = event.detail;
        var type = event.type;
        state.name.indexOf("_hidden_") >= 0 && "finished" === type && (this.node.active = false);
      },
      update: function update(dt) {
        if (_global2.default.account.gameCtl.isRunning() && this.timeCutDown > 0) {
          this.timeCutDown -= dt;
          if (this.timeCutDown <= 0) {
            this.timeCutDown = 0;
            this.resultLabel.string = "真棒!";
            this.hideQuestion();
          }
          this.timeCutDownLabel.string = Math.floor(this.timeCutDown) + "";
        }
      },
      onChooseAnswerClicked: function onChooseAnswerClicked(event, customData) {
        if (parseInt(customData) !== this.question.answer_index) {
          _global2.default.account.gameCtl.tipsEnd({
            result: "fail"
          });
          this.node.active = false;
          return;
        }
        this.hideQuestion();
      }
    });
    cc._RF.pop();
  }, {
    "../global": "global"
  } ]
}, {}, [ "account", "game-ctl", "player-data", "DragonBonesCtrl", "dargon-bone-ctl", "distance-node", "jump", "scroll-once", "scroll", "stub", "game", "player", "coin", "enemy", "pauseLayer", "stub-tag", "stub-controller", "ui-controller", "ui_question_layer", "global", "main", "audio", "event-listener", "pool-manager", "resources-manager" ]);
//# sourceMappingURL=project.dev.js.map