var Bullet = function(){
	//user对应的dom元素
	//init()生成
	this.dom = null;
	
	this.init();
}

Bullet.prototype = {
	//子弹移动速度
	movepx : 8,
	//子弹移动频率
	movesp : 10,
	//初始化
	init : function(){
		this.dom = document.createElement('div');
		this.dom.className = 'bullet';
	},
	setPosition : function(left,top){
		console.log(left+"   "+top);
		this.dom.style.left = left + "px";
		this.dom.style.top = top + "px";
		console.log(this.dom.offsetTop);
	},
	//子弹动画，移动
	animation : function(){
		
		var _this = this;
		//处理移动函数
		var process = function(){
			var top = _this.dom.offsetTop;
			
			top = (top - _this.movepx) >= 0 ? (top - _this.movepx) : 0;
			_this.dom.style.top = top + 'px';
			//判断是否移动到尽头，是否击中敌机
			if(top > 0 && !_this.checkBeat()){
				setTimeout(process,_this.movesp);
			}
			else {
				_this.onend();
			}
		}
		process();
	},
	//外部接口，是否击中敌机
	checkBeat : function(){},
	//外部接口，子弹结束事件
	onend : function(){}
}