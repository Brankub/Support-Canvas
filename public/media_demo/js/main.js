// JavaScript Document
var init = function(){
	if (window.location.hash == "#dream"){
		showDream();
	}
	document.getElementById('editor').onclick=function(){
		showDream();
	}
	document.getElementById('main').onclick=function(){
		document.getElementById('dreamPage').style.display='none';
		document.getElementById('mainPage').style.display='block';
	}
};

var showDream = function(){
	document.getElementById('mainPage').style.display='none';
	document.getElementById('dreamPage').style.display='block';	
}


window.onload = init;