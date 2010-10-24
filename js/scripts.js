global_env = [];

$(document).ready(function() {
	window.onBespinLoad = function() {
		var edit = document.getElementById("input_area");
		bespin.useBespin(edit).then(function(env) { /* https://bespin.mozillalabs.com/docs/releases/notes08.html */
			env.settings.set("fontsize", 12);
			global_env = env; /* workaround, because retrieving env with require('environment').env (https://bespin.mozillalabs.com/docs/releases/notes09.html) doesn't work */
		}, function (error) {
			throw new Error("Bespin launch failed: " + error);
		});
	}
	bind_filenames();
	bind_saving();
});

function bind_filenames() {
	$('#file_drawer li.file a.file').click(function(e) {
		e.preventDefault();
		var file_path = $(this).attr('href').replace(/(.*)#/, '');
		$.ajax({
			type: 'GET',
			url: '/editor/ajax_get_file/',
			data: {'file_path': file_path},
			dataType: 'text',
			cache: false,
			success: function(result) {
				var env = global_env;
				var editor = env.editor;
				console.log(editor.syntax);
				editor.value = result;
				editor.syntax = 'python';
				$('#current_filepath').html(file_path);
			}
		});
	});
}

function bind_saving() {
	$('#save_current').click(function (e) {
		e.preventDefault();
		var file_path = $('#current_filepath').html()
		var file_contents = bespin.getValue();
		$.ajax({
			type: 'POST',
			url: '/editor/ajax_save_file/',
			data: {'file_path': file_path, 'file_contents': file_contents},
			cache: false,
			success: function(request, status_text) {}
		});
	});
}