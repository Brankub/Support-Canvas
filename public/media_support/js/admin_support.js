Chat = function(options){
	this.config = options;
	this.typesMessages = ['startChat', 'closeChat', 'message', 'screen', 'showClick'];
	this.init();
};
Chat.prototype = {
	init: function(){
		this.socket = io.connect('http://localhost:8080');
		this.chatContainer = $('#chatContainer');
		this.chatList = $('#supportChat');
		this.chatSend = $('#messageInput');
		this.messageText = $('#infoMessage');
		this.listening();
	},
	listening: function(){
		var chat = this;		
		this.socket.on('message', function (message) {
			switch(message.type){
				case chat.typesMessages[0]:
					chat.showQuery();
					break;
				case chat.typesMessages[1]:
					chat.closeChat();					
					break;
				case chat.typesMessages[2]:
					chat.addMessage(message.data, false);
					break;
				case chat.typesMessages[3]:
					chat.showScreen(message.data)
					break;
				default:
			};
		});
	},
	showQuery: function(){
		var chat = this;
		this.messageText.html(this.config.langTextQuery);
		this.messageText.addClass('text-success');
		$('#openChat').click(function(e){
			chat.startChat();
			chat.socket.emit('message', { me: 'client', mytime: new Date(), type: chat.typesMessages[0] });
		});
	},
	showScreen: function(image){
		var $screenArea = $('#screenArea');
		$('img', $screenArea).remove();
		
		$('<img>').attr({
		  id: 'supprotImage',
		  src: 'tmp/'+image[0]+'.jpg'
		}).appendTo('#screenArea');

		this.checkClick(image[1] / $screenArea.width());
	},
	checkClick: function(ratio){
		var chat = this;
		$('#screenArea img').click(function(e){
			var offset = $(this).offset();
			var left = (e.clientX - offset.left)*ratio;
			var top = (parseInt($(window).scrollTop()) + e.clientY - offset.top)*ratio;
			chat.socket.emit('message', { me: 'client', mytime: new Date(), data: [top, left], type: chat.typesMessages[4] });			
		});
		
	},
	startChat: function(){
		var chat = this;
		// send first message
		this.socket.emit('message', { me: 'support', mytime: new Date(), data: this.config.firstMessage, type: this.typesMessages[2] });
		
		$('#infoMessage').hide();
		$('#messageInput').css('display', 'block');
		$('.chat_over').show();
		$('.screen_area').addClass('active');
		
		$('#newScreen').click(function(){
			chat.socket.emit('message', { me: 'support', mytime: new Date(), type: chat.typesMessages[3] });
		});
		this.chatSend.bind('keydown', function (event){
			if (event.keyCode == 13){
				chat.sendMessage();
			}
		});
	},
	sendMessage: function(e){
		var text = this.chatSend.val();
		this.chatSend.val('');
		this.socket.emit('message', { me: 'support', mytime: new Date(), data: text, type: this.typesMessages[2] });
		this.addMessage(text, true);
	},
	addMessage: function(message, me){
		var label = (me) ? this.config.langTextMe : this.config.langTextSupport;
		var classMessage = (me) ? 'me' : 'support';
		var html = '<li class="chat_item '+classMessage+'"><b>' + label + ':</b> ' + message + '</li>'+ this.chatList.html();
		this.chatList.html(html);
	}
};

var AdminChat = new Chat({
	langTextMe: 'Оператор',
	langTextSupport: 'Посетитель',
	langTextQuery: 'Есть запрос от посетителя. Войти в чат? <a id="openChat" class="btn btn-success">Да</a>',
	firstMessage: 'Добрый день, чем могу помочь?'
});
