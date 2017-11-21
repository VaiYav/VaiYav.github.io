var swiper = new Swiper('.swiper-container', {
	nextButton: '.swiper-button-next',
	prevButton: '.swiper-button-prev'
});

function openNav(x) {
	document.getElementById("myNav").style.height = "100%";
	x.classList.add("change");
}

function closeNav() {
	document.getElementById("myNav").style.height = "0%";
	document.querySelector(".bar-container").classList.toggle("change");
}

function closemyNav() {
	var overlayContent = document.querySelector(".overlay-content").querySelectorAll("a");
	for (let i = 0; i < overlayContent.length; i++) {
		overlayContent[i].onclick = function () {
			document.getElementById("myNav").style.height = "0%";
			document.querySelector(".bar-container").classList.toggle("change");
		}
	}
}

//Not working in IE
//
//function hoverButton() {
//	var title = document.querySelectorAll('.price-container-title');
//	var button = document.querySelectorAll('.price-container-button');
//	for (let a = 0; a < button.length; a++) {
//		button[a].onmouseover = function () {
//			title[a].style.background = '#49cbcd';
//			button[a].style.background = '#49cbcd'
//		}
//		button[a].onmouseout = function () {
//			title[a].style.background = '#485460';
//			button[a].style.background = '#788492'
//		}
//	}
//}

function linkpage() {
	var linkNav = document.querySelectorAll('[href^="#nav"]'),
		V = 1;
	for (var i = 0; i < linkNav.length; i++) {
		linkNav[i].addEventListener('click', function (e) {
			e.preventDefault();
			var w = window.pageYOffset,
				hash = this.href.replace(/[^#]*(.*)/, '$1');
			t = document.querySelector(hash).getBoundingClientRect().top,
				start = null;

			requestAnimationFrame(step);

			function step(time) {
				if (start === null) start = time;
				var progress = time - start,
					r = (t < 0 ? Math.max(w - progress / V, w + t) : Math.min(w + progress / V, w + t));
				window.scrollTo(0, r);
				if (r != w + t) {
					requestAnimationFrame(step)
				} else {
					location.hash = hash
				}
			}
		}, false);
	}
}
(function () {
	//	Fixed header
	var a = document.querySelector('#header'),
		b = null;
	window.addEventListener('scroll', Ascroll, false);
	document.body.addEventListener('scroll', Ascroll, false);

	function Ascroll() {
		if (b == null) {
			var Sa = getComputedStyle(a, ''),
				s = '';
			for (var i = 0; i < Sa.length; i++) {
				if (Sa[i].indexOf('background-color') == 0) {
					s += Sa[i] + ': ' + Sa.getPropertyValue(Sa[i]) + '; '
				}
			}
			b = document.createElement('div');
			b.style.cssText = s + ' box-sizing: border-box;' + 'position: fixed;' +
				'top: 0;' + 'z-index: 20;' + 'background: #fff;' + 'width: 100%;' + 'left: 0;' +
				'justify-content: space-around;' + 'max-width: 100%;' + 'box-shadow: 0px 5px 25px 0px rgba(0,0,0,0.3);';
			a.insertBefore(b, a.firstChild);
			var l = a.childNodes.length;
			for (var i = 1; i < l; i++) {
				b.appendChild(a.childNodes[1]);
			}
			a.style.height = '100px';
			a.style.padding = '0';
			a.style.border = '0';
		}
		if (a.getBoundingClientRect().top <= 0) {
			b.className = 'header-container';
		} else {
			b.className = '';
		}

	}
	//	Hover buttons
	var container = document.querySelector('.price-container');
	container.addEventListener("mouseover", getFon);
	container.addEventListener("mouseout", backFon);

	function getFon(event) {
		var target = event.target;
		var button = target.parentNode.querySelector('a');
		if (target.tagName.toLowerCase() != 'a') {
			return;
		}
		button.style.background = "#49cbcd";
		var form = event.target;
		var h2 = form.parentNode.querySelector('.price-container-title');
		h2.style.background = "#49cbcd";
	}

	function backFon(event) {
		var target = event.target;
		var button = target.parentNode.querySelector('a');
		if (target.tagName.toLowerCase() != 'a') {
			return;
		}
		button.style.background = "#788492";
		var form = event.target;
		var h2 = form.parentNode.querySelector('.price-container-title');
		h2.style.background = "#485460";
	}
})()
