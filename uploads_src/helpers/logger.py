import sys

def debug(label, value=None):
    if value is not None:
        print(f"[DEBUG] {label}: {value}", file=sys.stderr)
    else:
        print(f"[DEBUG] {label}", file=sys.stderr)
        
def info(label, value=None):
    if value is not None:
        print(f"[INFO] {label}: {value}", file=sys.stderr)
    else:
        print(f"[INFO] {label}", file=sys.stderr)