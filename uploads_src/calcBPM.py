import json
import numpy as np
from biosppy.signals import ecg
from helpers.script_runner import run

class NDArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)

def proccessCalcBPM(data):
    results = []
    for signal in data:
        out = ecg.ecg(signal=signal, sampling_rate=360, show=False)
        heart_rate = out["heart_rate"].tolist()

        results.append(heart_rate)
    return results

if __name__ == '__main__':
    run(process_function=proccessCalcBPM, prepare_signals=True, min_derivations=1)