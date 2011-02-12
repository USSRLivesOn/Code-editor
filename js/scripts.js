$(document).ready(function () {
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

function bind_filenames () {
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
				var newtab_index = add_tab(file_name, file_path, result);
				focus_tab(newtab_index);
			}
		}); 
	});
}

function bind_saving () {
	var save_function = function (e) {
		e.preventDefault();
		var tab_id = get_current_tab_id();
		var file_path = tabs[tab_id].file_path;
		var file_contents = get_editor_contents();
		$.ajax({
			type: 'POST',
			url: '/ajax_save_file/',
			data: {'file_path': file_path, 'file_contents': file_contents},
			cache: false,
			success: function(request, status_text) {}
		});
	};
	$('#save_current').click(save_function);
}

function bind_tabs () {
	tabs = []; /* global */
	$('#editor_tabs a').live('click', function (e) {
		e.preventDefault();
		var current_tab_id = get_current_tab_id();
		tabs[current_tab_id].contents = get_editor_contents();
		var target_tab_id = parseInt($(this).attr('id').substr(4), 10);
		focus_tab(target_tab_id);
	});
	$('#editor_tabs ul').sortable({
		items: 'li',
		axis: 'x',
		tolerance: 'intersect', /* don't think this is working */
		revert: 150
	});
}

function add_tab (file_name, file_path, contents) {
	var tab_index = tabs.length;
	tabs[tab_index] = {'file_name': file_name, 'file_path': file_path, 'contents': contents};
	var tab_string = '<li><a id="tab_' + tab_index + '" href="#">' + file_name + '</a></li>';
	$('#editor_tabs ul').append(tab_string);
	return tab_index;
}

function focus_tab (tab_index) {
	//console.log(tabs);
	//console.log(tab_index);
	if (typeof(tabs[tab_index]) !== 'undefined') {
		var syntax_mode = get_syntax_mode(tabs[tab_index].file_path);
		set_editor_content(tabs[tab_index].contents, syntax_mode);
		$('#tab_' + tab_index).parent().addClass('current').siblings().removeClass('current');
	}
}

function get_current_tab_id () {
	return parseInt($('#editor_tabs .current a').attr('id').substr(4), 10);
}

/* Accepts either a full file path or just a filename */
function get_syntax_mode (file_string) {
	var extension = file_string.match(/\.[^\.]+$/);
	if (extension === null) { // for files without an extension
		extension = '';
	} else {
		extension = extension[0].substr(1);
	}
	var types = {};
	types.js = 'javascript';
	types.xml = 'xml';
	types.html = 'html';
	types.css = 'css';
	types.scss = 'css';
	types.py = 'python';
	types.php = 'php';
	types.java = 'java';
	types.rb = 'ruby';
	types.cpp = 'c_cpp';
	types.h = 'c_cpp';
	types.coffee = 'coffee'
	var mode;
	if (extension in types) {
		var mode_obj = require("ace/mode/" + types[extension]);
		if (mode_obj === null) {
			$.ajax({
				async: false,
				url: '/js/ace/mode-' + types[extension] + '.js',
				type: 'script',
				success: function () {
					mode_obj = require("ace/mode/" + types[extension]);
				},
				error: function () {
					mode_obj = require("ace/mode/text");
				}
			});
			
		}
		mode = mode_obj.Mode;
	} else {
		mode = require("ace/mode/text").Mode;
	}
	return mode;
}

function set_editor_content (content, Syntax_mode) {
	var new_doc = new EditSession(content);
	new_doc.setMode(new Syntax_mode());
	new_doc.setUndoManager(new UndoManager());
	editor.setSession(new_doc);
	editor.focus();
}

function get_editor_contents () {
	var editor_session = editor.getSession();
	var length = editor_session.getLength();
	var file_contents = editor_session.getLines(0, length).join("\n");
	//console.log(file_contents);
	return file_contents;
}