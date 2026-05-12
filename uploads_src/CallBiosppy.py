import sys
import logging
import json
from biosppy.signals import ecg
import numpy as np
from helpers.script_runner import run

logging.basicConfig(level=logging.INFO)
class NDArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)
    
def proccessCallBiosppy(data):
    results = []
    for signal in data:
        out = ecg.ecg(signal=signal['signal'], sampling_rate=360, show=False)
        # heart_rate = out["heart_rate"].tolist()

        results.append(list(out[0]))
    return results    

if __name__ == "__main__":
    run(process_function=proccessCallBiosppy, prepare_signals=True, min_derivations=1, max_derivations=4)