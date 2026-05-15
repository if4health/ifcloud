# FHIR Script Runner API

API responsável por executar algoritmos Python sobre recursos FHIR, permitindo o processamento de sinais biomédicos e o retorno automático em formato FHIR.

---

# Sumário

- [Visão Geral](#visão-geral)

- [Instalação](#instalação)
  - [Pré-requisitos](#pré-requisitos)
  - [Clonando o projeto](#clonando-o-projeto)
  - [Instalação das dependências Node.js](#instalação-das-dependências-nodejs)
  - [Instalação das dependências Python](#instalação-das-dependências-python)
  - [Configuração do arquivo .env](#configuração-do-arquivo-env)
  - [Explicação das variáveis de ambiente](#explicação-das-variáveis-de-ambiente)
  - [Executando a aplicação](#executando-a-aplicação)
  - [Verificando funcionamento](#verificando-funcionamento)

- [Arquitetura](#arquitetura)

- [Imagens do Sistema](#imagens-do-sistema)
  - [A - Algoritmos Disponíveis](#a---algoritmos-disponíveis)
  - [B - Campos do Formulário](#b---campos-do-formulário)
  - [C - Retorno do Script Executado](#c---retorno-do-script-executado)

- [Rotas](#rotas)
  - [Exemplo da rota /direct/params](#exemplo-da-rota-directparams)
  - [Exemplo da rota /run_script/operation](#exemplo-da-rota-run_scriptoperation)

- [Tipos de Requisição](#tipos-de-requisição)
  - [components](#components)
  - [1. byId](#1-byid)
  - [2. byIdAndMinute](#2-byidandminute)
  - [3. byIdAndMinuteInterval](#3-byidandminuteinterval)

- [Preparando Algoritmos Python](#preparando-algoritmos-python)
  - [Estrutura mínima do script](#estrutura-mínima-do-script)
  - [Exemplo completo - HelloWorld.py](#exemplo-completo---helloworldpy)

- [Explicação da função run](#explicação-da-função-run)

- [Estrutura dos Dados Recebidos no Python](#estrutura-dos-dados-recebidos-no-python)
  - [Campo signal](#campo-signal)
  - [Campo metadata](#campo-metadata)

- [Trabalhando com os dados dentro do algoritmo Python](#trabalhando-com-os-dados-dentro-do-algoritmo-python)
  - [Estrutura esperada no algoritmo](#estrutura-esperada-no-algoritmo)
  - [Explicação](#explicação)
  - [Observação importante](#observação-importante)

- [Exemplo de Entrada do Python](#exemplo-de-entrada-do-python)

- [Exemplo de Saída do Python](#exemplo-de-saída-do-python)

- [Conversão Automática do Retorno para FHIR](#conversão-automática-do-retorno-para-fhir)
- [Exemplo de retorno FHIR montado automaticamente com duas derivações](#exemplo-de-retorno-fhir-montado-automaticamente-com-duas-derivações)

- [Retorno dos Scripts](#retorno-dos-scripts)

- [Casos de Teste](#casos-de-teste)

---

---

# Visão Geral

A aplicação permite:

- Buscar recursos FHIR
- Extrair sinais biomédicos
- Executar scripts Python personalizados
- Retornar automaticamente os resultados em formato FHIR

Os algoritmos podem ser executados sobre:

- Um recurso específico
- Recursos de um minuto específico
- Recursos dentro de um intervalo de tempo

---

# Instalação

## Pré-requisitos

Antes de iniciar, é necessário possuir instalado:

- Node.js
- NPM
- Python 3
- Pip

---

## Clonando o projeto

```bash
git clone https://github.com/if4health/ifcloud
```

```bash
cd ifcloud
```

---

# Instalação das dependências Node.js

```bash
npm install
```

---

# Instalação das dependências Python

Instale as dependências utilizadas pelos algoritmos Python.

```bash
pip install -r requirements.txt
```

---

# Configuração do arquivo `.env`

Renomeie o arquivo `.env.example` para `.env` na raiz do projeto.

Exemplo:

```env

FHIR_API_URL=https://if4health.charqueadas.ifsul.edu.br/biofass/

PYTHON_EXECUTABLE=python3

PORT=8000

GRANT_TYPE=my_client_credentials

CLIENT_ID=my_client_id

CLIENT_SECRET=my_client_secret
```

---

# Explicação das variáveis de ambiente

| Variável | Descrição |
|---|---|
| `FHIR_URL` | URL do servidor FHIR |
| `PYTHON_EXECUTABLE` | Interpretador Python utilizado para executar os scripts |
| `PORT` | Porta em que o servidor será executado |
| `GRANT_TYPE` | Tipo de authenticação no servidor FHIR |
| `CLIENT_ID` | ID de authenticação no servidor FHIR |
| `CLIENT_SECRET` | SECRET de authenticação no servidor FHIR |

---

# Executando a aplicação
```bash
npm start
```

---

# Verificando funcionamento

Após iniciar a aplicação:

```bash
GET /infos/scripts
```

Resposta esperada:
Um array dos algoritmos disponíveis para execução. 

```json
[
    {
        "name": "HelloWorld.py",
        "description": "Show HelloWorld message"
    }
]
```

---

# Arquitetura

Fluxo simplificado:

1. API recebe a requisição
2. Recursos FHIR são carregados
3. Os sinais são extraídos
4. Um arquivo temporário é gerado
5. O Python lê esse arquivo
5. O script Python é executado
6. O resultado é escrito no arquivo temporário
7. O resultado é lido no Node
8. O retorno é automaticamente convertido para formato FHIR

---

# Imagens do Sistema

## A - Algoritmos Disponíveis

Imagem mostrando os algoritmos disponíveis.

![Imagem A](./docs/images/A.png)

---

## B - Campos do Formulário

Imagem demonstrando os campos utilizados para configurar a execução do algoritmo.

![Imagem B](./docs/images/B.png)

---

## C - Retorno do Script Executado

Imagem demonstrando o retorno gerado após a execução do script.

![Imagem C](./docs/images/C.png)

---

# Rotas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/run_script/operation` | Executa um algoritmo Python utilizando recursos FHIR |
| `POST` | `/direct/params` | Executa diretamente um script Python enviando parâmetros |
| `GET` | `/infos/scripts` | Lista os scripts disponíveis |
| `GET` | `/infos/routes` | Lista as rotas disponíveis |

---

## Exemplo da rota `/direct/params`

### Requisição

```json
{
  "scriptName": "HelloWorld.py",
  "params": ["949.0 948.0 950.0 ... 950.0 951.0 969.0"]
}
```

---
## Exemplo da rota `/run_script/operation`

---

## Tipos de Requisição

Todos os tipos de requisição utilizam a mesma estrutura base:

```json
{
  "typeRequest": "byId",
  "resourceType": "Observation",
  "id": "6a06066114fa4ef68f573d98",
  "scriptName": "HelloWorld.py",
  "returnOnlyFieldsComponents": false,
  "components": [
    {
      "index": "0",
      "changeField": "data"
    }
  ]
}
```

Os campos abaixo são obrigatórios para todos os tipos de requisição:

| Campo | Tipo | Descrição |
|---|---|---|
| `resourceType` | string | Tipo do recurso FHIR |
| `id` | string | ID do recurso FHIR |
| `scriptName` | string | Nome do script Python |
| `returnOnlyFieldsComponents` | boolean | Define se apenas os campos alterados dos components serão retornados |
| `typeRequest` | string | Estratégia de execução |
| `components` | array | Lista de componentes que serão processados |

---

## components

O campo `components` deve possuir pelo menos um item.

Estrutura:

```json
{
  "index": "0",
  "changeField": "data"
}
```

### Campos

| Campo | Tipo | Descrição |
|---|---|---|
| `index` | number/string | Índice ou código do componente |
| `changeField` | string | Campo que será alterado |

---

# 1. byId

Executa o algoritmo utilizando apenas o recurso informado pelo ID.

## Campos específicos obrigatórios

Nenhum campo adicional.

## Estrutura de validação

```javascript
{
  typeRequest: "byId"
}
```

## Exemplo

```json
{
  "typeRequest": "byId",
  "resourceType": "Observation",
  "id": "6a06066114fa4ef68f573d98",
  "scriptName": "HelloWorld.py",
  "returnOnlyFieldsComponents": false,
  "components": [
    {
      "index": "0",
      "changeField": "data"
    },
    {
      "index": "1",
      "changeField": "data"
    }
  ]
}
```

---

# 2. byIdAndMinute

Executa o algoritmo utilizando um minuto específico do recurso.

## Campos específicos obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `minute` | integer | Minuto que será utilizado |

---

## Regras de validação

- `minute` deve ser um número inteiro
- `minute` deve ser maior que 0

---

## Estrutura de validação

```javascript
{
  typeRequest: "byIdAndMinute",
  minute: 1
}
```

---

## Exemplo

```json
{
  "typeRequest": "byIdAndMinute",
  "resourceType": "Observation",
  "id": "6a06066114fa4ef68f573d98",
  "minute": 3,
  "scriptName": "HelloWorld.py",
  "returnOnlyFieldsComponents": false,
  "components": [
    {
      "index": "0",
      "changeField": "data"
    }
  ]
}
```

---

# 3. byIdAndMinuteInterval

Executa o algoritmo utilizando um intervalo de minutos do recurso.

## Campos específicos obrigatórios

| Campo | Tipo | Descrição |
|---|---|---|
| `initialMinute` | integer | Minuto inicial |
| `finalMinute` | integer | Minuto final |

---

## Regras de validação

- `initialMinute` deve ser um número inteiro
- `finalMinute` deve ser um número inteiro
- Ambos devem ser maiores que 0
- `finalMinute` deve ser maior que `initialMinute`

---

## Estrutura de validação

```javascript
{
  typeRequest: "byIdAndMinuteInterval",
  initialMinute: 1,
  finalMinute: 10
}
```

---

## Exemplo

```json
{
  "typeRequest": "byIdAndMinuteInterval",
  "resourceType": "Observation",
  "id": "6a06066114fa4ef68f573d98",
  "initialMinute": 0,
  "finalMinute": 3,
  "scriptName": "HelloWorld.py",
  "returnOnlyFieldsComponents": false,
  "components": [
    {
      "index": "0",
      "changeField": "data"
    }
  ]
}
```

---

# Preparando Algoritmos Python

Todos os algoritmos devem utilizar o helper `script_runner.py`.

Este arquivo é responsável por:

- Ler os dados de entrada
- Validar derivações
- Converter sinais
- Executar o algoritmo
- Escrever o resultado

---

## Estrutura mínima do script

```python
from helpers.script_runner import run

if __name__ == "__main__":
    run(
        process_function=my_function,
        prepare_signals=False,
        min_derivations=1,
        max_derivations=4
    )
```

---

## Exemplo completo - HelloWorld.py

```python
from helpers.script_runner import run

def processHelloWorld(data):
    return ["Hello World!" for _ in (data or [1])]

if __name__ == "__main__":
    run(
        process_function=processHelloWorld,
        prepare_signals=False,
        min_derivations=1,
        max_derivations=4
    )
```

---

# Explicação da função `run`

| Campo | Descrição |
|---|---|
| `process_function` | Função que será executada |
| `prepare_signals` | Define se o sinal será convertido para `numpy float array` |
| `min_derivations` | Quantidade mínima de derivações necessárias |
| `max_derivations` | Quantidade máxima de derivações permitidas |

---

# Estrutura dos Dados Recebidos no Python

Os scripts recebem um array de objetos JSON.

Cada objeto possui:

```json
{
  "signal": "1044 1043 1042 ...",
  "metadata": {}
}
```

---

## Campo `signal`

Antes da conversão:

```text
"1044 1043 1042 ..."
```

Após `prepare_signals=True`:

```python
np.array([1044.0, 1043.0, 1042.0, ...])
```

---

## Campo `metadata`

Os metadados são extraídos automaticamente do recurso FHIR.

Esses campos são registrados no arquivo:

```javascript
fhirComponentMapper.js
```

Exemplo:

```javascript
const metadataExtractors = {
  valueSampledData: (component) => ({
    period: component.valueSampledData.period,
  })
};
```

---

# Exemplo de Entrada do Python

Arquivo JSON recebido pelo Python:

```json
[
  {
    "signal": "1094 1094 1094 ... 882 841 806",
    "metadata": {
      "period": 10
    },
    "valueType": "valueSampledData"
  }
]
```

---

# Exemplo de Saída do Python

```json
[
  "Hello World!",
  "Hello World!"
]
```

---

# Trabalhando com os dados dentro do algoritmo Python

## Estrutura esperada no algoritmo

O algoritmo deve iterar sobre `data`.

Exemplo:

```python
def myFunction(data):
    results = []

    for signal in data:
        currentSignal = signal['signal']
        period = signal['metadata']['period']

        myResult = currentSignal

        results.append(myResult)

    return results
```

---

## Explicação

| Campo | Descrição |
|---|---|
| `signal['signal']` | Sinal pré-processado |
| `signal['metadata']` | Metadados extraídos do recurso FHIR |

---

## Observação importante

Quando `prepare_signals=True`, o campo:

```python
signal['signal']
```

será automaticamente convertido para:

```python
numpy.array(float)
```

Caso contrário, o valor permanecerá como string:

```python
"1044 1043 1042 ..."
```

---

# Conversão Automática do Retorno para FHIR

A aplicação converte automaticamente o resultado do Python para formato FHIR.

Exemplo:

```json
[
  "Hello World!",
  "Hello World!"
]
```

O tamanho do array define quantos `components` serão montados.

Neste caso:

- Resultado 1 → Component 1
- Resultado 2 → Component 2

---

## Exemplo de retorno FHIR montado automaticamente com duas derivações

```json
{
  "_id": "6a06066114fa4ef68f573d98",
  "id": "6a06066114fa4ef68f573d98",
  "resourceType": "Observation",
  "status": "preliminary",
  "category": [
    {
      "coding": [
        {
          "system": "https://if4health.charqueadas.ifsul.edu.br/biofass/",
          "code": "procedure",
          "display": "Procedure"
        }
      ]
    }
  ],
  "device": {
    "display": "12 lead EKG Device Metric"
  },
  "component": [
    {
      "code": {
        "coding": [
          {
            "display": "MDC_ECG_ELEC_POTL_I"
          }
        ]
      },
      "valueSampledData": {
        "origin": {
          "value": 2048
        },
        "period": 2.77,
        "factor": 1.612,
        "lowerLimit": -3300,
        "upperLimit": 3300,
        "dimensions": 1,
        "data": "Hello World!"
      }
    },
    {
      "code": {
        "coding": [
          {
            "display": "MDC_ECG_ELEC_POTL_II"
          }
        ]
      },
      "valueSampledData": {
        "origin": {
          "value": 2048
        },
        "period": 2.77,
        "factor": 1.612,
        "lowerLimit": -3300,
        "upperLimit": 3300,
        "dimensions": 1,
        "data": "Hello World!"
      }
    }
  ]
}
```

---

# Retorno dos Scripts

Os scripts devem retornar preferencialmente um array.

Caso o retorno não seja um array, o sistema converte automaticamente:

```python
if not isinstance(results, list):
    results = [results]
```

---

# Casos de Teste

Em desenvolvimento.

---