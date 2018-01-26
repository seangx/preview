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
  test: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "637491nATVC74dTGbQqpBON", "test");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {},
      onLoad: function onLoad() {
        var self = this;
        console.log("os type:", navigator.userAgent || navigator.vendor || window.opera || window.webkit);
        navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        }).then(function(stream) {
          console.log("初始化设备....");
          var context = new AudioContext();
          var source = context.createMediaStreamSource(stream);
          self.rec = new Recorder(source);
        }).catch(function(e) {
          console.log(e);
        });
      },
      onRecordBegin: function onRecordBegin(event) {
        console.log("开始录音......");
        this.rec.stop();
        this.rec.clear();
        this.rec.record();
      },
      onRecordEnd: function onRecordEnd(event) {
        console.log("结束录音......");
        var self = this;
        self.rec.stop();
        self.rec.exportWAV(function(data) {
          self.audioUrl = window.URL.createObjectURL(data);
          console.log(self.audioUrl);
        }, "audio/wav");
      },
      onPlayRecord: function onPlayRecord(event) {
        console.log("结束并播放....");
        var self = this;
        self.rec.getBuffer(function getBufferCallback(buffers) {
          var newSource = self.rec.context.createBufferSource();
          var newBuffer = self.rec.context.createBuffer(2, buffers[0].length, self.rec.context.sampleRate);
          newBuffer.getChannelData(0).set(buffers[0]);
          newBuffer.getChannelData(1).set(buffers[1]);
          newSource.buffer = newBuffer;
          newSource.connect(self.rec.context.destination);
          newSource.start(0);
        });
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "test" ]);