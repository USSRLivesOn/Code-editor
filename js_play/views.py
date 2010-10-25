import os, pprint
from django.template.defaultfilters import force_escape
#from django.shortcuts import render_to_response
from djangomako.shortcuts import render_to_response, render_to_string


def index (request):
	starting_file = 'js_play/views.py' # temp default
	current_dir = get_current_dir()
	#topdir_name = current_dir[current_dir.rfind(os.sep) + 1:]
	dir_structure = get_dir_structure(current_dir)
	f_contents = get_file_contents(current_dir + os.sep + starting_file)
	return render_to_response('js_play/templates/editor.html',
		{'dir_structure': dir_structure, 'file_contents': f_contents, 'file_path': starting_file})


def get_dir_structure (current_dir):
	exclude_dot_dirs = True
	exclude_dot_files = True
	excluded_dirs = ['bespin']
	excluded_extensions = ['.pyc']
	
	walk_results = []
	for root, dirs, filenames in os.walk(current_dir):
		for directory in dirs[:]: # iterate over a copy to avoid skipping items after removal
			if directory in excluded_dirs or (exclude_dot_dirs == True and len(directory) >= 1 and directory[0] == '.'):
				dirs.remove(directory)
		files = []
		for filename in filenames:
			(name, ext) = os.path.splitext(filename)
			if ext not in excluded_extensions and not (exclude_dot_files == True and len(name) >= 1 and name[0] == '.'):
				filepath = os.path.join(root[len(current_dir):], filename)
				files.append({'name': filename, 'path': filepath})
		walk_results.append({'path': root[len(current_dir) + 1:], 'dirs': dirs, 'files': files})

	pp = pprint.PrettyPrinter(indent = 0)
	#pp.pprint(walk_results)

	dir_structure = {'files': [], 'dirs': []}
	for result in walk_results:
		target_path = dir_structure
		if result['path'] != '':
			path_parts = result['path'].split(os.sep)
			for part in path_parts:
				if part not in [dir['name'] for dir in target_path['dirs']]:
					target_path['dirs'].append({'name': part, 'contents': {'files': [], 'dirs': []}})
				target_path = target_path['dirs'][-1]['contents']
		target_path['files'] = result['files']
		for i in ['files', 'dirs']:
			if len(target_path[i]) > 1:
				target_path[i].sort(key = lambda x: x['name'])

	pp.pprint(dir_structure)
	return dir_structure


# requires full file path, not relative
def get_file_contents (full_file_path):
	#print 'attempting to retrieve ' + full_file_path
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
		save_file_contents(get_current_dir() + os.sep + file_path, file_contents)
	return render_to_response('js_play/templates/ajax.html', {'output': ''})


def ajax_get_file (request):
	file_path = request.GET['file_path']
	file_contents = get_file_contents(get_current_dir() + os.sep + file_path)
	return render_to_response('js_play/templates/ajax.html', {'output': file_contents})


def raw_to_html (raw):
	raw = raw.replace('\t', ' '*4)
	return raw


def html_to_raw (html):
	html = html.replace(' '*4, '\t')
	return html


def get_current_dir ():
	return os.getcwd()