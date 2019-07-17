//=================ЗАГОЛОВОК==========================//

let headerGameName = document.querySelector('.header');

setTimeout(function(){
	headerGameName.classList.add('header-scale');
}, 100);


//=================УСТАНОВКА ИМЕНИ И ОЧКОВ============//

let menuScores = 0;

let menuScoresField = document.querySelector('.menu .menu__scores');
function setScores(score) {
	menuScoresField.innerHTML = `Твой лучший счет: ${score}`; 
};

setScores(menuScores);


//=================АКТИВАЦИЯ КНОПКИ МЕНЮ==============//

(function() {
	let startButton = document.querySelector('.menu .menu__button-start');
//	let male = document.querySelector('.menu .menu__pers-choice .menu__male');
	let hero = document.querySelector('.menu .menu__pers-choice .menu__female');
	let activateClass = 'menu__pers-active';
/*	let pers = [male, female];

	pers.forEach(function(item, i, arr){
		item.addEventListener('click', function() {
			arr.filter(function(it) {
				if (it.classList.contains(activateClass)) {
					it.classList.remove(activateClass)
				}
			})
			this.classList.add(activateClass);
			startButton.removeAttribute('disabled');
		})
	});*/
//	startButton.setAttribute('disabled', 'true');
	hero.addEventListener('click', function() {
		if (!hero.classList.contains(activateClass)) {
			hero.classList.add(activateClass);
			startButton.removeAttribute('disabled');

			startButton.addEventListener('click', function(e) {
				e.preventDefault();

				let overlay = document.createElement('div');
				overlay.className = 'overlay';
				document.body.appendChild(overlay);
				overlay.classList.add('overlay-animation');
				
				setTimeout(function() {
					openGame();
					playGame();
				}, 1000);
				
				setTimeout(function() {
					overlay.remove();
				}, 3200);
			})
		}
	})
})();


//=================АНИМАЦИЯ КНОПКИ ЗВУКА==============//

(function() {
	let soundButton = document.querySelector('.menu .menu__icons .menu__icons-sound');

	soundButton.addEventListener('click', function() {
		soundButton.classList.toggle('menu__icons-deactive');
	})
})();



//=================УСТАНОВКА КЛАССОВ БЛОКА============//


let mainContent = document.getElementById('content');
let gameField = document.getElementById('gameField');
let bgImage = document.getElementById('body-image');

function openMenu() {
	mainContent.className = 'content';
	gameField.className = 'gameField hide-block';
	bgImage.className = 'body-image';
};