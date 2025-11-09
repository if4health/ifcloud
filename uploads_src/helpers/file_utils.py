import json
import sys

"""
    Read the data from file and convert to array
"""
def read_params_file(params_file):
    try:
        with open(params_file, 'r') as file:
            content = file.read().strip()
            if not content:
                return []
            return json.loads(content)
    except:
        return []

"""
    Write the result data in the entry file
"""
def write_params_file(params_file, data):
    try:
        with open(params_file, 'w') as file:
            json.dump(data, file)
    except IOError:
        print(f"Error to write in the file: {params_file}")
        sys.exit(1)
