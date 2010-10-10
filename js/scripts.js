$(document).ready(function() {
	window.onBespinLoad = function() {
		var edit = document.getElementById("input_area");
		bespin.useBespin(edit).then(function(env) {
			var editor = env.editor;
			env.settings.set("fontsize", 12);
			/*env.settings.set("highlightline", 1);*/
			env.settings.set("tabstop", 4);
			/*env.settings.set("tabmode", "tabs");*/
		}, function (error) {
			throw new Error("Bespin launch failed: " + error);
		});
	}
	bind_filenames();
	bind_saving();
});

function bind_filenames() {
	$('.file_name').click(function(e) {
		e.preventDefault();
		var file_path = $(this).attr('href').replace(/(.*)#/, '');
		$.ajax({
			type: 'GET',
			url: '/editor/ajax_get_file/',
			data: {'file_path': file_path},
			dataType: 'text',
			cache: false,
			success: function(result) {
				bespin.setValue(result);
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