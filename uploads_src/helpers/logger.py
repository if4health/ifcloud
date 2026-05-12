import sys

def debug(label, value=None):
    if value is not None:
        print(f"[DEBUG] {label}: {value}", file=sys.stderr)
    else:
        print(f"[DEBUG] {label}", file=sys.stderr)