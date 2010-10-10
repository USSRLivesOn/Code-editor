import os, pprint
from django.template.defaultfilters import force_escape
from django.shortcuts import render_to_response


def index (request):
	current_dir = get_current_dir()
	topdir_name = current_dir[current_dir.rfind('/') + 1:]
	starting_file = '/js_play/views.py' # temp default
	dir_structure = get_dir_structure(current_dir)
	f_contents = get_file_contents(current_dir + starting_file)
	return render_to_response('js_play/templates/editor.html',
		{'dir_structure': dir_structure, 'file_contents': f_contents, 'file_path': starting_file})


def get_dir_structure (current_dir):
	walk_results = []
	for root, dirs, filenames in os.walk(current_dir):
		files = []
		for f in filenames:
			(filename, extension) = os.path.splitext(f)
			if filename[0] == '.' or extension[1:] == 'pyc':
				hidden = True
			else:
				hidden = False
			files.append({'name': f, 'hidden': hidden, 'full_path': root[len(current_dir):] + f})
		if root[len(current_dir) + 1:len(current_dir) + 4] != '.hg':
			walk_results.append({'path': root[len(current_dir)+1:], 'dirs': dirs, 'files': files})
	
	dir_structure = {}
	for item in walk_results:
		target_path = dir_structure
		if item['path'] != '':
			path_parts = item['path'].split('/')
			for part in path_parts:
				if part not in target_path['dirs']:
					target_path['dirs'][part] = {}
				target_path = target_path['dirs'][part]
		if len(item['dirs']) > 0:
			target_path['dirs'] = {}
			for dir_name in item['dirs']:
				target_path['dirs'][dir_name] = {}
		target_path['files'] = item['files']
	
	pp = pprint.PrettyPrinter(indent=4)
	pp.pprint(dir_structure)
	#dir_structure = walk_results
	return dir_structure


def get_file_contents (full_file_path):
	with open(full_file_path, 'r') as f:
		f_contents = f.read()
		f_contents = raw_to_html(f_contents)
		return f_contents


def save_file_contents (full_file_path, contents):
	contents = html_to_raw(contents)
	try:
		f = open(full_file_path, 'w')
		#temp_file = tmpfile()
		# create new file with contents
		# remove rename old file
		# rename new file
		# delete old file
		f.write(contents)
		f.close()
	except:
		print 'some error occurred...'


def ajax_save_file (request):
	if request.method == 'POST':
		file_contents = request.POST['file_contents']
		file_path = request.POST['file_path']
		save_file_contents(get_current_dir() + file_path, file_contents)
	return render_to_response('js_play/templates/ajax.html', {'output': ''})


def ajax_get_file (request):
	file_path = request.GET['file_path']
	file_contents = get_file_contents(get_current_dir() + file_path)
	return render_to_response('js_play/templates/ajax_safe.html', {'output': file_contents})


def raw_to_html (raw):
	raw = raw.replace('\t', ' '*4)
	return raw


def html_to_raw (html):
	html = html.replace(' '*4, '\t')
	return html


def get_current_dir ():
	return os.getcwd()