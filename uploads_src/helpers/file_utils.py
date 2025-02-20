# # file_utils.py

import json

# import sys

# def read_params_file():
#     if len(sys.argv) != 2:
#         print("Parâmetros inválidos!")
#         sys.exit(1)

#     params_file = sys.argv[1]

#     try:
#         with open(params_file, 'r') as file:
#             return file.read().strip()
#     except IOError:
#         print(f"Erro ao abrir o arquivo: {params_file}")
#         sys.exit(1)


# file_utils.py

import sys

def read_params_file(params_file):
    try:
        with open(params_file, 'r') as file:
            data = json.loads(file.read().strip())
        return data
    except IOError:
        print(f"Erro ao abrir o arquivo: {params_file}")
        sys.exit(1)
        
def write_params_file(params_file, data):
    try:
        with open(params_file, 'w') as file:
            json.dump(data, file)
            # data_as_str = '\n'.join([str(sublist) for sublist in data])
            # file.write(data_as_str)
    except IOError:
        print(f"Erro ao escrever no arquivo: {params_file}")
        sys.exit(1)



