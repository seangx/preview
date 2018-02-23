;
var WXSTAT={
  host:"mobile.mmears.com",
  ready:false,
  init:false,
  configData:false,
  apiList:["onMenuShareTimeline",
    "onMenuShareAppMessage",
    "onMenuShareQQ",
    "onMenuShareWeibo",
    "onMenuShareQZone",
    "hideOptionMenu",
    //录音部分
    "startRecord",
    "stopRecord",
    "onVoiceRecordEnd",
    //播放音频部分
    "playVoice",
    "pauseVoice",
    "stopVoice",
    "onVoicePlayEnd",
    //音频上传下载部分
    "uploadVoice",
    "downloadVoice",
    "getNetworkType",
    "scanQRCode",
    "showOptionMenu",
    "hideMenuItems",
    "showMenuItems",
    "closeWindow",
    "scanQRCode",
    "chooseWXPay"
  ],
  fns:[]
};
var Utils=window.MUtils={
  getOS:function(){
    var result="";
    var ua=navigator.userAgent;
    if( /windows\s+nt\s+([\d\.]+)/i.test(ua) ){
      if( parseFloat( RegExp.$1 ) < 6 ){
        result='xp';
      }
    }else if( /macintosh|darwin/i.test(ua) ){
      result='mac';
    }
    return result;
  },
  getWxSign:function(fn){
    $.ajax({
      url:'/wx/jsapi/signature',
      data:{url:location.pathname+location.search},
      dataType:'json'
    }).done(function(data){
      if(data.result){
        fn && fn( data.datum );
      }
    });
  },
  execWxApi:function(fn){
    wx.ready(function(){
      fn&&fn();
    });
  },
  checkWxReady:function(){
    if(WXSTAT.configData && WXSTAT.sdkload){
      /*config*/
      wx.config($.extend(WXSTAT.configData,{
        jsApiList:WXSTAT.apiList
      }));
      WXSTAT.ready=true;
      for(var tmp;tmp=WXSTAT.fns.shift();){
        Utils.execWxApi(tmp);
      }
    }else{
      setTimeout(function(){
        Utils.checkWxReady();
      },50)
    }
  },
  getWxAuthLink:function(eventName,callback){
    var url=str_format("/api/event/event_url?event_name={event_name}&redirect_url={callback}",{
      event_name:eventName,
      callback:callback
    });
    return url;
  },
  isMpAuth:function(fn){
    //微信是否绑定了Mmears帐号
    $.ajax({
      url:"/pay/api/mp_authorized",
      dataType:'json'
    }).done(function(data){
      if(data.code===0 && data.result && data.result.code_name==="WX_MP_AUTHORIZED"){
        WXSTAT["_mp_auth"]=true;
        fn(true,data);
      }else{
        WXSTAT["_mp_auth"]=false;
        fn(false,data);
      }
      WXSTAT["_mp_auth_data"]=data;
    }).fail(function(){
      fn(false);
    });
  },
  isWxAuth:function(fn){
    //这个接口会创建一个裸号码，慎重使用
    $.ajax({
      url:"/api/wechat/pass_token",
      dataType:"json"
    }).done(function(data){
      if(data.result && data.result.code_name==="SUCCESS"){
        fn(true,data);
      }else{
        fn(false,data);
      }
    }).fail(function(){
      fn(false,{fail:true});
    });
  },
  isWxToken:function(fn){
    //用户点了微信授权服务号登录
    if("_wx_token" in WXSTAT){
      fn(WXSTAT["_wx_token"]);
    }else{
      $.ajax({
        url:"/api/wechat/wx_token",
        dataType:"json"
      }).done(function(data){
        if(data.result && data.result.code_name==="SUCCESS"){
          WXSTAT["_wx_token"]=true;
          fn(true,data);
        }else{
          WXSTAT["_wx_token"]=false;
          fn(false,data);
        }
      }).fail(function(){
        fn(false,{fail:true});
      });
    }
  },
  wxSdkInit:function(){
    if(location.hostname!==WXSTAT.host){
      return false;
    }
    if(WXSTAT.init===false){
      WXSTAT.init=true;

      Utils.getWxSign(function(data){
        WXSTAT.configData=data;
      });
      Utils.loadSdkScript("//res.wx.qq.com/open/js/jweixin-1.2.0.js",
      function(){
        WXSTAT.sdkload=true;
      });
    }
    Utils.checkWxReady();
  },
  wxReady:function(fn){
    if( WXSTAT.ready ){
      Utils.execWxApi( fn );
    }else{
      WXSTAT.fns.push(fn);
      Utils.wxSdkInit();
    }
  },
  loaded:{

  },
  supportLocal:(window.JSON && 
                window.JSON.stringify && 
                window.JSON.parse &&
                window.localStorage &&
                window.localStorage.setItem &&
                window.localStorage.getItem &&
                window.localStorage.removeItem &&
                window.localStorage.key
               ),
  getLocal:function(key){
    var now=+new Date;
    if( Utils.supportLocal ){
      var data=window.localStorage.getItem(key);
      var result;
      
      try{
        result=window.JSON.parse(data);
      }catch(e){
        result={};
      }

      if( result && result.expire && result.time ){
        if(result.expire+result.time > now){
          //未过期
          return result.value;
        }else{
          Utils.removeLocal( key );
        }
      }else{
        return result && result.value;
      }
    }
  },
  removeLocal:function(key){
    try{
      window.localStorage.removeItem(key);
    }catch(e){}
  },
  setLocal:function(key,value,expire){
    if( Utils.supportLocal ){

      var data=JSON.stringify({
        value:value,
        time:+new Date,
        expire:expire
      });

      window.localStorage.setItem(key,data);
    }
  },
  loadSdkScript:function(url,fn){
    if(Utils.loaded[url]){
      fn();
      return;
    }
    var sc=document.createElement("script");
    sc.src=url;
    sc.onload=function(){
      fn();
      Utils.loaded[url]=true;
    }
    sc.onerror=function(){
      fn(false);
    }
    document.body.appendChild(sc);
  },
  loadScript:function(url,fn){
    Utils.loadData(url,function(data){
      if(data){
        var sc=document.createElement("script");
        sc.innerHTML=data;
        document.body.appendChild( sc );
        fn();
      }
      fn(false);
    });
  },
  loadData:function(url,fn){
    var local=Utils.getLocal(url);
    if(local){
      fn(local);
    }else{
      Utils.getDataByUrl(url,function(data){
        if(data){
          Utils.setLocal(url,data);
        }
        fn(data);
      });
    }
  },
  getDataByUrl:function(url,fn){
    $.ajax({
      url:url,
      dataType:'text'  
    }).done(function(data){
      fn && fn(data)
    }).fail(function(){
      fn && fn(false);
    });
  },
  isPortrait:function(){
    if(window.orientation){
      return window.orientation===0 || window.orientation===180;
    }
    return true;
  },
  isWx:function(){
    return /micromessenger/i.test(navigator.userAgent);
  },
  isMobile:function(){
    var ua=navigator.userAgent;
    if(ua.indexOf("Mobile")!==-1){
      return true;
    }else if( /Android|iPhone|Windows Phone|Nexus|MiuiBrowser/.test(ua) ){
      return true;
    }
    return false;
  },
  getStrkey:(function(){
    var a="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var strlen=a.length;
    return function(len){
      var tmp;
      var result="";
      for(var i=0;i<len;i++){
        tmp=Math.floor( Math.random()*strlen );
        result+=a[tmp];
      }
      return result
    }
  })(),
  requireLogin:function(fn){
    var fllowup=( location.href );
    $.ajax({
      url:"/api/id/check",
      type:"post",
      dataType:'json'
    }).done(function(data){
      if(data.code===0){
        //已经登录
        fn.call(this,data);
        Utils.removeLoading();
      }else{
        if(data.code===400010010){
          location.href=data.result
        }
      }
    }).fail(function(){
      location.href="/id/login";
    });
  },
  removeLoading:function(){
    $(document.body).removeClass("body-loading");
  },
  getStudentInfo:function(fn){
    $.ajax({
      url:"/api/student/info",
      dataType:'json'
    }).done(function(data){
      if(data.code===0){
        fn(data.result);
      }else{
        fn({});
      }
    }).fail(function(){
      fn({});
    })
  },
  formatTime:function(time){
    var d=new Date(time);
    var month=Utils.fillZero( d.getMonth()+1 );
    var date=Utils.fillZero( d.getDate() );
    var weekDay=["周日","周一","周二","周三","周四","周五","周六"][d.getDay()];
    var weekDay2=["星期天","星期一","星期二","星期三","星期四","星期五","星期六"][d.getDay()];
    var year=d.getFullYear();
    var hours=Utils.fillZero(d.getHours());
    var min=Utils.fillZero(d.getMinutes());
    var second=Utils.fillZero(d.getSeconds());
    return {
      date:month+"/"+date,
      day:weekDay,
      day_zh:weekDay,
      day_ex:weekDay2,
      year:year,
      ymd:year+"-"+month+"-"+date,
      md:month+"-"+date,
      time:hours+":"+min+":"+second
    } 
  },
  fillZero:function(num){
    if(num<10){
      return "0"+num
    }
    return ""+num;
  },
  /*
  formatTime:function( time ){
    //时间转化成想要的内容
    var Mlist={
      "Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06",
      "Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"
    };
    var DayList={
      "Mon":"周一",
      "Tue":"周二",
      "Wed":"周三",
      "Thu":"周四",
      "Fri":"周五",
      "Sat":"周六",
      "Sun":"周日"
    };
    var d=(new Date(time)+"").split(/\s+/);
    return {
      date:Mlist[d[1]]+"/"+d[2],
      day:d[0],
      day_zh:DayList[d[0]],
      year:d[3],
      time:d[4]
    } 
  },*/
  loadFontsByURL:function(url,callback){
    if(typeof window.FileReader==='function'){
      var xhr=new XMLHttpRequest();
      var loadError=false;
      xhr.open("GET",url,true);
      xhr.responseType="blob";
      xhr.onreadystatechange=function(e){
        if(this.readyState==4 && this.status==200){
          var blob=this.response;
          var reader=new FileReader();
          reader.onload=function(){
            try{
              window.localStorage.setItem(url,this.result);
            }catch(e){
              callback(false)
            }
            callback(this.result);
          }
          reader.readAsDataURL(blob);
        }else{
          callback(false)
        }
      }
      xhr.send();
    }
  },
  sendEvent:function(cat,action,label,value){
    var e=['_trackEvent',cat,action];
    label && e.push(label);
    value && e.push(value);
    window._hmt && window._hmt.push(e);
  },
  sendEventOnce:function(cat,action,label,value){
    var val;
    var s_key=cat+action+(label||"")+(value||"");
    try{
      val=sessionStorage.getItem(s_key);
    }catch(e){}
    if(!val){
      try{
        sessionStorage.setItem(s_key,1);
      }catch(e){}
      Utils.sendEvent(cat,action,label,value);
    }
  },
  setFonts:function(url,name){
    var st=document.createElement("style");
    st.innerHTML='@font-face{font-family:'+name+'; src: url('+url+');}';
    document.body.appendChild(st);
  },
  loadFonts:function(url,name){
    var dataLocal=window.localStorage.getItem(url);
    if(dataLocal){
      this.setFonts(dataLocal,name);
    }else{
      this.loadFontsByURL(url,function(result){
        if(result){
          this.setFonts(result,name);
        }else{
          this.setFonts(url,name);
        }
      }.bind(this));
    }
  },
  getParam:(function (){
    var params={};
    $.each( location.search.substring(1).split("&"),function(index,item){
      var tmp=item.split("=");
      params[tmp[0]]=tmp.slice(1).join("=");
    })
    return function(key){
      return params[key];
    }
  })(),
  log:(function(debug){
    debug=debug||(location.search.indexOf("debug")!==-1);
    var div=$(document.createElement("div")).addClass("debug-info-container");
    if(debug){
      div.css({
        "position":"absolute",
        "top":0,
        "left":0,
        "background":"#fff",
        "word-break": "break-all",
        "color": "#000"
      });
    }else{
      div.hide();
    }
    $(document.body).append(div);
    return function(info){
      var con=$(document.createElement("div")).addClass("debug-info-item");
      var str="";
      try{
        str=JSON.stringify(info);
      }catch(e){
        str=info+"";
      }
      con.html("<span class='debug-info-time'>"+(+new Date)+"</span>:<span class='debug-info-itemcon'>"+str+"</span>")
      div.append(con);
    }
  })(window.__debug__)
}
