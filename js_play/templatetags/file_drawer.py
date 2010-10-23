from django import template

register = template.Library()

@register.filter
def render_drawer(structure):
	return 'hello'

