//code.stephenmorley.org
var Dropdown = function () {
	function h(a) {
		for (var b = !1, d = 0; d < e.length; d++) e[d].isOpen && (b = !0);
		if (b) {
			for (a = a.target; null != a;) {
				if (/\bdropdown\b/.test(a.className)) return;
				a = a.parentNode
			}
			f()
		}
	}

	function f(a) {
		for (var b = 0; b < e.length; b++) e[b] != a && e[b].close()
	}

	function g(a) {
		"string" == typeof a && (a = document.getElementById(a));
		e.push(new c(a))
	}

	function c(a) {
		this.node = a;
		a.className += " dropdownJavaScript";
		"addEventListener" in a ? (a.addEventListener("click", this.bind(this.handleMouseOver), !1), a.addEventListener("mouseout", this.bind(this.handleMouseOut), !1), a.addEventListener("click", this.bind(this.handleClick), !1)) : (a.attachEvent("onclick", this.bind(this.handleMouseOver)), a.attachEvent("onmouseout", this.bind(this.handleMouseOut)), a.attachEvent("onclick", this.bind(this.handleClick)));
		"createTouch" in document && a.addEventListener("touchstart", this.bind(this.handleClick), !1)
	}
	var e = [];
	c.prototype.isOpen = !1;
	c.prototype.timeout = null;
	c.prototype.bind = function (a) {
		var b = this;
		return function () {
			a.apply(b, arguments)
		}
	};
	c.prototype.handleMouseOver = function (a, b) {
		this.clearTimeout();
		var d = "target" in a ? a.target : a.srcElement;
		for (;
			"LI" != d.nodeName && d != this.node;) d = d.parentNode;
		"LI" == d.nodeName && (this.toOpen = d, this.timeout = window.setTimeout(this.bind(this.open), b ? 0 : 250))
	};
	c.prototype.handleMouseOut = function () {
		this.clearTimeout();
		this.timeout = window.setTimeout(this.bind(this.close), 250)
	};
	c.prototype.handleClick = function (a) {
		f(this);
		var b = "target" in a ? a.target : a.srcElement;
		for (;
			"LI" != b.nodeName && b != this.node;) b = b.parentNode;
		"LI" == b.nodeName && 0 < this.getChildrenByTagName(b, "UL").length && !/\bdropdownOpen\b/.test(b.className) && (this.handleMouseOver(a, !0), "preventDefault" in a ? a.preventDefault() : a.returnValue = !1)
	};
	c.prototype.clearTimeout = function () {
		this.timeout && (window.clearTimeout(this.timeout), this.timeout = null)
	};
	c.prototype.open = function () {
		this.isOpen = !0;
		for (var a = this.getChildrenByTagName(this.toOpen.parentNode, "LI"), b = 0; b < a.length; b++) {
			var d = this.getChildrenByTagName(a[b], "UL");
			if (0 < d.length)
				if (a[b] != this.toOpen) a[b].className = a[b].className.replace(/\bdropdownOpen\b/g, ""), this.close(a[b]);
				else if (!/\bdropdownOpen\b/.test(a[b].className)) {
				a[b].className += " dropdownOpen";
				for (var c = 0, e = d[0]; e;) c += e.offsetLeft, e = e.offsetParent;
				right = c + d[0].offsetWidth;
				0 > c && (a[b].className += " dropdownLeftToRight");
				right > document.body.clientWidth && (a[b].className += " dropdownRightToLeft")
			}
		}
	};
	c.prototype.close = function (a) {
		a || (this.isOpen = !1, a = this.node);
		a = a.getElementsByTagName("li");
		for (var b = 0; b < a.length; b++) a[b].className = a[b].className.replace(/\bdropdownOpen\b/g, "")
	};
	c.prototype.getChildrenByTagName = function (a, b) {
		for (var d = [], c = 0; c < a.childNodes.length; c++) a.childNodes[c].nodeName == b && d.push(a.childNodes[c]);
		return d
	};
	return {
		initialise: function () {
			"createTouch" in document && document.body.addEventListener("touchstart", h, !1);
			for (var a = document.querySelectorAll("ul.dropdown"), b = 0; b < a.length; b++) g(a[b])
		},
		applyTo: g
	}
}();
