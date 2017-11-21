function drop() {
	var buttons = document.querySelectorAll(".dropdown-container");
	var content = document.querySelectorAll(".dropdown-content");
	for (let i = 0; i < buttons.length; i++) {
		buttons[i].onclick = function () {
			content[i].classList.toggle("dropdown-button__visible")
		}
	}
}
window.onclick = function (event) {
	if (!event.target.matches('.account-activity-click')) {
		var dropdowns = document.getElementsByClassName("dropdown-content");
		var i;
		for (i = 0; i < dropdowns.length; i++) {
			var openDropdown = dropdowns[i];
			if (openDropdown.classList.contains('dropdown-button__visible')) {
				openDropdown.classList.remove('dropdown-button__visible');
			}
		}
	}
}

function humb() {
	var x = document.getElementById("TopNav");
	if (x.className === "dropdown") {
		x.className += " dropdown__responsive";
	} else {
		x.className = "dropdown";
	}
}

function counter() {
	var btnMinus = document.querySelectorAll(".count-block__minus"),
		btnPlus = document.querySelectorAll(".count-block__plus"),
		input = document.querySelectorAll(".count-block__count"),
		valueInput = document.querySelector(".count-block__count").value;
	for(let a=0;a<input.length;a++){
	btnMinus[a].onclick = function () {
		if (input[a].value != 1) input[a].value--;
		else if (input[a].value == 1) btnMinus[a].style.color = "#bdbdbd";
		
	
	}
	
	btnPlus[a].onclick = function () {
		input[a].value++;
		if (input[a].value > 1) {
			btnMinus[a].style.color = "#1256d1";

		}
	}
}
}
