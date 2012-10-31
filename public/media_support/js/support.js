Chat = function(options){
	this.config = options;
	this.typesMessages = ['startChat', 'closeChat', 'message', 'screen', 'showClick'];
	this.init();
};
Chat.prototype = {
	init: function(){
		this.includeStyle();
		this.widgetInsert();
		this.socket = io.connect('http://localhost:8080');
		this.chatContainer = document.getElementById('chatContainer');
		this.chatList = document.getElementById('supportChat');
		this.chatSend = document.getElementById('messageInput');
	},
	includeStyle: function(){
		var css = document.createElement('link');
		css.href = this.config.styles;
		css.rel = 'stylesheet';
		var fcss = document.getElementsByTagName('link')[0];
		fcss.parentNode.insertBefore(css, fcss);
	},
	widgetInsert: function(){
		// insert widget in document
		var body = document.getElementsByTagName("body")[0];
		body.innerHTML += this.config.controlHhtml;
	},
	askChat: function(el){
		this.sendScreen();
		// change styles of widget block
		var chat = this;
		el.style.display = 'none';		
		this.chatContainer.className += ' waiting';
		
		// listeting of messages
		this.listening();		
		
		// send request for chat
		this.socket.emit('message', { me: 'client', mytime: new Date(), type: this.typesMessages[0] });
	},
	startChat: function(){
		
		var chat = this;
		
		this.chatContainer.className += ' active';
		this.chatSend.onkeypress = function (event){
			if (event.keyCode == 13){
				chat.sendMessage();
			}
		};
	},
	closeChat: function(){
		
	},
	sendScreen: function(){
		var chat = this;
	
		// send screen to support
		html2canvas( [ document.body ], {
			onrendered: function(canvas) {
				var width = canvas.getAttribute('width');
				var height = canvas.getAttribute('height');
				// base64
				var data = canvas.toDataURL("image/png").replace(/^data:image\/png;base64,/,"");													

				$.ajax({ 
					type: 'POST',
					url: '/image',
					data: {
						image: data,
						name: Math.floor((Math.random()*1000)+1),
					},
                    dataType: 'json',
					success: function(data) {
						chat.socket.emit('message', { me: 'client', mytime: new Date(), data: [data.image, width, height], type: chat.typesMessages[3] });
					}
				});			
			}
		});
	},
	sendMessage: function(e){
		var text = this.chatSend.value;
		this.chatSend.value = '';
		this.socket.emit('message', { me: 'client', mytime: new Date(), data: text, type: this.typesMessages[2] });
		this.addMessage(text, true);
	},
	addMessage: function(message, me){
		var label = (me) ? this.config.langTextMe : this.config.langTextSupport;
		var classMessage = (me) ? 'me' : 'support';
		$(this.chatList).append('<li class="chat_item '+classMessage+'"><b>' + label + ':</b> ' + message + '</li>');
		// scroll
		var objDiv = document.getElementById('supportChat');
		objDiv.scrollTop = objDiv.scrollHeight;
	},
	showClick: function(coordinates){
		clearTimeout(this.timeout);
		$('.show_cursor').css({'top': coordinates[0]+'px', left: coordinates[1]+'px'});
		$('.show_cursor').show();
		this.timeout = setTimeout(function(){
			$('.show_cursor').hide();
		}, 5000);
	},
	listening: function(){
		var chat = this;
		this.socket.on('message', function (message) {
			switch(message.type){
				case chat.typesMessages[0]:
					chat.startChat();
					break;
				case chat.typesMessages[1]:
					chat.closeChat();
					break;
				case chat.typesMessages[2]:
					chat.addMessage(message.data, false);
					break;
				case chat.typesMessages[3]:
					chat.sendScreen();
					break;
				case chat.typesMessages[4]:
					chat.showClick(message.data);					
					break;
				default:
			};
		});
	}
};

var FrontChat = new Chat({
	controlHhtml: '<div class="chat_container" id="chatContainer"><a onClick="FrontChat.askChat(this)" class="start_chat">Слудба поддержки</a><div class="waiting_label">Ожидаем оператора</div><ul class="chat_list" id="supportChat"></ul><input id="messageInput" type="text" class="send_message" /></div><div class="show_cursor"></div>',
	langTextMe: 'Я',
	langTextSupport: 'Оператор',
	styles: 'media_support/css/styles.css'
});

