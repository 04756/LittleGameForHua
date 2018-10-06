var Flyer = function(){
	//user对应的dom元素
	//init()生成
	this.dom = null;
	//是否活着
	this.isLive = true;
	//是否移动中
	this.isMove = false;
	//移动的ID
	this.moveId = null;
	//是否发弹中
	this.isSend = false;
	//目前已经发了多少颗弹(存在屏幕显示)
	//this.nowBullet = 0;
	
	this.init();
}

Flyer.prototype = {
	//游戏背景Dom
	gamePanel : null,
	//游戏背景宽度
	gameWidth : 0,
	//游戏背景高度
	gameHeight : 0,
	//飞机移动速度
	movepx : 10,
	//飞机移动频率
	movesp : 30,
	//飞机子弹级别
	bulletLevel : 1,
	//最大发弹数(存在屏幕显示)
	//maxBullet : 12,
	//方向键值对应
	keyCodeAndDirection : {
		37 : "left",
		39 : "right",
	},
	//初始化
	init : function(){
		this.dom = document.createElement('div');
		this.dom.className = 'HuaHua';
	},
	//设置位置
	/**
	*@para gamePanel 游戏背景
	*@para width 游戏背景宽度
	*@para height 游戏背景高度
	*/
	setPosition : function(gamePanel,width,Height){
		this.gamePanel = gamePanel;
		//将user添加进游戏
		this.gamePanel.appendChild(this.dom);
		//设置飞机初始位置
		//设置为中间
		this.dom.style.left = (width-this.dom.clientWidth)/2+'px';
		this.gameWidth = width;
		this.gameHeight = Height;
	},

	//键盘控制事件
	keydown : function(e){
		var keyCode = e.keyCode;
		//按了空格发弹
		if(keyCode == 32){
			//判断是否发弹中
			if(!this.isSend){
				//发弹
				this.onSendBullet();
				this.isSend = true;
			}
		}
		//判断是否移动中，移动
		else if(!this.isMove)this.move(keyCode);
	},
	//键盘释放事件
	keyup : function(e){
		//判断是否为键盘释放
		if(this.keyCodeAndDirection[e.keyCode]){
			//停止移动
			this.stopMove();
		}
		//发弹键释放
		else if(e.keyCode == 32){
			//设置为非发弹中
			this.isSend = false;
		}
	},
	//user移动
	/**
	*@para keyCode 键盘按键
	*/
	move : function(keyCode){
		//设置为移动中
		this.isMove = true;
		var _this = this;
		//判断移动方向
		switch(this.keyCodeAndDirection[keyCode]){
			case "left":{
				//setInterval() 方法可按照指定的周期（以毫秒计）来调用函数或计算表达式。返回一个int值用于关闭
				this.moveId = setInterval(function(){_this.moveLeftRight("left");},_this.movesp);
				break;
			}
			case "right":{
				this.moveId = setInterval(function(){_this.moveLeftRight("right")},_this.movesp);
				break;
			}
			default:break;
		}
	},
	//左右移动
	moveLeftRight : function(dir){
		switch(dir){
			case "left":{
				var left = this.dom.offsetLeft-this.movepx>=0?this.dom.offsetLeft-this.movepx:0;
				this.dom.style.left = left+"px";
				//判断是否到达边界
				if(left==0)
					stopMove();
				break;
			}
			case "right":{
				var right = (this.dom.offsetLeft+this.movepx)>(this.gameWidth-this.dom.clientWidth)?this.gameWidth-this.dom.clientWidth:this.dom.offsetLeft+this.movepx;
				this.dom.style.left = right+"px";
				//判断是否到达边界
				if(right==(this.gameWidth-this.dom.clientWidth))
					stopMove();
				break;
			}
			default:break;
		}
	},
	//setInterval() 方法会不停地调用函数，直到 clearInterval() 被调用或窗口被关闭
	//setInterval()在102行
	stopMove : function(){
		this.isMove = false;
		clearInterval(this.moveId);
	},
	//子弹发射
	sendBullet : function(enemyList){
		//遵循子弹级别，子弹级别若为2则一次可发两枚子弹。
		var _this = this;
		//建立循环子弹发射
		for(var i = 0; i < this.bulletLevel; ++i){
			var bullet = new Bullet();
			console.log(bullet.dom);
			this.gamePanel.appendChild(bullet.dom);
			//设置子弹发出位置为user所在位置
			bullet.setPosition(this.dom.offsetLeft,this.dom.offsetTop);

			//重写,检测子弹是否能打中monster
			bullet.checkBeat = function(){
				//遍历敌机列表，判断是否打中敌机
				for (var i = 0, l = enemyList.length; i < l; i++) {
					//敌机是死的，跳过
					if(!enemyList[i].isLive)continue;
					//获取敌机的x,y坐标以及半径
					var e_left = enemyList[i].dom.offsetLeft;
					var e_top = enemyList[i].dom.offsetTop;
					var e_radius = enemyList[0].dom.clientWidth / 2;
					//子弹的x,y坐标以及半径
					var b_left = this.dom.offsetLeft;
					var b_top = this.dom.offsetTop;
					var b_radius = bullet.dom.clientWidth / 2;
					//判断是否被击中
					//原理，比较两个圆的圆心距与两个圆的半径之和
					if (Math.sqrt(Math.pow(e_left - b_left, 2) + Math.pow(e_top - b_top, 2)) <= e_radius + b_radius) {
						//敌机死亡
						enemyList[i].isLive = false;
						//修改分数
						_this.onChangeScore();
						//返回true
						return true;
					}
				}
				return false;
			}
		
			//重写子弹的结束函数
			bullet.onend = function(){
				//从游戏背景移除子弹
				_this.gamePanel.removeChild(this.dom);
			}
			//发弹动画，就是移动
			bullet.animation();
		}
	},
	//飞机爆炸
	burstFlyer : function(){
		this.dom.className = 'bingo';
	},
	//发射子弹外部接口，主要任务为回调sendBullet函数，传入敌机列表参数
	onSendBullet : function(){},
	//改分数外部接口
	onChangeScore : function(){}
}