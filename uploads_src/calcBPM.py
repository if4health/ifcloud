import json
import numpy as np
from biosppy.signals import ecg
import sys
from helpers.file_utils import read_params_file, write_params_file

class NDArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

def main():
    params_file = sys.argv[1]
    data = read_params_file(params_file)
    signals = [np.array([float(i) for i in signal.split()]) for signal in data]
    
    results = []
    for signal in signals:
        out = ecg.ecg(signal=signal, sampling_rate=360, show=False)
        heart_rate = out["heart_rate"].tolist()

        results.append(heart_rate)
    
    # json_results = json.dumps(results, cls=NDArrayEncoder, indent=4)
    write_params_file(params_file, results) 
    print(params_file)

if __name__ == '__main__':
    main()
