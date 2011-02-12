from django.template.defaultfilters import force_escape
from djangomako.shortcuts import render_to_response, render_to_string
from helpers.directory_helpers import LocalDirectory, RemoteDirectory
from helpers.file_helpers import LocalFile, RemoteFile


def index (request, session_type):
	if session_type == 'local':
		starting_file = 'js_play/templates/editor.html' # temp default
		#starting_file = ''
		request.session['session_type'] = 'local'
	elif session_type == 'remote':
		starting_file = ''
		request.session['session_type'] = 'remote'
	file_obj, dir_obj = init_workers(session_type)
	current_dir = dir_obj.get_current_dir()
	dir_structure = dir_obj.get_dir_structure(current_dir)
	f_contents = file_obj.get_file_contents(full_file_path = current_dir + '/' + starting_file, escape_to_html = True)
	starting_filename = starting_file.rsplit('/', 1)[-1]
	return render_to_response('js_play/templates/editor.html',
		{'dir_structure': dir_structure, 'file_contents': f_contents, 'file_path': starting_file, 'file_name': starting_filename})


# TODO: add validation
def ajax_save_file (request):
	if not valid_session(request):
		return render_to_response('js_play/templates/ajax.html', {'output': 'Error: Invalid session.'})
	file_obj, dir_obj = init_workers(request.session['session_type'])
	if request.method == 'POST':
		file_contents = request.POST['file_contents']
		file_path = request.POST['file_path']
		current_dir = dir_obj.get_current_dir()
		file_obj.save_file_contents(current_dir + file_path, file_contents)
	return render_to_response('js_play/templates/ajax.html', {'output': ''})


# TODO: add validation
def ajax_get_file (request):
	if not valid_session(request):
		return render_to_response('js_play/templates/ajax.html', {'output': 'Error: Invalid session.'})
	file_obj, dir_obj = init_workers(request.session['session_type'])
	if request.method == 'GET':
		file_path = request.GET['file_path']
		current_dir = dir_obj.get_current_dir()
		file_contents = file_obj.get_file_contents(full_file_path = current_dir + file_path, escape_to_html = False)
		return render_to_response('js_play/templates/ajax.html', {'output': file_contents})
	return render_to_response('js_play/templates/ajax.html', {'output': 'Error: Invalid file requested.'})


# Validates current session as either local or remote
def valid_session (request):
	if 'session_type' not in request.session:
		return False
	elif request.session['session_type'] not in ('local', 'remote'):
		return False
	else:
		return True

# Initializes the correct file and directory objects based on session type
def init_workers (session_type):
	if session_type == 'local':
		file_obj = LocalFile()
		dir_obj = LocalDirectory()
	elif session_type == 'remote':
		file_obj = RemoteFile()
		dir_obj = RemoteDirectory()
	return file_obj, dir_obj