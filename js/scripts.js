global_env = [];

const HACK = '<p id="hack"><br></p>';

$(document).ready(function() {
	bind_filenames();
	rangy.init();
	bind_keyboard();
	bind_saving();
});

function bind_filenames() {
	$('#file_drawer a.file').click(function() {
		var file_path = $(this).attr('href').replace(/(.*)#/, '');
		$.ajax({
			type: 'GET',
			url: '/ajax_get_file/',
			data: {'file_path': file_path},
			dataType: 'text',
			cache: false,
			success: function(result) {
				$("#input_area").html(result + HACK);
				$('#current_filepath').html(file_path);
			}
		});
		return false;
	});
}

function bind_saving() {
	$('#save_current').click(function () {
		var file_path = $('#current_filepath').html()
		var file_contents = $("#input_area").html();
		//console.log("before:\n" + file_contents);
		file_contents = file_contents.replace(HACK, '');
		if (file_contents.substr(0, 5) === '<div>') { // don't add a space for the div at the beginning of the file
			file_contents = file_contents.substring(5);
		}
		file_contents = file_contents.replace(/<div>/gi, "\n").replace(/<\/div>/gi, '').replace(/<br>/gi, '');
		//console.log("after:\n" + file_contents);
		$.ajax({
			type: 'POST',
			url: '/ajax_save_file/',
			data: {'file_path': file_path, 'file_contents': file_contents},
			cache: false,
			success: function(request, status_text) {}
		});
		check_endinput_hack();
		return false;
	});
}

function bind_keyboard() {
	$(document).keydown(function (e) {
		//var sel = rangy.getSelection();
		//console.log("anchor: (" + sel.anchorNode + "," + sel.anchorOffset + "); focus: (" + sel.focusNode + "," + sel.focusOffset + ")");
		if (e.keyCode === 9) { // tab
			var newNode = document.createTextNode("\t");
			var sel = rangy.getSelection();
			var range = sel.getRangeAt(0);
			range.insertNode(newNode);
			sel = rangy.getSelection();
			if (typeof(sel.anchorNode.nextSibling) !== 'undefined' && sel.anchorNode.nextSibling !== null && sel.anchorNode.nextSibling.nodeType === 3) {
				sel.collapse(sel.anchorNode.nextSibling, 1);
			}
			check_endinput_hack();
			return false;
		} else if (e.keyCode === 8) { // backspace
			check_endinput_hack();
			}
	});
}

function check_endinput_hack () {
	var input_area = $("#input_area");
	//console.log('checked');
	if (input_area.html().indexOf(HACK) === -1) {
		input_area.append(HACK);
		//console.log('fixed');
	}
}