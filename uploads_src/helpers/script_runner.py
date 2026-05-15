
import sys
import os
import numpy as np
from helpers.file_utils import read_params_file, write_params_file
from helpers.logger import *

# Suppress TensorFlow logs below ERROR level
os.environ.setdefault('TF_CPP_MIN_LOG_LEVEL', '3')

def _validate_derivations(received_derivations, min_derivations, max_derivations=None):
    """
    Validates the number of received derivations

    @param received_derivations: Total number of received derivations.
    @param min_derivations: Minimum required number of derivations (inclusive).
    @param max_derivations: Maximum allowed number of derivations (inclusive), or None
    @raises Exception: If the number of derivations is below minimum, above maximum, or not a multiple of min_derivations.
    """
    if received_derivations < min_derivations:
        raise Exception(
            f"This script requires minimal {min_derivations} derivation(s). "
            f"Received: {received_derivations}"
        )

    # Only validates upper bound if max_derivations is defined
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
    Converts signal strings in each payload to numpy float arrays.

    @param payloads: List of dicts with keys 'signal' and optional 'metadata'.
    @returns: List of dicts with 'signal' as np.array of floats and original 'metadata'.
    @raises Exception: If any signal string cannot be converted to float.
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
    Responsible for validating and transforming input data in order to execute the algorithm and calls the output algorithm.

    @param process_function: The function to execute with the loaded payloads.
    @param prepare_signals: If True, converts each payload's signal string to np.array of floats.
    @param min_derivations: Minimum number of derivations required.
    @param max_derivations: Maximum number of derivations allowed, or None for no upper limit.
    @raises Exception: If signal conversion or process_function execution fails.
    """
    
    debug(f"[script_runner] function: {process_function.__name__}, min_derivations: {min_derivations}, max_derivations: {max_derivations}")
    
    # Read the params file path passed as a command-line argument
    params_file = sys.argv[1]
    payloads = read_params_file(params_file)
    
    debug(f"[script_runner] function: {process_function.__name__}, received_derivations: {len(payloads)}")
    
    _validate_derivations(received_derivations=len(payloads), min_derivations=min_derivations, max_derivations=max_derivations)

    # Convert sinal if prepare_signals is True
    if prepare_signals:
        try:
            payloads = _prepare_signals(payloads)
        except Exception:
            raise Exception("Error to convert data to numpy arrays")

    results = process_function(payloads)
    
    info("processed data", results)
    
    # Check if results is an array
    if not isinstance(results, list):
        results = [results]
        
    write_params_file(params_file, results)

    print(params_file)
    
    # Flush both streams to ensure all output is sent before the process exits
    sys.stdout.flush()
    sys.stderr.flush()
