import numpy as np
import pandas as pd
import pywt
import statistics
import keras
from keras import layers
import tensorflow as tf
import sys
from biosppy.signals import ecg
from helpers.file_utils import read_params_file, write_params_file
import json


#Functions
class NDArrayEncoder(json.JSONEncoder):
  def default(self, obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    return json.JSONEncoder.default(self, obj)

#Functions
def calcRPEAKS(signal):
  # process it and plot
  out = ecg.ecg(signal=signal, sampling_rate=360, show=False)
  
  json_str = json.dumps({"filtered" : out['filtered'], 'rpeaks': out["rpeaks"],'bpm' :out["heart_rate"], "rate": 360}, cls=NDArrayEncoder, indent=4)

  data = out["rpeaks"]
  arr_data = np.array([str(item) for item in data])
  return arr_data

def band_filter(signal):
    # Band pass Filter
    # Create a copy of the input signal
    sig = signal.copy()

    # Apply the low pass filter
    for index in range(len(signal)):
        sig[index] = signal[index]

        if index >= 1:
            sig[index] += 2 * sig[index - 1]

        if index >= 2:
            sig[index] -= sig[index - 2]

        if index >= 6:
            sig[index] -= 2 * signal[index - 6]

        if index >= 12:
            sig[index] += signal[index - 12]

    # Copy the result of the low pass filter
    result = sig.copy()

    # Apply the high pass filter
    for index in range(len(signal)):
        result[index] = -1 * sig[index]

        if index >= 1:
            result[index] -= result[index - 1]

        if index >= 16:
            result[index] += 32 * sig[index - 16]

        if index >= 32:
            result[index] += sig[index - 32]

    # Apply final filter adjustments
    for index in range(len(signal)):
        if index >= 1:
            result[index] = (
                result[index] - result[index - 1] + 0.995 * result[index - 1]
            )
        else:
            result[index] = 0

    # Normalize the result from the high pass filter
    max_val = max(max(result), -min(result))
    if max_val != 0:  # Prevent division by zero
        result = [val / max_val for val in result]

    return result
  
#Extrair Características Temporais
def carac_temp(df):
  vet_pre = []
  vet_post = []
  vet_loc = []
  vet_glob = []

  for index in range(len(df)):
    #Pre = Distância entre R anterior
    if(index>0):
      temp_pre = (df["R Peak"][index])-(df["R Peak"][index-1])
      vet_pre.append(temp_pre)
    else:
      vet_pre.append(0)

    #Post  = Distãncia entre R próximo
    if(index < len(df)-1):
      temp_post = (df["R Peak"][index+1])-(df["R Peak"][index])
      vet_post.append(temp_post)
    else:
      vet_post.append(0)

  df["pre"] = vet_pre
  df["post"] = vet_post

  for index in range(len(df)):
    #Local = Média entre 5 últimos RR e próximos 5 RR
    if((index>=5)and(index<len(df)-5)):
      temp_sum = 0
      for index2 in range(10):
        temp_sum += vet_post[index-5+index2]
      temp_loc = temp_sum/10
      vet_loc.append(temp_loc)
    else:
      vet_loc.append(0)

  df["loc"] = vet_loc

  #Global = Media entre todos os RR-Intervals
  temp_sum = 0
  for index in range(len(df)-1):
    temp_sum += df["post"][index]

  avg = temp_sum/(len(df)-1)

  df["glob"] = avg

  return df

#Extrair características morofológicas
def carac_morf(df):
  coef_max = []
  coef_min = []
  coef_mean = []
  coef_stndr_dev = []

  for index in range(len(df)):
    temp = df.loc[index].values
    vetor = temp[0:253]

    cA4, cD4, cD3, cD2, cD1 = pywt.wavedec(vetor,'db2', level=4)

    coef = np.concatenate((cA4, cD4, cD3, cD2, cD1))

    coef_max.append(max(coef))
    coef_min.append(min(coef))
    coef_mean.append(statistics.mean(coef))
    coef_stndr_dev.append(statistics.stdev(coef))

  df['morf_max'] = coef_max
  df['morf_min'] = coef_min
  df['morf_mean'] =  coef_mean
  df['morf_stdr_dev']  = coef_stndr_dev

  return df

#Dataset para vetores Numpy
def adeq_dts(DF_MLII,DF_V5):
  colunas = ["pre", "post", "loc", "glob", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199", "200", "201", "202", "203", "204", "205", "206", "207", "208", "209", "210", "211", "212", "213", "214", "215", "216", "217", "218", "219", "220", "221", "222", "223", "224", "225", "226", "227", "228", "229", "230", "231", "232", "233", "234", "235", "236", "237", "238", "239", "240", "241", "242", "243", "244", "245", "246", "247", "248", "249", "250", "251", "252", "morf_max",	"morf_min",	"morf_mean",	"morf_stdr_dev"]

  #Convertendo para string colunas DF_MLII
  colunas_mlii = DF_MLII.columns
  colunas_mlii_str = []
  for index in range(len(colunas_mlii)):
    colunas_mlii_str.append(str(colunas_mlii[index]))

  colunas_v5 = DF_V5.columns
  colunas_v5_str = []
  for index in range(len(colunas_v5)):
    colunas_v5_str.append(str(colunas_v5[index]))

  #inserindo novas colunas
  DF_MLII.columns = colunas_mlii_str
  DF_V5.columns = colunas_v5_str

  #Adequando sequência dos dados
  DF_MLII = DF_MLII[colunas]
  DF_V5 = DF_V5[colunas]

  #Adequando para tensor
  base_MLII = []
  for index in range(len(DF_MLII)):
      base_MLII.append(DF_MLII.iloc[index].values)

  base_V5 = []
  for index in range(len(DF_V5)):
      base_V5.append(DF_V5.iloc[index].values)


  return base_MLII,base_V5

#Traduzindo predição realizada
def tpSig_predc(predc):
  carac_predic = []
  for index in range(len(predc)):
    temp_vet = predc[index].tolist()
    temp_var = -1
    temp_var = temp_vet.index(max(temp_vet))
    if(temp_var == 0):
      carac_predic.append("F")
    elif(temp_var == 1):
      carac_predic.append("N")
    elif(temp_var == 2):
      carac_predic.append("Q")
    elif(temp_var == 3):
      carac_predic.append("S")
    elif(temp_var == 4):
      carac_predic.append("V")
    # else: print("ERRO")
  return carac_predic


if __name__ == "__main__":
  tf.config.set_visible_devices([], 'GPU')  # Desativa todos os dispositivos GPU
  params_file = sys.argv[1]
  data = read_params_file(params_file)
  
  mlii = list(map(float, data[0].split()))
  v5 = list(map(float, data[1].split()))
  pos = np.arange(len(mlii))
  
#   # #Importando dados annotations MIT para DF
  r_peak = []
  tp_sig = []

  annotations_txt = open("uploads_src/200annotations.txt", "r")
  for index in annotations_txt:
    r_peak.append(index[15:21])
    tp_sig.append(index[26])
  annotations_txt.close()
  
  del r_peak[0]
  del r_peak[1]
  del tp_sig[0]
  del tp_sig[1]

  for index in range(len(r_peak)):
    r_peak[index] = int(r_peak[index])


#   # peaks = calcRPEAKS(mlii)
#   # for index in range(len(peaks) - 1):
#   #   r_peak.append(int(peaks[index]))

  mlii_filter = band_filter(mlii)
  v5_filter = band_filter(v5)
  
  for index in range(len(r_peak) - 1, -1, -1):  
    if r_peak[index] + 20 < len(v5_filter):
        r_peak[index] += 20
    else:
        r_peak.pop(index)  

  min_length = min(len(mlii_filter), len(v5_filter), len(pos))

  df = pd.DataFrame({
    "MLII": mlii_filter[:min_length],
    "V5": v5_filter[:min_length],
    "Temp": pos[:min_length]
  })
  

# # #Dividir por batida
  pnts_ant = 90
  pnts_post = 162

  bat_mlii = []
  bat_v5 = []
  loc_r_peak = []
  for index in range(len(r_peak)):
    sig_aux_mlii = []
    sig_aux_v5 = []
    
    if((r_peak[index]-1-pnts_ant >= 0) and (r_peak[index]+pnts_post < len(df["MLII"]))):
      sig_aux_mlii = df["MLII"][(r_peak[index]-1-pnts_ant):(r_peak[index]+pnts_post)].values
      sig_aux_v5 = df["V5"][(r_peak[index]-1-pnts_ant):(r_peak[index]+pnts_post)].values
      
      bat_mlii.append(sig_aux_mlii)
      bat_v5.append(sig_aux_v5)
      loc_r_peak.append(r_peak[index])
      
    
# # #Transformando em dataset
  df_mlii = pd.DataFrame(bat_mlii)
  df_v5 = pd.DataFrame(bat_v5)
  
# # #Inserindo informação da localização do pico R
  df_mlii["R Peak"] = loc_r_peak
  df_v5["R Peak"] = loc_r_peak 
   

# # #Extrair caracterísitcas temporais
  df_mlii = carac_temp(df_mlii)
  df_v5 = carac_temp(df_v5)  

# # #Extrair caracterísitcas morfológicas
  df_mlii = carac_morf(df_mlii)
  df_v5 = carac_morf(df_v5)  
  

# # ##Consolidar dataset
# # #Convertendo Dataset para matriz de vetores numpy
  base_MLII,base_V5 = adeq_dts(df_mlii,df_v5)

  base_MLII = np.asarray(base_MLII)
  base_V5 = np.asarray(base_V5)
  
    
# # #Predição e manipulação do resultado final
# # #Criando novo modelo
  size_sig = 261  # Size of vocabulary obtained when preprocessing text data
  type_sig = 4  # Number of departments for predictions

  ml2_input = keras.Input(batch_size = 8,shape=(size_sig,1), name="MLII")  # Variable-length sequence of ints
  v5_input = keras.Input(batch_size = 8,shape=(size_sig,1), name="V5")  # Variable-length sequence of ints

  ml2_features = layers.LSTM(50)(ml2_input)

  v5_features = layers.LSTM(50)(v5_input)  

# # # Merge all available features into a single large vector via concatenation
  x = layers.concatenate([ml2_features, v5_features])

# # # Stick a logistic regression for priority prediction on top of the features
  signal_pred = layers.Dense(5, name="signal_type")(x)
# # # Stick a department classifier on top of the features
  department_pred = layers.Dense(type_sig, name="department")(x)  

# # # Instantiate an end-to-end model predicting both priority and department
  model = keras.Model(
      inputs=[ml2_input, v5_input],
      outputs=[signal_pred],
  )

  model.compile(
      optimizer=keras.optimizers.Adam(1e-3),
      loss=[
          #keras.losses.BinaryCrossentropy(from_logits=True),
          keras.losses.CategoricalCrossentropy(from_logits=True),
      ],
      loss_weights=[1.0, 0.2],
      metrics=['accuracy'],
  )
  
  model.load_weights("uploads_src/200_model_900.h5")
  predic = model.predict([base_MLII,base_V5])
  vetor_final_predic = tpSig_predc(predic)

  
  # result = [
  #   ['N', 'F', 'O', 'P'],
  #   ['V', 'R', 'R', 'J']
  # ]
  # json_result = json.dumps(result)
  # print(json_result)  # Este print vai ser capturado no JavaScript
  
  # arr_results.append(vetor_final_predic)
  print(vetor_final_predic)  
  