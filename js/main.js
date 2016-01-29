window.onload=function(){
//Easel spritesheet - v01
var canvas;
var stage;
var stage_width;
var stage_height;
var gun_anim;

var spriteSheet;
var crsrTrgt;
var currLvl;
var scoreTxt;
var timeTxt;
var soundsLoaded;
var totalLoaded;
var monsters;
var imgw; //sprite frame w
var imgh; //sprite frame h
var mnstr_num;
var score;
var time;
var shooting;
var maxLvl;
var loadpercent;
var mnstrInterval;
var shootIntrvl;
var bonusMnstrIntrvl;
var bonusMnstrRand;
var bonus_txt;
var gameOn;
var bgArr = [];
var dirIntrvl;
var dirRndm;
var rnd;

function initGameVars() {
	//not all variables need to be initialised when game is over
	//and user clicks "Replay", so this function maintains the seperation
	currLvl = 0;
	score = 0;
	time = 0;
	shooting = false;
	mnstrInterval = 0;
	shootIntrvl = 0;
	bonusMnstrIntrvl = 0;
	bonusMnstrRand = 0;
	bonus_txt = [];
	gameOn = false;
	//random direction change variables
	rnd = 1;//random monster number inside monsters[]
	dirIntrvl = 0;//time since last direction change
	dirRndm = Math.random() * 2000 - 1000; //random interval for changing dir., btwn 1-2sec
}
function init() {
	//init game vars
	soundsLoaded = false;
	totalLoaded = 0;
	imgw = 79;
	imgh = 81;
	maxLvl = 2;
	loadpercent = null;
	//	mute = false;
	initGameVars();

	//find canvas and load images, wait for last image to load
	canvas = document.getElementById("myCanvas");
	// create a new stage and point it at our canvas:
	stage = new createjs.Stage(canvas);
	createjs.Touch.enable(stage);

	stage.mouseEventsEnabled = true;
	// enabled mouse over / out events, detection freq. of 10 per sec.
	stage.enableMouseOver(10);

	// grab canvas width and height for later calculations:
	stage_width = canvas.width;
	stage_height = canvas.height;

	//PreloadJS
	var audioPath = "audio/";
	var manifest = [
		/* {
		src : audioPath + "boom.mp3|" + audioPath + "boom.ogg",
		id : "boom"
		},*/
		{
			src : audioPath + "machine_gun.mp3|" + audioPath + "machine_gun.ogg",
			id : "gun"
		}, {
			src : "img/bg1.jpg",
			id : "bg1"
		}, {
			src : "img/bg2.jpg",
			id : "bg2"
		}, {
			src : "img/sprite.png",
			id : "sprite"
		}
	];
	var queue = new createjs.LoadQueue(true);
	queue.installPlugin(createjs.Sound);

	queue.addEventListener("loadStart", handleLoadStart);
	queue.addEventListener("fileload", handleFileLoad);
	queue.addEventListener("error", handleLoadError);
	queue.loadManifest(manifest);

	function handleLoadStart(event) {
		// console.log('load start');
		//bg
		var bg = new createjs.Shape();
		bg.graphics.beginFill("rgba(0,0,0,0.5)").drawRect(0, 0, stage_width, stage_height);
		stage.addChild(bg);
		//load %
		loadpercent = new createjs.Text("Loaded: 0%", "30px Arial", "#f70");
		loadpercent.x = stage_width / 2 - loadpercent.getMeasuredWidth() / 2;
		loadpercent.y = stage_height / 2 - loadpercent.getMeasuredHeight() / 2;
		stage.addChild(loadpercent);
		stage.update();
		queue.addEventListener("progress", handleProgress);
	}

	function handleProgress(event) {
		//use event.loaded to get the percentage of the loading
		var percent = Math.round(event.loaded * 100);
		loadpercent.text = "Loaded: " + percent + "%";
		stage.update();
	}

	function handleLoadError(e) {
		console.log("Error loading file " + e.item.src);
	}

	function handleLoadComplete(event) {
		totalLoaded++;
		if (manifest.length == totalLoaded) {
			//All files have finished loading
			bgArr.push(queue.getItem('bg1'));
			bgArr.push(queue.getItem('bg2'));
			soundsLoaded = true;
			reset();
			loadMenuScrn(currLvl);
		}
	}

	function handleFileLoad(event) {

		//triggered when an individual file completes loading
		switch (event.item.type) {

		case createjs.LoadQueue.IMAGE:
			//image loaded
			var img = new Image();
			img.src = event.item.src;
			img.onload = handleLoadComplete;
			window[event.item.id] = img; //new createjs.Bitmap(img);
			break;

		case createjs.LoadQueue.SOUND:
			//sound loaded
			handleLoadComplete();
			break;
		}
	}

}

function loadMenuScrn(lvl) {
	canvas.className = "idle";
	gameOn = false;
	if (lvl < maxLvl) {
		var bg = new createjs.Bitmap(bgArr[currLvl].src);
		bg.name = 'bg';
		stage.addChild(bg);
	}
	//create container with transp.rect. as transpBg. play button
	var container = new createjs.Container();
	var transpBg = new createjs.Shape();
	stage.addChild(container);
	//black background
	transpBg.graphics.beginFill("#000").drawRect(0, 0, stage_width, stage_height);
	transpBg.alpha = 0.5;
	transpBg.x = 0;
	transpBg.y = 0;
	container.addChild(transpBg);
	var playBtnCntnr = new createjs.Container();
	var playBtn = new createjs.Shape();
	//[Play | Level n | Replay] button
	var pbw = 150;
	var pbh = 50;
	playBtn.graphics.beginFill("#f70").drawRoundRect(0, 0, pbw, pbh, 10);
	playBtn.x = (stage_width - pbw) / 2;
	playBtn.y = (stage_height - pbh) / 2
	var playBtnTxt = new createjs.Text("@@@", "30px Arial", "#000");

	playBtnCntnr.addChild(playBtn);
	playBtnCntnr.addChild(playBtnTxt);
	playBtnCntnr.cursor = "pointer";

	if (lvl === maxLvl) {
		//last level done
		var gameOverTxt = new createjs.Text("Game Over\nScore: " + score, "30px Arial", "#f70");
		container.addChild(gameOverTxt);
		playBtnTxt.text = "Replay";
		var credits = new createjs.Text("Credits:\nMade by Dina Malone @ IADT MM3", "15px Arial", "#d70");
		credits.textBaseline = 'ideographic';
		credits.textAlign = 'center';
		container.addChild(credits);
		credits.x = stage_width/2;
		credits.y = stage_height - credits.getMeasuredHeight();
		
		initGameVars();
	} else {
		if (lvl === 0) {		
			//start of game show "Play" button
			playBtnTxt.text = "Play";
			var rules = new createjs.Text("Rules:\nTarget monsters with mouse, shoot with left-click.\nNormal (brown) monsters are worth 100 points,\nbonus (green) monsters are worth 1000 points.\nLevel is over when clock runs out.", "15px Arial", "#d70");
			rules.textBaseline = 'ideographic';
			rules.textAlign = 'center';
			container.addChild(rules);
			rules.x = stage_width/2;
			rules.y = stage_height - rules.getMeasuredHeight();
		} else {
			//any other level show "Level n" button
			var endLvlTxt = new createjs.Text("Level " + lvl + " completed\nScore: " + score, "30px Arial", "#f70");
			container.addChild(endLvlTxt);
			playBtnTxt.text = "Level " + (lvl + 1);
		}
	}

	/*	//mute/unmute
	var muteIcon = new createjs.Bitmap(sprite);
	if (mute) {
	muteIcon.sourceRect = new createjs.Rectangle(98, 937, 36, 33);
	muteIcon.addEventListener('click', function () {
	muteIcon.sourceRect = new createjs.Rectangle(98, 904, 36, 33);//volume on icon
	createjs.Sound.setMute(false);
	mute = false;
	stage.update();
	});
	} else {
	muteIcon.sourceRect = new createjs.Rectangle(98, 904, 36, 33);
	muteIcon.addEventListener('click', function () {
	muteIcon.sourceRect = new createjs.Rectangle(98, 937, 36, 33);//volume off icon
	createjs.Sound.setMute(true);
	mute = true;
	stage.update();
	});
	}
	muteIcon.cursor = 'pointer';
	muteIcon.x = stage_width / 2;
	stage.addChild(muteIcon);
	 */

	//center text on button
	playBtnTxt.x = (playBtn.x + pbw / 2) - playBtnTxt.getMeasuredWidth() / 2;
	playBtnTxt.y = (playBtn.y + pbh / 2) - playBtnTxt.getMeasuredHeight() / 2;
	container.addChild(playBtnCntnr);
	playBtnCntnr.addEventListener('click', startGame);

	stage.update();
}

function levelComplete() {
	reset();
	if (currLvl < maxLvl) {
		currLvl++;
	}
	loadMenuScrn(currLvl);
}

function reset() {
	stage.removeAllChildren();
	createjs.Ticker.removeAllListeners();
	canvas.removeEventListener('mousedown', shoot);
	canvas.removeEventListener('touchstart', shoot);
	if (soundsLoaded) {
		createjs.Sound.stop("gun");
	}
	stage.update();
}

function startGame(e) {
	canvas.className = "playing";
	//remove all children but background
	//if using removeAllChildren() there's a delay when reloading bg
	//and game starts before bg loads
	for (var i = 0; i < stage.children.length; i++) {
		if (stage.getChildAt(i).name !== 'bg') {
			stage.removeChild(stage.getChildAt(i));
		}
	}
	gameOn = true;
	// create spritesheet and assign the associated data.
	spriteSheet = new createjs.SpriteSheet({
			//image to use
			images : [sprite],
			//width, height & registration point of each sprite
			frames : {
				width : imgw,
				height : imgh,
				regX : imgw / 2,
				regY : imgh / 2
			},
			// To slow down the animation loop of the sprite, we set the frequency to 4 to slow down by a 4x factor
			//Note I couldn't get the frequency property to work on its own. It is the last 4 in the individual animations object
			//frequency: 4,

			animations : {
				//syntax: nameOfAnimation: [startFrame, endFrame, whichAnimationNext, frequency]
				mnstr_expld : [45, 52, false, 2],
				mnstr_wlk : {
					frames : [1, 11, 16],
					next : "mnstr_wlk",
					frequency : 12
				},
				mnstr_bonus : {
					frames : [31, 32, 33, 26, 21, 22],
					next : "mnstr_bonus",
					frequency : 10
				},
				aimGun : {
					frames : 54
				},
				shootGun : {
					frames : [53, 54],
					next : "shootGun"
				}
			}
		});

	gun_anim = new createjs.BitmapAnimation(spriteSheet);

	// start playing the first sequence:
	gun_anim.gotoAndStop("aimGun"); //walking from left to right

	//place the gun anim. on the bottom center of screen.
	gun_anim.x = stage_width / 2;
	gun_anim.y = stage_height - imgh / 2 + 5;

	stage.addChild(gun_anim);

	crsrTrgt = new createjs.Bitmap(sprite);
	var crsrTrgtSz = 80;
	//sourceRect() cuts out a certain area of a Bitmap,
	//in this case 'target' image on sprite: at x=0, y=890, 80*80px
	crsrTrgt.sourceRect = new createjs.Rectangle(0, 890, crsrTrgtSz, crsrTrgtSz);
	crsrTrgt.regX = crsrTrgtSz / 2;
	crsrTrgt.regY = crsrTrgtSz / 2;
	crsrTrgt.x = gun_anim.x;
	crsrTrgt.y = gun_anim.y - crsrTrgtSz;
	stage.addChild(crsrTrgt);

	canvas.addEventListener("mousemove", onMove);
	canvas.addEventListener("touchmove", onMove);
	function onMove(e) {
		moveGun(e);
		moveCrsr(e);
	}

	canvas.addEventListener("mousedown", shoot);
	canvas.addEventListener("touchstart", shoot);

	//time and score
	var scoreLbl = new createjs.Text("Score: ", "20px Arial", "#f70");
	stage.addChild(scoreLbl);
	scoreTxt = new createjs.Text(score, "20px Arial", "#f70");
	scoreTxt.x = scoreLbl.getMeasuredWidth();
	stage.addChild(scoreTxt);

	var timeLbl = new createjs.Text("Time: ", "20px Arial", "#f70");
	timeLbl.x = stage_width - timeLbl.getMeasuredWidth() - 90;
	stage.addChild(timeLbl);
	timeTxt = new createjs.Text("", "20px Arial", "#f70");
	stage.addChild(timeTxt);
	timeTxt.x = stage_width - 90;

	// initialize Ticker
	createjs.Ticker.init();
	createjs.Ticker.addEventListener("tick", tick);
	createjs.Ticker.useRAF = true;
	createjs.Ticker.setFPS(60); // Best Framerate targeted (60 FPS)

	//monsters[] holds the monster objects
	//size of monsters[] limited to 10, controlled by mnstr_num
	monsters = [];
	mnstr_num = 0;
}

function createMonsterInstance(type) {
	// create a BitmapSequence instance to display and play back the sprite sheet:
	var mnstr = new createjs.BitmapAnimation(spriteSheet);
	mnstr_num++; //increased by 1 when new monster created
	mnstr.regX = 0;
	mnstr.regY = 0;
	mnstr.y = stage_height * 0.5 + 20;
	mnstr.vY = 0;

	var x = Math.random();
	if (x >= 0.5) {
		mnstr.direction = 90;
		mnstr.x = 0;
	} else {
		mnstr.direction = -90;
		mnstr.x = stage_width;
	}
	//monsters come in two types:
	//normal(brown)=100 points, and bonus(green)=1000 points
	if (type === "normal") {
		mnstr.vX = 2;
		mnstr.name = "mnstr" + mnstr_num;
		mnstr.gotoAndPlay("mnstr_wlk");
	} else {
		mnstr.vX = 3;
		mnstr.name = "bonus";
		mnstr.gotoAndPlay("mnstr_bonus");
	}
	monsters.push(mnstr);
	stage.addChild(mnstr);
	//move target to top zIndex in order
	//to keep target on top of monsters, otherwise hides behind them
	stage.setChildIndex(crsrTrgt, stage.getNumChildren() - 1);
}

//on mouse move target follows mouse cursor
function moveCrsr(e) {
	crsrTrgt.x = stage.mouseX;
	crsrTrgt.y = stage.mouseY;
}
//gun follows mouse x position, keeps static y position
function moveGun(e) {
	gun_anim.x = stage.mouseX;
}

//shoot on mouse down
function shoot(e) {
	if (gameOn) {
		if (soundsLoaded) {
			createjs.Sound.play("gun", createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 1, 0);
		}
		gun_anim.gotoAndPlay("shootGun");
		canvas.removeEventListener("mousedown", shoot);
		canvas.removeEventListener("touchstart", shoot);
		shooting = true;
	}
}

function kill(mnstr) {
	mnstr.gotoAndPlay('mnstr_expld');
	mnstr.onAnimationEnd = function () {
		/* if (soundsLoaded) {
		createjs.Sound.play("boom", createjs.Sound.INTERRUPT_ANY);
		} */
		removeFromWorld(mnstr);
		//create yellow bonus "+1000" text
		if (mnstr.name === "bonus") {
			score += 1000;
			//keep instances of bonus text in array to avoid
			//bugs when a few bonus monsters are killed together
			//and a few instances of bonus text are on screen
			bonus_txt.push(new createjs.Text("+1000", "30px Arial", "#ff0"));
			bonus_txt[0].x = mnstr.x;
			bonus_txt[0].y = mnstr.y;
			stage.addChild(bonus_txt[0]);
		} else {
			score += 100;
		}
		scoreTxt.text = score;
	}
}

function stopShoot() {
	if (soundsLoaded) {
		createjs.Sound.stop("gun");
	}
	gun_anim.gotoAndStop("aimGun");
	shooting = false;
	canvas.addEventListener("mousedown", shoot);
	canvas.addEventListener("touchstart", shoot);
}

function formatClock(tMilsecs) {
	var t = tMilsecs / 1000;
	var seconds = Math.floor(t % 60);
	var minutes = Math.floor((t / 60) % 60);
	var hours = Math.floor(t / 60 / 60);

	var formattedClock =
		(hours < 10 ? '0' + hours : hours) + ':'
	 + (minutes < 10 ? '0' + minutes : minutes) + ':'
	 + (seconds < 10 ? '0' + seconds : seconds);
	return formattedClock;
}

function removeFromWorld(mnstr) {
	stage.removeChild(mnstr);
	var k = 0;
	for (k in monsters) {
		var m = monsters[k];
		if (m === mnstr) {
			monsters.splice(k, 1);
			break;
		}
	}
	mnstr_num--; //decreased by 1 when new monster killed/gone off screen
}

function tick(e) {
	//e.delta counts the time since last tick
	//at 60fps delta is around 16ms
	var d = Math.floor(e.delta);
	//adding it up every tick works similar to setInterval()
	//handy for counting intervals between events, like monster creation
	mnstrInterval += d;
	//time goes from 35 seconds(=35000 milisec,plus extra second to load=>36000)  to 0
	time = 31000 - e.target.getTime();
	var t = Math.ceil(time / 1000);

	if (t > 0) {
		timeTxt.text = formatClock(time);
		//randomly create a monster every half a second
		if (mnstr_num < 10 && mnstrInterval >= 500) {
			createMonsterInstance("normal");
			mnstrInterval = 0;
		}
		//create bonus monster every random interval of 2-3 sec
		if (bonusMnstrIntrvl === 0) {
			bonusMnstrRand = Math.random() * 3000 + 2000;

		}
		if (bonusMnstrIntrvl >= bonusMnstrRand) {
			createMonsterInstance("bonus");
			//once bonus monster created reinitialize bonusMnstrIntrvl
			//to start count for next bonus monster
			bonusMnstrIntrvl = 0;
		} else {
			bonusMnstrIntrvl += d;
		}

		if (dirIntrvl >= dirRndm && monsters[rnd] !== undefined) {
			//change direction randomly			
			monsters[rnd].direction *= -1;
			monsters[rnd].scaleX *= -1;		
			dirIntrvl = 0;
			dirRndm = Math.random() * 2000 - 1000;
			rnd = Math.floor(Math.random()*monsters.length+1);
		} else {
			dirIntrvl += d;
		}
		//loop through monsters[] that's filled with monster objects
		var k = 0;
		for (k in monsters) {
			var m = monsters[k];
			if (shooting) {
				//check if monster[k] is in range
				var Wdelta = spriteSheet._frameWidth * 0.1;
				var Hdelta = spriteSheet._frameHeight * 0.3;
				
				//check if mouse x,y is inside rect surrounding monster (Wdelta*Hdelta)
				var inXrange = stage.mouseX > m.x - Wdelta && stage.mouseX < m.x + Wdelta;			
				var inYrange = stage.mouseY > m.y - Hdelta && stage.mouseY < m.y + Hdelta;
				
				if (inXrange && inYrange) {
					monsters.splice(k, 1);
					kill(m);					
				}
			}
			
			//Monster disappears when passing beyond screen edge
			if (m.x >= stage_width + 16 || m.x < -16) {
				removeFromWorld(m);
			}
			
			// Moving the sprite based on the direction & the speed
			if (m.direction == 90) {
				m.x += m.vX;
				m.y += m.vY;
				m.scaleX = -1;

			} else {
				m.x -= m.vX;
				m.y -= m.vY;
			}

		}
		//fade out bonus score "+1000" text
		if (bonus_txt.length > 0) {
			//fade it out while moving up and to the right
			bonus_txt[0].alpha -= 0.01;
			bonus_txt[0].x += 1;
			bonus_txt[0].y -= 1;
			//when faded remove it from screen and bonus_txt[]
			if (bonus_txt[0].alpha <= 0) {
				stage.removeChild(bonus_txt[0]);
				bonus_txt.pop();
			}
		}

		if (shooting) {
			//make sure each shooting doesn't last longer than 100ms
			//otherwise will keep shooting all the time mouse is down - too easy
			//add up delta intervals until counted 100ms or more
			shootIntrvl += d;
			if (shootIntrvl >= 100) {
				//stop shooting and reset interval to count again for next shooting
				stopShoot();
				shootIntrvl = 0;
			}
		}
		stage.update();
	} else {
		//when time is 0 or less
		
		//reset random direction variables
		rnd = 1;//random monster number inside monsters[]
		dirIntrvl = 0;//time since last direction change
		dirRndm = Math.random() * 2000 - 1000; //random interval for changing dir., btwn 1-2sec
		// finish level
		levelComplete();
	}
}


init();

}
