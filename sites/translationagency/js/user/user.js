 var mySwiper3 = new Swiper('#swiper-feedbacks', {
 	direction: 'vertical',
 	pagination: '#sliderPaginationThird',
 	nextButton: '.swiper-button-next',
 	prevButton: '.swiper-button-prev',
 	paginationClickable: true,
 	paginationType: 'bullets',
 	effect: 'fade',
 	fade: {
 		crossFade: true
 	}

 });
 var mySwiper2 = new Swiper('#swiper-works', {
 	direction: 'vertical',
 	pagination: '#sliderPaginationSecond',
 	nextButton: '.swiper-button-next',
 	prevButton: '.swiper-button-prev',
 	paginationClickable: true,
 	paginationType: 'bullets',
 	paginationBulletRender: function (swiper, index, className) {
 		return '<span class="' + className + '">' + (index + 1) + '</span>';
 	},
 	effect: 'fade',
 	fade: {
 		crossFade: true
 	}

 });

 var mySwiper1 = new Swiper('#swiper-container', {
 	direction: 'horizontal',
 	loop: true,
 	pagination: '#sliderPaginationFirst',
 	pagination: '.swiper-pagination',
 	nextButton: '.swiper-button-next',
 	prevButton: '.swiper-button-prev',
 	paginationClickable: true
 });


 function openNav() {
 	document.getElementById("myNav").style.height = "100%";
 	var body = document.querySelector("body");
 	body.classList.add("no-scroll");
 }

 function closeNav() {
 	document.getElementById("myNav").style.height = "0%";
 	var body = document.querySelector("body");
 	body.classList.remove("no-scroll");
 }

 function modal() {
 	var modal = document.getElementById('myModal');
 	var modal2 = document.getElementById('myModalsec');
 	var btn = document.getElementById("myBtn");
 	var btn2 = document.getElementById("myBtnsec");
 	var btn3 = document.getElementById("myBtnthird");
 	var span = document.getElementsByClassName("close")[0];
 	var span2 = document.getElementsByClassName("close")[1];
 	btn.onclick = function () {
 		modal.style.display = "block";
 	}
 	span.onclick = function () {
 		modal.style.display = "none";
 		modal2.style.display = "none";
 	}
 	span2.onclick = function () {
 		modal2.style.display = "none";
 	}
 	window.onclick = function (event) {
 		if (event.target == modal) {
 			modal.style.display = "none";
 		}
 	}
 	window.onclick = function (event) {
 		if (event.target == modal2) {
 			modal2.style.display = "none";
 		}
 	}
 	btn2.onclick = function () {
 		modal2.style.display = "block";
 		modal.style.display = "none";
 		return false;
 	}
 	btn3.onclick = function () {
 		modal2.style.display = "none";
 		return false;
 	}
 }

 function opentab(evt, name) {
 	var i, tabcontent, tablinks;
 	tabcontent = document.getElementsByClassName("tabcontent");
 	for (i = 0; i < tabcontent.length; i++) {
 		tabcontent[i].style.display = "none";
 	}
 	tablinks = document.getElementsByClassName("tablinks");
 	for (i = 0; i < tablinks.length; i++) {
 		tablinks[i].className = tablinks[i].className.replace(" active", "");
 	}
 	document.getElementById(name).style.display = "flex";
 	evt.currentTarget.className += " active";
 }

 function toggle() {
 	var el = document.getElementById('spoiler');
 	var text = document.querySelector('.service-addtext');
 	var innertext = document.querySelector('.service-text');
 	el.onclick = function () {
 		document.innertext += text;
 		el.style.display = "none";
 		text.style.display = "inline"
 		return false;
 	}
 }

 function getFileName() {
 	var file = document.getElementById('fileloader').value;
 	file = file.replace(/\\/g, '/').split('/').pop();
 	document.querySelector('.fileloader-label').innerHTML = 'Прикреплен документ: ' + file;
 }
 new Selector();
 toggle();
 modal();
