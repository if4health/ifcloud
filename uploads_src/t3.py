import sys
import logging
from biosppy.signals import ecg
import numpy as np
import json
from helpers.file_utils import read_params_file, write_params_file

class NDArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    
    params_file = sys.argv[1]
    data = read_params_file(params_file)
    signals = [np.array([float(i) for i in signal.split()]) for signal in data]
    
    
    # Defina os índices para o início e o fim do período desejado
    # start_index = int(sys.argv[2])
    # end_index = int(sys.argv[3])

    start_index = 4
    end_index = 10
    
    out = ecg.ecg(signal=signals[0][start_index:end_index], sampling_rate=360, show=False)
    print(out)
    
    # print(signals[0][start_index:end_index])
    

    # Selecione o período desejado do sinal
    # segment = arrFloat[start_index:end_index]

    # # Agora, você pode passar o segmento para o BioSPPy para análise

    # print(list(out[0]))
    
    
    # results = []
    # for signal in signals:
    #     segment = signal[start_index:end_index]
    #     out = ecg.ecg(signal=segment, sampling_rate=360, show=False)
    #     # heart_rate = out["heart_rate"].tolist()

    #     results.append(list(out[0]))
    
    # json_results = json.dumps(results, cls=NDArrayEncoder, indent=4)
    # write_params_file(params_file, json_results)
    
    # print(params_file)

    sys.stdout.flush()