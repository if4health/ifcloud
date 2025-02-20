import sys
import numpy as np
from helpers.file_utils import read_params_file, write_params_file

params_file = sys.argv[1]
data = read_params_file(params_file)
signals = [np.array([float(i) for i in signal.split()]) for signal in data]
results = []
for signal in signals:
    message = "Hello World!"
    results.append(message)


write_params_file(params_file, results) 
print(params_file)