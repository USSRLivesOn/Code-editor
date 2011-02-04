class File:
	''' Abstract class '''

	def raw_to_html (self, raw):
		''' Replicate effects of mako's html escaping with markupsafe.escape() '''
		html = raw.replace('&', '&amp;').replace('>', '&gt;').replace('<', '&lt;').replace("'", '&#39;').replace('"', '&#34;')
		return html

	def html_to_raw (self, html):
		''' Reverse effects of mako's html escaping with markupsafe.escape() '''
		raw = html.replace('&amp;', '&').replace('&gt;', '>').replace('&lt;', '<').replace('&#39;', "'").replace('&#34;', '"')
		return raw


class LocalFile(File):

	# requires full file path, not relative
	def get_file_contents (self, full_file_path):
		#print 'attempting to retrieve: ' + full_file_path
		with open(full_file_path, 'r') as f:
			f_contents = f.read()
			f_contents = self.raw_to_html(f_contents)
			return f_contents


	def save_file_contents (self, full_file_path, contents):
		contents = self.html_to_raw(contents)
		try:
			f = open(full_file_path, 'w')
			#temp_file = tmpfile()
			# create new file with contents
			# remove rename old file
			# rename new file
			# delete old file
			f.write(contents)
			f.close()
			#print 'would have saved stuff in: ' + full_file_path
		except:
			print 'some error occurred...'

class RemoteFile(File):

	def get_file_contents (self, full_file_path):
		return ''
	
	def save_file_contents (self, full_file_path, contents):
		pass