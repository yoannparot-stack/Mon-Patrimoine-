"""Prepare isolated client sources with disabled purchases; never deploy."""
from client_build import prepare
import sys
prepare(sys.argv[1], 'commercial')
print('Commercial sources prepared: all personal bypasses removed; purchases disabled; server access required.')
