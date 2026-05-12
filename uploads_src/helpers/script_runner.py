
import sys
import os
import numpy as np
from helpers.file_utils import read_params_file, write_params_file
from helpers.logger import *

os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')

def _validate_derivations(received_derivations, min_derivations, max_derivations=None):
    """
    Validates the number of received derivations against defined rules.

    @param received_derivations:              total number of received derivations
    @param min_derivations:    minimum required (inclusive)
    @param max_derivations:    maximum allowed (inclusive), or None for no upper limit
    """
    if received_derivations < min_derivations:
        raise Exception(
            f"This script requires minimal {min_derivations} derivation(s). "
            f"Received: {received_derivations}"
        )

    if max_derivations is not None and max_derivations >= min_derivations and received_derivations > max_derivations:
        raise Exception(
            f"This script allows {max_derivations} derivation(s). "
            f"Received: {received_derivations}"
        )

    if received_derivations % min_derivations != 0:
        raise Exception(
            f"This script requires a multiple of {min_derivations} derivation(s). "
            f"Received: {received_derivations}"
        )

def _prepare_signals(payloads):
    """
    Converts signal strings to numpy float arrays

    @param payloads: list of { signal, metadata }
    @returns: list of np.array
    @raises: Exception if conversion fails
    """
    try:
        return [
            {
                "signal": np.array([float(i) for i in p["signal"].split()]),
                "metadata": p.get("metadata", {})
            }
            for p in payloads
        ]
    except Exception:
        raise Exception("Error to convert data to numpy arrays")

def run(process_function, prepare_signals=False, min_derivations=1, max_derivations=None):
    """
    This function will execute python scripts with a "preset" around then

    process_function: function that will be executed
    prepare_signals: if True, every item in the data array will be transformad to np.array(float)
    min_derivations: minimal number of derivations required for the script
    """
    
    debug(f"[script_runner] function: {process_function.__name__}, min_derivations: {min_derivations}, max_derivations: {max_derivations}")
    
    params_file = sys.argv[1]
    payloads = read_params_file(params_file)
    
    _validate_derivations(received_derivations=len(payloads), min_derivations=min_derivations, max_derivations=max_derivations)
    
    # Verify minimal number of derivations
    # if not payloads or len(payloads) < min_derivations:
    #     raise Exception(
    #         f"This scripts requires minimal {min_derivations} derivations. "
    #         f"Was received {0 if not payloads else len(payloads)}"
    #     )

    # Convert sinal if prepare_signals is True
    if prepare_signals:
        try:
            payloads = _prepare_signals(payloads)
        except Exception:
            raise Exception("Error to convert data to numpy arrays")

    results = process_function(payloads)
    
    # Check if results is a array
    if not isinstance(results, list):
        results = [results]
        
    write_params_file(params_file, results)

    print(params_file)
    sys.stdout.flush()
    sys.stderr.flush()
