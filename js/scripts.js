global_env = [];

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
			url: '/editor/ajax_get_file/',
			data: {'file_path': file_path},
			dataType: 'text',
			cache: false,
			success: function(result) {
				$("#input_area").html(result + "<p><br/></p>");
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
		file_contents =  file_contents.substring(file_contents.length - 12); /* strip the "<p><br/></p>" from the end */
		$.ajax({
			type: 'POST',
			url: '/editor/ajax_save_file/',
			data: {'file_path': file_path, 'file_contents': file_contents},
			cache: false,
			success: function(request, status_text) {}
		});
		return false;
	});
}

function bind_keyboard() {
	$(document).keydown(function (e) {
		if (e.keyCode == 9) { /* tab */
			var newNode = document.createTextNode("\t");
			var sel = rangy.getSelection();
			var range = sel.getRangeAt(0);
			range.insertNode(newNode);
			return false;
		} else if (e.keyCode == 13) { /* enter */
			var newNode = document.createTextNode("\n");
			var sel = rangy.getSelection();
			var range = sel.getRangeAt(0);
			range.insertNode(newNode);
			return false;
		}
	});
}