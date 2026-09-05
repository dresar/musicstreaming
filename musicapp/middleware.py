from django.http import Http404
from django.template import loader
from django.http import HttpResponseNotFound

class Custom404Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_exception(self, request, exception):
        if isinstance(exception, Http404):
            template = loader.get_template('404.html')
            return HttpResponseNotFound(template.render({}, request))
        return None