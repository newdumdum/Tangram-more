/**
 * @author 史纯华(shichunhua)
 * @fileoverview 负责执行DOM的各种效果
 * 				扩展到baidu.more.Tween
 * 				baidu.more.Tween 提供接口(方法) 具体参数见对应方法注释:
 * 					stop: 停止动画
 * @version 1.0.0.0
 */
 
baidu.more = baidu.more || {};

(function(){	
	/**
	 * Tween构造函数
	 * @param {HTMLElement} node 要执行动画的DOM节点
	 * @param {String} propertyname 要执行的DOM的相应样式名称 如:height
	 * @param {Number} startvalue  初始值
	 * @param {Number} endvalue 结束值
	 * @param {Object} easing 要使用的缓动类的方法, 如果未指定, 则默认使用baidu.more.Easing.Linear
	 * @param {Number} duration  效果执行时间 单位为:秒
	 * @param {Function} callback  效果执行完成后的回调方法
	 */
    var Tween = function(node, propertyname, startvalue, endvalue, easing, duration, callback){
		this._node = node;
		this._propertyName = propertyname;
		this._startValue = startvalue;
		this._endValue = endvalue;
		this._easing = easing || baidu.more.Easing.Linear;
		this._duration = duration < 0.01 ? 0.01 : duration;
		this._callback = callback;
		this._pixelDictionary = ['width', 'height', 'left', 'top', 'right', 'bottom', 'padding', 'padding-left', 'padding-top', 'padding-bottom', 'padding-right', 'margin', 'margin-left', 'margin-top', 'margin-bottom', 'margin-right', 'font-size', 'background-position', 'line-height', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width'];
		this._runInterval = null;
		this._timeLine = 10;
		this._needPixel = false;
		this._isIE = baidu.browser.ie;
		
		if(this._checkParams()){
			this._needPixel = this._getIndex(this._pixelDictionary, this._propertyName) != -1;
			this._run();
		}
    };

	Tween.prototype = {
		/**
		 * 验证参数是否合法
		 */
		_checkParams: function(){
            var canPass = this._node != null &&
            this._node.getAttribute != null &&
            this._propertyName != null;
			
			var sePass = false;
			if(this._propertyName.indexOf('color') != -1){
				var reg = /(^\s*)|(\s*$)/g;			
	            sePass = !!this._startValue && this._startValue.replace(reg, '') != ''
						 && !! this._endValue && this._endValue.replace(reg, '') != ''
			             && !isNaN(this._duration);
			}else{
	            sePass = !isNaN(this._startValue) &&
			             !isNaN(this._endValue) &&
			             !isNaN(this._duration);
			}
            
            return canPass && sePass;
		},
		
		/**
		 * 获取数组索引值
		 * @param {Array} arr
		 * @param {Object} value
		 */
		_getIndex: function(arr, value){
			for(var i = 0 ; i < arr.length ; i ++){
				if(arr[i] == value){
					return i;
				}
			}
			return -1;
		},
		/**
		 * 取值, 给出是否加上'px'
		 * @param {Object} value
		 */
		_getValue: function(value){
			return this._needPixel ? value + 'px' : value;
		},
		
		_run: function(){
			var self = this, curTime = 0;
			if(/color|background-color|border-color/i.test(this._propertyName)){
				this._runColor();
				return;
			}
			this._runInterval = window.setInterval(function(){
				if(!self._node){
					self._stop();
					return;
				}
				var curValue = Math.ceil(self._easing(curTime, self._startValue, self._endValue - self._startValue, self._duration * 1000));
				if(self._propertyName == 'opacity'){
					curValue = curValue / 100;
				}
				
				if(self._propertyName == 'scrollLeft' || self._propertyName == 'scrollTop'){
					self._node[self._propertyName] = self._getValue(curValue);
				}else{
					var obj = {};
					obj[self._propertyName] = self._getValue(curValue);				
					baidu.setStyles(self._node, obj);
					if(self._isIE && self._propertyName == 'opacity'){
						self._node.style.filter = 'Alpha(opacity='+curValue * 100+')';
					}
				}
				
				if(curTime >= self._duration * 1000){
					window.clearInterval(self._runInterval);
					self._runInterval = null;
					
					if(self._propertyName == 'scrollLeft' || self._propertyName == 'scrollTop'){
						self._node[self._propertyName] = self._getValue(self._endValue);
					}else{
						var endObj = {};
						endObj[self._propertyName] = self._getValue(self._propertyName == 'opacity' ? self._endValue/100 : self._endValue);				
						baidu.setStyles(self._node, endObj);
						if(self._isIE && self._propertyName == 'opacity'){
							self._node.style.filter = 'Alpha(opacity='+self._endValue+')';
						}
					}
					
					self._callback && self._callback();
					self._clear();
				}
				
				curTime += self._timeLine;
			}, this._timeLine);
		},
		
		_runColor: function(){
			var self = this, curTime = 0, startArr = this._getColor(this._startValue), endArr = this._getColor(this._endValue);
			if(!startArr || !endArr){
				return;
			}
			var startRR = startArr[0], startGG = startArr[1], startBB = startArr[2], endRR = endArr[0], endGG = endArr[1], endBB = endArr[2];
			this._runInterval = setInterval(function(){				
				if(!self._node){
					self._stop();
					return;
				}
				
				var rr = Math.ceil(self._easing(curTime, startRR, endRR - startRR, self._duration * 1000));
				var gg = Math.ceil(self._easing(curTime, startGG, endGG - startGG, self._duration * 1000));
				var bb = Math.ceil(self._easing(curTime, startBB, endBB - startBB, self._duration * 1000));

                var obj = {};
                obj[self._propertyName] = 'rgb(' + rr + ', ' + gg + ', ' + bb + ')';
                baidu.setStyles(self._node, obj);

				
				if (curTime >= self._duration * 1000) {
                    window.clearInterval(self._runInterval);
                    self._runInterval = null;
					
                    var endObj = {};
                    endObj[self._propertyName] = self._endValue;
                    baidu.setStyles(self._node, endObj);
                    
                    self._callback && self._callback();
                }
                
                curTime += self._timeLine;
			}, this._timeLine);
		},
		
		/**
		 * 转成16进制颜色
		 * @param {Object} str
		 */
		_getColor: function(str){
			str = str.replace(/(^\s*)|(\s*$)/g, '');
			var rgbReg = /^\s*rgb\s*\(\s*\d{1,3}\s*\,\s*\d{1,3}\s*\,\s*\d{1,3}\s*\)\s*$/i;
			//var sixReg = /^\s*\#([a-zA-Z0-9]{3}|[a-zA-Z0-9]{6})\s*$/;
			var sixRegA = /^\s*\#[a-zA-Z0-9]{3}\s*$/;
			var sixRegB = /^\s*\#[a-zA-Z0-9]{6}\s*$/;
			var arr = [];
			
			if(rgbReg.test(str)){ // 以RGB形式指定的颜色
				nStr = str.split('(')[1].split(')')[0].split(',');
				for(var i = 0 ; i < nStr.length ; i ++){
					arr.push(nStr[i] / 1);
				}
				return arr;
			}
			
			if(sixRegB.test(str)) { // 以16进制指定颜色 (6位)
				var m = str.replace('#', '').match(/(\w|\d){2}/g);
				
				for(var i = 0 ; i < m.length; i ++){
					arr.push(Number('0x' + m[i]).toString(10) / 1);
				}
				return arr;
			}
			
			if(sixRegA.test(str)){ // 以16进制指定颜色(3位)
				var cArr = str.replace('#', '').split('');
				for(var i = 0 ; i < cArr.length ; i ++){
					arr.push(Number('0x' + (cArr[i] + cArr[i])).toString(10) / 1);
				}
				return arr;
			}
			
			return null;
		},
		
		_rgbToColor: function(r, g, b){
			var rr = r.toString(16);
			var gg = g.toString(16);
			var bb = g.toString(16);
			if(rr.length < 2){
				rr = '0' + rr;
			}
			if(gg.length < 2){
				gg = '0' + gg;
			}
			if(bb.length < 2){
				bb = '0' + bb;
			}
			return '#' + rr + gg + bb;
		},
		
		_stop: function(){
			if(this._runInterval){
				window.clearInterval(this._runInterval);
				this._runInterval = null;
			}
			this._clear();
		},
		
		/**
		 * 解决内存漏泄
		 */
		_clear: function(){
			this._node = null;
		},
		
		clear: function(){
			this._clear();
		},
		
		stop: function(){
			this._stop();
		}
    };
	
    // 扩展至baidu.more.Tween
    baidu.more.Tween = Tween;
})();
