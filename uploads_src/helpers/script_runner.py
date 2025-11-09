
import sys
import os
import numpy as np
from helpers.file_utils import read_params_file, write_params_file

os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')

def run(process_function, prepare_signals=False, min_derivations=1):
    """
    This function will execute python scripts with a "preset" around then

    process_function: function that will be executed
    prepare_signals: if True, every item in the data array will be transformad to np.array(float)
    min_derivations: minimal number of derivations required for the script
    """
    params_file = sys.argv[1]
    data = read_params_file(params_file)

    # Verify minimal number of derivations
    if not data or len(data) < min_derivations:
        raise Exception(f"This scripts requires minimal {min_derivations} derivations. Was received {0 if not data else len(data)}")

    # Convert sinal if prepare_signals is True
    if prepare_signals:
        try:
            data = [np.array([float(i) for i in signal.split()]) for signal in data]
        except Exception:
            raise Exception("Error to convert data to numpy arrays")

    results = process_function(data)

    # Check if results is a array
    if not isinstance(results, list):
        results = [results]

    write_params_file(params_file, results)

    print(params_file)
    sys.stdout.flush()
    sys.stderr.flush()
