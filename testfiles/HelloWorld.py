import sys
import numpy as np
from helpers.file_utils import read_params_file, write_params_file

params_file = sys.argv[1]
data = read_params_file(params_file)
results = []
message = "Hello World!"
if data:
    signals = [np.array([float(i) for i in signal.split()]) for signal in data]
    for signal in signals:
        results.append(message)
else:
    results.append(message)

write_params_file(params_file, results) 
print(params_file)