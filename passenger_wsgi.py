import os
import sys


# sys.path.insert(0, os.path.dirname(__file__))


# def application(environ, start_response):
#     start_response('200 OK', [('Content-Type', 'text/plain')])
#     message = 'Datagridder is currently undergoing maintainance, please come back in about 30minutes time -Thanks, the datagridder team\n'
#     version = 'Python %s\n' % sys.version.split()[0]
#     response = '\n'.join([message, version])
#     return [response.encode()]

from Gridder.wsgi import application
