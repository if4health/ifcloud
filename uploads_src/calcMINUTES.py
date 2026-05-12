import re
from helpers.script_runner import run

def processCalcMinutes(data):
    results = []
    for element in data:
        period = element['metadata']['period']
        signal = len(re.split(r"\s+", element['signal'].strip()))
        
        seconds = (signal * period) / 1000
        minutes = f"{(seconds / 60):.2f}"
        
        results.append(minutes)
    return results

if __name__ == '__main__':
    run(process_function=processCalcMinutes, prepare_signals=False, min_derivations=1, max_derivations=4)