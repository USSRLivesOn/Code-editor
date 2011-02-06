from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
	#(r'^$', 'editor.js_play.views.index'),
	(r'^local/$', 'editor.js_play.views.index', {'session_type': 'local'}),
	(r'^remote/$', 'editor.js_play.views.index', {'session_type': 'remote'}),
	(r'^ajax_save_file/$', 'editor.js_play.views.ajax_save_file'),
	(r'^ajax_get_file/$', 'editor.js_play.views.ajax_get_file'),
	#(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    #(r'^admin/', include(admin.site.urls)),
	
	# only used during local development - bypassed via nginx in production
	(r'^css/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/Users/ussrliveson/Sites/editor/css'}),
	(r'^js/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/Users/ussrliveson/Sites/editor/js'}),
	(r'^images/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/Users/ussrliveson/Sites/editor/images'}),
)
