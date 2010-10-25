global_env = [];

$(document).ready(function() {
	window.onBespinLoad = function() {
		var edit = document.getElementById("input_area");
		bespin.useBespin(edit).then(function(env) { /* https://bespin.mozillalabs.com/docs/releases/notes08.html */
			env.settings.set("fontsize", 12);
			var editor = env.editor;
			set_editor_to_defaults(editor);
			global_env = env; /* workaround, because retrieving env with require('environment').env (https://bespin.mozillalabs.com/docs/releases/notes09.html) doesn't work */
		}, function (error) {
			throw new Error("Bespin launch failed: " + error);
		});
	}
	bind_filenames();
	bind_saving();
});

function set_editor_to_defaults(editor) {
	editor.focus = true;
	editor.setLineNumber(0);
}

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
				var editor = global_env.editor;
				editor.value = result;
				set_editor_to_defaults(editor);
				$('#current_filepath').html(file_path);
			}
		});
		return false;
	});
}

function bind_saving() {
	$('#save_current').click(function () {
		var file_path = $('#current_filepath').html()
		var editor = global_env.editor;
		var file_contents = editor.value;
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