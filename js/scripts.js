global_env = [];

$(document).ready(function() {
	bind_filenames();
	bind_saving();
	bind_tabs();

	editor = ace.edit("input_area");
	editor.setTheme("ace/theme/idle_fingers");
	var PythonMode = require("ace/mode/python").Mode;
	editor.getSession().setMode(new PythonMode());
	editor.setSelectionStyle('text');
	editor.renderer.setShowPrintMargin(false);
	EditSession = require("ace/edit_session").EditSession;
	UndoManager = require("ace/undomanager").UndoManager;
});

function bind_tabs() {
	$('#editor_tabs a').click(function (e) {
		e.preventDefault();
	});
	$('#editor_tabs ul').sortable({
		items: 'li',
		axis: 'x',
		tolerance: 'intersect', /* don't think this is working */
		revert: 150
	});
}

function bind_filenames() {
	$('#file_drawer a').click(function (e) {
		e.preventDefault();
		var file_path = $(this).attr('href').replace(/(.*)#/, '');
		var file_name = $(this).html();
		$.ajax({
			type: 'GET',
			url: '/ajax_get_file/',
			data: {'file_path': file_path},
			dataType: 'text',
			cache: false,
			success: function(result) {
				var syntax_mode = get_syntax_mode(file_path);
				var new_doc = new EditSession(result);
				new_doc.setMode(new syntax_mode());
				new_doc.setUndoManager(new UndoManager());
				editor.setSession(new_doc);
				editor.focus();
				$('#current_filepath').html(file_path);
				$('#editor_tabs a.current').html(file_name);
			}
		}); 
	});
}

function bind_saving() {
	var save_function = function (e) {
		e.preventDefault();
		var file_path = $('#current_filepath').html();
		var editor_session = editor.getSession();
		var length = editor_session.getLength();
		var file_contents = editor_session.getLines(0, length).join("\n");
		console.log(file_contents);
		$.ajax({
			type: 'POST',
			url: '/ajax_save_file/',
			data: {'file_path': file_path, 'file_contents': file_contents},
			cache: false,
			success: function(request, status_text) {}
		});
	}
	$('#save_current').click(save_function);
}

function get_syntax_mode (file_path) {
	var extension = file_path.match(/\.[^\.]+$/);
	if (extension === null) { // for files without an extension
		extension = ''
	} else {
		extension = extension[0].substr(1);
	}
	var types = {}
	types.js = 'javascript';
	types.xml = 'xml';
	types.html = 'html';
	types.css = 'css';
	types.scss = 'css';
	types.py = 'python';
	types.php = 'php';
	types.java = 'java';
	types.rb = 'ruby';
	if (extension in types) {
		var mode = require("ace/mode/" + types[extension]).Mode;
	} else {
		var mode = require("ace/mode/text").Mode;
	}
	return mode;
}