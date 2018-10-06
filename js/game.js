//扩展数组方法，删除特定的值
Array.prototype.remove = function(obj){
	
	for(var i=0,l=this.length;i < l;i++){
		if(this[i] == obj){
			this.splice(i,1);
			return this;
		}
	}
	throw "The Array has no this Obj";
}

//游戏控制类
var Game = {
	//游戏背景dom
	gamePanel : null,
	//飞机玩家
	flyer : null,
	//敌机列表
	enemyList : [],
	//分数
	score : 0,
	//游戏是否结束
	isGameOver : false,
	//初始化
	init : function(){
		
		var _this = this;
		//获取游戏背景
		this.gamePanel = document.getElementById("gameBac");
		//游戏背景获得焦点
		this.gamePanel.focus();
		//启动飞机
		this.startFlyer();
		//启动 敌机
		this.startEnemy();
		//设置键盘按下与释放事件
		document.body.onkeydown  = function(e){_this.onkeydown(e);};
		document.body.onkeyup = function(e){_this.onkeyup(e);}
	},
	//启动飞机
	startFlyer : function(){
		
		var _this = this;
		//新建飞机对象
		this.flyer = new Flyer();
		//设置位置
		this.flyer.setPosition(this.gamePanel,this.gamePanel.clientWidth,this.gamePanel.clientHeight);
		//重写发弹函数
		this.flyer.onSendBullet = function(){this.sendBullet(_this.enemyList);};
		//重写修改分数
		this.flyer.onChangeScore = function(){_this.changeScore();};
	},
	//启动敌机
	startEnemy : function(){
		//游戏结束，退出
		if(this.isGameOver)return;
		
		var _this = this;
		//新建一个敌机对象
		var enemy = new enemyMonster();
		//将敌机添加进游戏背景
		this.gamePanel.appendChild(enemy.dom);
		//随机出敌机的x坐标位置
		var randomX = parseInt(Math.random()* (this.gamePanel.clientWidth / enemy.dom.clientWidth),10);
		//设置monster位置
		enemy.setPosition(randomX * enemy.dom.clientWidth,0);
		//重写检测是否击中飞机玩家
		// enemy.OnCheckCrash = function(){
		// }
		//重写敌机结束事件
		enemy.onend = function(){
			//移除monster
			_this.gamePanel.removeChild(this.dom);
			_this.enemyList.remove(this);
		}
		//游戏结束函数
		enemy.gameover = function(){_this.gameover();}
		//敌机移动
		enemy.animation(this.gamePanel.clientWidth,this.gamePanel.clientHeight);
		//将敌机添加到列表中
		this.enemyList.push(enemy);
		//启动
		setTimeout(function(){_this.startEnemy();},700);
	},
	//键盘按下事件
	onkeydown : function(e){
		e = e || window.event;
		
		var keyCode = e.keyCode;
		
		//阻止浏览器默认事件
		if(keyCode == 32 || this.flyer.keyCodeAndDirection[keyCode]){
			if(e.preventDefault)e.preventDefault();
			else e.returnValue = false;
		}
		else return;
		//回调飞机键盘按下事件
		console.log(e.keyCode);
		this.flyer.keydown(e);
	},
	//键盘释放事件
	onkeyup : function(e){
		e = e || window.event;
		console.log(e);
		//回调飞机键盘释放事件
		this.flyer.keyup(e);
	},
	//修改分数
	changeScore : function(){
		
		this.score += 100;
		document.getElementById('score').innerHTML =  this.score;
		//分数级别
		//var scoreLevel = parseInt(this.score / 5000,10) + 1;
		//判断是否升级飞机子弹级别
		//if(scoreLevel > 1){
		//	this.flyer.bulletLevel = scoreLevel>4?4:scoreLevel;
			//修改敌机移动速度
		//	Enemy.prototype.movesp = Enemy.prototype.movespMap[this.flyer.bulletLevel];
		//}
	},
	//游戏结束
	gameover : function(){
		
		this.isGameOver = true;
		
		document.getElementById('gameScore').innerHTML = "The Game is Over...You Score:" + this.score;
		
		for(var i=0,l=this.enemyList.length;i < l;i++){
			this.gamePanel.removeChild(this.enemyList[0].dom);
			this.enemyList.remove(this.enemyList[0]);
		}
		
		this.gamePanel.removeChild(this.flyer.dom);
		this.flyer = null;
		this.score = 0;
		
		this.gamePanel = null;
		
		document.body.onkeydown = null;
		document.body.onkeyup = null;
		
		document.getElementById('startBtn').style.display = 'block';
	}
}
//游戏开始入口
function GameStart(){
	Game.isGameOver = false;
	Game.init();
	//document.getElementById('startBtn').style.display = 'none';
	document.getElementById('gameScore').innerHTML = 0;
}



