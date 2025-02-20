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
    
    
    # out = ecg.ecg(signal=signals[0], sampling_rate=360, show=False)
    # rpeaks = out["rpeaks"].tolist()
    # arr_results = []
    # arr_results.append(rpeaks)
    # print(arr_results)
    
    results = []
    for signal in signals:
        out = ecg.ecg(signal=signal, sampling_rate=360, show=False)
        heart_rate = out["rpeaks"].tolist()

        results.append(heart_rate)
    
    print(json.dumps(results))
    
    # json_results = json.dumps(results, cls=NDArrayEncoder, indent=4)
    # print(json_results)
    # write_params_file(params_file, results)
    # print(params_file)

if __name__ == '__main__':
    main()
