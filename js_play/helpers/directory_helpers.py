import os, re, pprint
from fabric.api import * #env, settings, cd, local, run

#pp = pprint.PrettyPrinter(indent = 0)

class Directory:
	''' Abstract class '''

	exclude_dot_dirs = True
	exclude_dot_files = True # not yet implemented for remote
	excluded_dirs = ['images'] # not yet implemented for remote
	excluded_extensions = ['pyc']

	def parse_walk_results (self, walk_results):
		dir_structure = {'files': [], 'dirs': []}
		for result in walk_results:
			target_path = dir_structure
			if result['path'] != '':
				path_parts = result['path'].split(self.DIR_SEPARATOR)
				for part in path_parts:
					if part not in [dir['name'] for dir in target_path['dirs']]:
						target_path['dirs'].append({'name': part, 'contents': {'files': [], 'dirs': []}})
					target_path = target_path['dirs'][-1]['contents']
			target_path['files'] = result['files']
			for i in ['files', 'dirs']:
				if len(target_path[i]) > 1:
					target_path[i].sort(key = lambda x: x['name'])
		return dir_structure


class RemoteDirectory(Directory):
	''' Assumes we're on a Unix-based system  '''

	def __init__(self):
		self.DIR_SEPARATOR = '/'

	def get_current_dir (self):
		return '/sites/editor'

	def get_dir_structure (self, current_dir):
		from django.conf import settings as django_settings
		host = django_settings.EDITOR_REMOTE_HOST
		user = django_settings.EDITOR_REMOTE_USER
		password = django_settings.EDITOR_REMOTE_PASS

		with settings(hide('everything'), host_string=host, user=user, password=password, warn_only=True):
			with cd(current_dir):
				ls_options = 'RFA1'
				ls_output = run("ls -%s" % ls_options)
		ls_output = ls_output.splitlines()

		# this code could probably be cleaned up quite a bit
		filtered_ls_output = []
		exclude_flag = False
		for line in ls_output:
			if self.exclude_dot_dirs and re.search(r"^\./\..*:$", line) != None: # dot directory
				exclude_flag = True
			elif exclude_flag == True and re.search(r"^\..*:$", line) != None: # non-dot directory
				exclude_flag = False
			if exclude_flag == False:
				extension_regex = '\.' + '|\.'.join(self.excluded_extensions)
				if line != '' and (len(self.excluded_extensions) == 0 or re.search(r".*(%s){1}$" % extension_regex, line)) == None:
					filtered_ls_output.append(line)
		
		walk_results = []
		current_set = {'dirs': [], 'files': [], 'path': ''}
		for i in filtered_ls_output:
			if i[-1] == ':':
				walk_results.append(current_set)
				current_path = i[2:-1]
				current_set = {'dirs': [], 'files': [], 'path': current_path}
			elif i[-1] == '/':
				current_set['dirs'].append(i[:-1])
			else:
				current_set['files'].append({'name': i, 'ext': i.rsplit('.', 1)[-1], 'path': current_path + '/' + i})
		walk_results.append(current_set)

		#pp.pprint(walk_results)
		dir_structure = self.parse_walk_results(walk_results)
		#pp.pprint(dir_structure)
		return dir_structure


class LocalDirectory(Directory):

	def __init__(self):
		self.DIR_SEPARATOR = os.sep

	def get_current_dir (self):
		from django.conf import settings
		return settings.EDITOR_PWD
		# return os.getcwd()

	def get_dir_structure (self, current_dir):		
		walk_results = []
		for root, dirs, filenames in os.walk(current_dir):
			for directory in dirs[:]: # iterate over a copy to avoid skipping items after removal
				if directory in self.excluded_dirs or (self.exclude_dot_dirs == True and len(directory) >= 1 and directory[0] == '.'):
					dirs.remove(directory)
			files = []
			for filename in filenames:
				(name, ext) = os.path.splitext(filename)
				ext = ext[1:]
				if ext not in self.excluded_extensions and not (self.exclude_dot_files == True and len(name) >= 1 and name[0] == '.'):
					filepath = os.path.join(root[len(current_dir):], filename)
					files.append({'name': filename, 'ext': ext, 'path': filepath})
			walk_results.append({'path': root[len(current_dir):], 'dirs': dirs, 'files': files})
		#pp.pprint(walk_results)

		dir_structure = self.parse_walk_results(walk_results)
		#pp.pprint(dir_structure)
		return dir_structure