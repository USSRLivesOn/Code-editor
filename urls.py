from django.conf.urls.defaults import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    (r'^editor/$', 'editor.js_play.views.index'),
	(r'^editor/ajax_save_file/$', 'editor.js_play.views.ajax_save_file'),
	(r'^editor/ajax_get_file/$', 'editor.js_play.views.ajax_get_file'),
	#(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    #(r'^admin/', include(admin.site.urls)),
	#(r'^css/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/Users/ussrliveson/Sites/editor/css'}),
	#(r'^js/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/Users/ussrliveson/Sites/editor/js'}),
	#(r'^bespin/(?P<path>.*)$', 'django.views.static.serve', {'document_root': '/Users/ussrliveson/Sites/editor/bespin'}),
)
