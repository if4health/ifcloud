import json
import numpy as np
from biosppy import storage
from biosppy.signals import ecg
import os
import sys

import sys

# from pymongo import MongoClient
from bson.objectid import ObjectId

if len(sys.argv) != 2:
    print("Parâmetros inválidos!")
    #Termina a execução do script
    sys.exit(1)

#Pega o caminho do arquivo com os parâmetros da função(dados)
params_file = sys.argv[1]

try:
    #Tenta abrir o arquivo para fazer a leitura dos dados
    with open(params_file, 'r') as file:
        #Atribui os dados do arquivo sem quebras de linhas e espaços em branco
        data = file.read().strip()
        #Converte o sinal em str para um array de floats
        signal = np.array([float(i) for i in data.split()])
except IOError:
    #Caso ocorra algum erro acima, a exception é executada e o código tem sua execução terminada
    print(f"Erro ao abrir o arquivo: {params_file}")
    sys.exit(1)
    
# process it and plot
out = ecg.ecg(signal=signal, sampling_rate=360, show=False)

class NDArrayEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return json.JSONEncoder.default(self, obj)


json_str = json.dumps({"filtered" : out['filtered'], 'rpeaks': out["rpeaks"],'bpm' :out["heart_rate"], "rate": 360}, cls=NDArrayEncoder, indent=4)

print(out["heart_rate"])

# with open('joined_filtered_100m.txt', 'w') as convert_file: 
#      convert_file.write(json_str)