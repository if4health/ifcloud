from helpers.script_runner import run

def processHelloWorld(data):
    return ["Hello World!" for _ in (data or [1])]

if __name__ == "__main__":
    run(process_function=processHelloWorld, prepare_signals=False, min_derivations=1)