//怪物控制类
var enemyMonster = function(){
	//dom元素
	//init()生成
	this.dom = null;
	//monster是否存活
	this.isLive = true;
	var enemyType;
	var enemyId;

	this.init();
}

enemyMonster.prototype = {
	//敌机横向移动速度
	movepx : 4,
	//敌机纵向移动速度
	movepy : 3,
	//敌机移动频率
	movesp : 75,
	//敌机移动频率映射
	movespMap : {
		1: 75,
		2: 65,
		3: 50,
		4: 40
	},
	//初始化,生成怪物
	init : function(){
		this.dom = document.createElement('div');
		this.dom.className = 'monster';
	},
	//设置敌机初始位置,x与y坐标
	setPosition : function(x,y){
		this.dom.style.left = x +'px';
		this.dom.style.top = y + 'px';
	},
	//敌机动画，就是移动，传入参数为游戏背景的宽与高
	animation : function(gameWidth,gameHeight){
		
		var _this = this,
		//实际的横向移动速度,判断左偏移量是否超过游戏背景的一般，决定移动方向左或者右
		_movepx = this.dom.offsetLeft > gameWidth / 2 ?-1*this.movepx:this.movepx;
		//处理移动函数
		var process = function(){
			//敌机的x,y坐标
			var left = _this.dom.offsetLeft,top = _this.dom.offsetTop;
			//向右移动
			if(_movepx > 0){
				//判断右方是否还有足够空间移动，clientWidth = width+左右padding
				//如果没有足够空间移动_movepx，则移动到最右
				left = left + _movepx >= gameWidth-_this.dom.clientWidth ? gameWidth-_this.dom.clientWidth : left + _movepx;
			}
			//向左移动
			else {
				left = left + _movepx <=0 ? 0 : left + _movepx;
			}
			//是否要掉转方向
			if(left <= 0 || left >= gameWidth-_this.dom.clientWidth){_movepx *= -1;}
			//向下移动
			top = top + _this.movepy >= gameHeight - _this.dom.clientHeight?gameHeight - _this.dom.clientHeight:top + _this.movepy;
			//设置敌机位置
			_this.dom.style.top = top + 'px';
			_this.dom.style.left = left + 'px';
			//判断是否撞到飞机玩家
			//var isCrash = _this.OnCheckCrash();
			var isCrash = false;
			//判断是否飞到尽头，是否活着，是否撞到飞机玩家
			if(top < gameHeight - _this.dom.clientHeight && _this.isLive && !isCrash){
				//继续移动
				setTimeout(process,_this.movesp);
			}
			else {
				//敌机死了而且没撞到飞机玩家
				if (!_this.isLive && !isCrash) 
					//爆炸
					_this.effect();
				//敌机撞到飞机玩家
				else {
					//爆炸
					_this.effect();
					//游戏结束
					setTimeout(function(){_this.gameover();}, 100);
				}
			}
		}
		//开始移动
		process();
	},
	//敌机爆炸
	effect : function(){
		//爆炸效果
		this.dom.className = 'bingo';
		
		var _this = this;
		
		setTimeout(function(){_this.onend()},50);
	},
	//外部接口，检测是否撞到飞机玩家
	OnCheckCrash : function(){},
	//敌机结束事件
	onend : function(){},
	//游戏结束
	gameover:function(){}
}