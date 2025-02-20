import sys
import heapq
import json
from collections import defaultdict
from helpers.file_utils import read_params_file, write_params_file

codes = {}
freq = defaultdict(int)
minHeap = [] 

class MinHeapNode:
    def __init__(self, data, freq):
        self.left = None
        self.right = None
        self.data = data
        self.freq = freq

    def __lt__(self, other):
        return self.freq < other.freq

def storeCodes(root, current_code):
    if root is None:
        return
    if root.data != '$':
        codes[root.data] = current_code
    storeCodes(root.left, current_code + "0")
    storeCodes(root.right, current_code + "1")

def HuffmanCodes():
    global minHeap
    heapq.heapify(minHeap)
    while len(minHeap) != 1:
        left = heapq.heappop(minHeap)
        right = heapq.heappop(minHeap)
        top = MinHeapNode('$', left.freq + right.freq)
        top.left = left
        top.right = right
        heapq.heappush(minHeap, top)
    storeCodes(minHeap[0], "")

def calcFreq(string):
    freq.clear()
    for char in string:
        freq[char] += 1
    for key in freq:
        minHeap.append(MinHeapNode(key, freq[key]))

def process_string(input_string):
    global codes, freq, minHeap
    codes.clear() 
    minHeap = [] 
    calcFreq(input_string)
    HuffmanCodes()

    encoded_string = " ".join(codes[char] for char in input_string)
    return encoded_string

def main():
    params_file = sys.argv[1]
    data = read_params_file(params_file)

    results = []
    for string in data:
        encoded_result = process_string(string)
        results.append([encoded_result])

    json_results = json.dumps(results, indent=4)
    write_params_file(params_file, json_results)
    
    print(params_file)

if __name__ == "__main__":
    main()
