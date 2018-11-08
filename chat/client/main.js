$('#main-container').hide();
$('#main-container').fadeOut();
$('#controls').hide();
$('#controls').fadeOut();
$('#reply-tooltip').hide();
$('#copy-tooltip').hide();
$('#name').focus();

var time;
function rename() {
	var name = $('#name').val();
	if (isEmpty(name)) name = 'Guest';
	socket.emit('name', name);
	$('#prompt').fadeOut(200);
	$('#name-info').hide();
	$('#controls').animate({opacity: 'toggle'}, 500);
	$("#main-container").animate({ height: 'toggle', opacity: 'toggle' }, 500);
	$('#message').focus();
}
var socket = io();
socket.on('chats', data => {
  console.log(data);
	var reachedEnd = false;
	if (
		Math.abs(
			$('#chats')[0].scrollHeight -
				$('#chats').scrollTop() -
				$('#chats').outerHeight()
		) < 1
	) {
		reachedEnd = true;
	}
	$('#main-spinner').hide();
	var html = "";
	for(var d of data){
	  
	  var timeDiff = time - d.time;
	  var timeStr = "";
	  var secDiff = Math.floor(timeDiff / 1000);
	  var minDiff = Math.floor(timeDiff / (60 * 1000));
	  var hourDiff = Math.floor(timeDiff / (60 * 60 * 1000));
	  var dayDiff = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
	  if(minDiff >= 60) minDiff = minDiff % 60;
	  if(hourDiff >= 24) hourDiff = hourDiff % 24;
	  if(secDiff >= 60) secDiff = secDiff % 60;
	  timeStr = (dayDiff? dayDiff + "d ": "") + (hourDiff? hourDiff + "h ": "") + (minDiff? minDiff + "m ": "") + (!minDiff? secDiff + "s ": "") + "ago";
	  html += '<div class="message">' + d.message + ' <span class="time">'+timeStr+'</span>' + (d.id? '<button class="delete" id="'+d.id+'">Delete</button>': "") + '</div>';
	}
  $('#chats').html(html);
  $('.delete').hide();
	if (reachedEnd){
		$('#chats').scrollTop(
			$('#chats')[0].scrollHeight - $('#chats')[0].clientHeight
		);
	}

	if (data.length == 0) {
		$('#chats').html('<span class="red">No chats yet.</span>');
	}
});

socket.on('who', data => {
	$('#who').html('');
	for (var p of data) {
		$('#who').append("<span style='color:" + p.color + "'>" + p.name + '<br>');
	}
});
socket.on('time', data => {
  time = data;
})
function reply(name) {
	if (
		$('#message')
			.val()
			.search('@' + name) == -1
	) {
		$('#message').val('@' + name + ' ' + $('#message').val());
	}
}
function send() {
	var message = $('#message').val();
	if (!isEmpty(message)) {
		socket.emit('message', message);
		$('#message').val('');
	}
}


function isEmpty(txt) {
	if (txt.replace(/\s/g, '').length) return false;
	else return true;
}
$(document).on('click', '.name', function(e) {
	e.preventDefault();
	reply($(this).text());
	$('#message').focus();
});
$(document).on('click', '.message-content', function(e) {
	var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(this).text()).select();
  document.execCommand("copy");
  $temp.remove();
});
$(document).on('click', '.delete', function(e) {
  socket.emit('delete', $(this).attr('id'));
});
$(document).on('mouseover', '.name', function() {
	$('#reply-tooltip').fadeIn(0);
	var offset = $(this).offset();
	var scrollTop = $(window).scrollTop();
	$('#reply-tooltip').css({
		top: offset.top + scrollTop + 30 + 'px',
		left: offset.left + 'px'
	});
});
$(document).on('mouseleave', '.name', function() {
	$('#reply-tooltip').fadeOut(0);
});
$(document).on('mouseover', '.message-content', function() {
	$('#copy-tooltip').fadeIn(0);
	var offset = $(this).offset();
	var scrollTop = $(window).scrollTop();
	$('#copy-tooltip').css({
		top: offset.top + scrollTop + 30 + 'px',
		left: offset.left + 'px'
	});
});
$(document).on('mouseleave', '.message-content', function() {
	$('#copy-tooltip').fadeOut(0);
	
});
$(document).on('mouseover', '.message', function(){
  $(this).find('.delete').show();
});
$(document).on('mouseleave', '.message', function(){
  $(this).find('.delete').hide();
});
$('#message').keypress(e => {
	var code = e.keyCode || e.which;
	if (code == 13) {
		send();
	}
});
$('#name').keypress(e => {
	var code = e.keyCode || e.which;
	if (code == 13) {
		rename();
	}
});
