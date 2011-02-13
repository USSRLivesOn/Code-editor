$(document).ready(function () {
	bind_file_drawer();
	bind_saving();
	bind_tabs();
	init_editor();
	init_tabs();
});

function init_editor () {
	editor = ace.edit("input_area");
	editor.setTheme("ace/theme/idle_fingers");
	var PythonMode = require("ace/mode/python").Mode;
	editor.getSession().setMode(new PythonMode());
	editor.setSelectionStyle('text');
	editor.renderer.setShowPrintMargin(false);
	EditSession = require("ace/edit_session").EditSession;
	UndoManager = require("ace/undomanager").UndoManager;
}

function bind_file_drawer () {
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
	$('#file_drawer .dirname').click(function (e) {
		e.preventDefault();
		$(this).toggleClass('collapsed').next().slideToggle(200, 'easeOutCubic');
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

/* Only works for 1 default tab open for now */
function init_tabs () {
	tabs = []; /* global */
	var index, file_name, file_path, contents;
	$('#editor_tabs li a').each(function () {
		index = parseInt($(this).attr('id').substr(4), 10);
		file_name = $(this).html();
		file_path = $(this).attr('href').replace(/(.*)#/, '');
		if (file_path !== '') {
			contents = get_editor_contents();
			tabs[index] = {'file_name': file_name, 'file_path': file_path, 'contents': contents};
			tabs[index].cursor_pos = {'row': 0, 'column': 0};
		}
	});
}

function bind_tabs () {
	$('#editor_tabs a').live('click', function (e) {
		e.preventDefault();
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

// Adds tab to list of available tabs and returns index
// Returns index of existing tab if the file is already open
function add_tab (file_name, file_path, contents) {
	var i;
	for (i=0; i<tabs.length; i+=1) {
		if ((typeof(tabs[i].file_path) !== 'undefined') && (tabs[i].file_path === file_path)) {
			return i;
		}
	}
	var tab_index = tabs.length;
	tabs[tab_index] = {'file_name': file_name, 'file_path': file_path, 'contents': contents};
	tabs[tab_index].cursor_pos = {'row': 0, 'column': 0};
	var tab_string = '<li><a id="tab_' + tab_index + '" href="#">' + file_name + '</a></li>';
	$('#editor_tabs ul').append(tab_string);
	return tab_index;
}

function focus_tab (target_tab_id) {
	var current_tab_id = get_current_tab_id();
	if (current_tab_id === -1) {
		$('#editor_tabs #tab_-1').remove();
	} else if (typeof(tabs[current_tab_id]) !== 'undefined') {
		tabs[current_tab_id].contents = get_editor_contents();
		tabs[current_tab_id].cursor_pos = get_cursor_position();
	}
	if (typeof(tabs[target_tab_id]) !== 'undefined') {
		var syntax_mode = get_syntax_mode(tabs[target_tab_id].file_path);
		set_editor_contents(tabs[target_tab_id].contents, syntax_mode);
		$('#tab_' + target_tab_id).parent().addClass('current').siblings().removeClass('current');
		set_cursor_position(tabs[target_tab_id].cursor_pos);
	}
}

function get_current_tab_id () {
	return parseInt($('#editor_tabs .current a').attr('id').substr(4), 10);
}

function get_cursor_position () {
	return editor.getCursorPosition();
}

function set_cursor_position (pos) {
	editor.moveCursorToPosition(pos);
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
	types.coffee = 'coffee';
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

function set_editor_contents (content, Syntax_mode) {
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
	return file_contents;
}