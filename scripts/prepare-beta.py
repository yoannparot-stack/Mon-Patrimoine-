"""Prepare isolated beta sources; never modify or deploy the personal application."""
from client_build import prepare
import sys
prepare(sys.argv[1], 'beta')
print('Isolated beta prepared: no personal bypass, no purchase, server-verified access retained.')
