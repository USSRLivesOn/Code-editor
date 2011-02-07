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
	def get_file_contents (self, full_file_path, escape_to_html):
		#print 'attempting to retrieve: ' + full_file_path
		try: 
			with open(full_file_path, 'r') as f:
				f_contents = f.read()
				if escape_to_html:
					f_contents = self.raw_to_html(f_contents)
				return f_contents
		except:
			return ''


	def save_file_contents (self, full_file_path, contents):
		#contents = self.html_to_raw(contents)
		try:
			with open(full_file_path, 'w') as f:
				f.write(contents)
				#print 'would have saved stuff in: ' + full_file_path
		except:
			print 'Error saving to:', full_file_path

class RemoteFile(File):

	def get_file_contents (self, full_file_path, escape_to_html):
		return ''
	
	def save_file_contents (self, full_file_path, contents):
		pass