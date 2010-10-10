$(document).ready(function() {
	var embed = tiki.require("embedded");
	var node = document.getElementById("input_area");
	bespin = embed.useBespin(node, {
		settings: {
			tabstop: 4,
			fontsize: 12
		}
	});
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