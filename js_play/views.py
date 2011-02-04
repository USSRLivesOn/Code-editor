from django.template.defaultfilters import force_escape
from djangomako.shortcuts import render_to_response, render_to_string
from helpers.directory_helpers import LocalDirectory, RemoteDirectory
from helpers.file_helpers import LocalFile, RemoteFile


def index (request, view_type):
	if view_type == 'local':
		dir_obj = LocalDirectory()
		file_obj = LocalFile()
		starting_file = 'js_play/views.py' # temp default
	elif view_type == 'remote':
		dir_obj = RemoteDirectory()
		file_obj = RemoteFile()
		starting_file = ''
	current_dir = dir_obj.get_current_dir()
	dir_structure = dir_obj.get_dir_structure(current_dir)
	f_contents = file_obj.get_file_contents(current_dir + '/' + starting_file)
	return render_to_response('js_play/templates/editor.html',
		{'dir_structure': dir_structure, 'file_contents': f_contents, 'file_path': starting_file})


# TODO: make environment-agnostic (local vs. remote)
def ajax_save_file (request):
	if request.method == 'POST':
		file_contents = request.POST['file_contents']
		file_path = request.POST['file_path']
		# validate here
		save_file_contents(get_current_dir() + file_path, file_contents)
	return render_to_response('js_play/templates/ajax.html', {'output': ''})


# TODO: make environment-agnostic (local vs. remote)
def ajax_get_file (request):
	file_path = request.GET['file_path']
	# validate here
	file_contents = get_file_contents(get_current_dir() + file_path)
	return render_to_response('js_play/templates/ajax.html', {'output': file_contents})