# Projeto IF-Cloud
  
![IF-Cloud (API FHIR para Integração de projetos de saúde digital)](./img/IF-Cloud-paper-CBIS2024.png)

A Figura ilustra a visão  geral do ecossistema de saúde digital para monitoramento contínuo de biossinais com troca de recursos no padrão FHIR. As funcionalidades das APIs em nuvem para suportar projetos IoT e aplicações web de biossinais podem ser resumidas em CRUD (Criar/Ler/Atualizar/Excluir ) e Processamento. **IF-Cloud** - *API FHIR para Integração de projetos de saúde digital* - compõe o ecossistema como API de processamento.

IF-Cloud auomatiza a execução de scripts Python que tem upload realizado por meio de uma interface gráfica. IF-Cloud utiliza os dados dos recursos FHIR provenientes de alguma API de CRUD e retorna um outro recurso FHIR com os dados processados pelos scripts. Ou seja, IF-Cloud permite a inclusão de novas funcionalidades em ecossistemas de saúde digital mediante um upload de arquivos de script.


## Requisitos
- NodeJS [https://nodejs.org/en/](https://nodejs.org/en/)
- Python [https://www.python.org/](https://www.python.org/)
- Pip - O gerenciador de pacotes do Python.
- Git - Para clonar o repositório.
- Aplicação IF-Cloud (este repositório)
- Aplicação FHIR que realiza as operações CRUD


IF-Cloud depende de uma API FHIR com operações CRUD para fornecer os dados a serem processados, pois não tem banco de dados. Diversas implementações de APIs FHIR em nuvem estão disponíveis para realizar as operações CRUD.
Nós recomendamos a [nossa API FHIR especializada em biossinais](https://if4health.charqueadas.ifsul.edu.br/biosignalinfhir/api-docs/) e você encontra o código fonte [neste link](https://github.com/if4health/FASS-ECG). Alternativamente, IF-Cloud também pode utilizar recursos FHIR da API pública de testes [HAPI FHIR](https://hapi.fhir.org/baseR4/swagger-ui/).


## Instalação
1. Faca download deste repositorio
```sh
git clone https://github.com/if4health/ifcloud .
```
2. Configure variáveis de ambiente:

Na pasta raiz do projeto, temos um arquivo `.env.example`. Você deve renomear este arquivo para `.env` e seguir as instruções abaixo:
| Rota | Descrição |
|------|-----------|
| `FHIR_API_URL` | URL da API FHIR que realiza as operações CRUD |
| `PORT` | Porta na qual a aplicação irá rodar |
| `AUTHORIZATION_CODE` | Token de autorização da API FHIR |
| `CLIENT_ID` | Regra de autenticação na API FHIR |


3. Instale as dependencias de NodeJS para este projeto 
```sh
npm install
```

4. Instale as dependencias de Python para este projeto 
```sh
pip install -r requirements.txt
```


## Utilização
Após instalar todas as dependências, você pode iniciar a aplicação com:
```sh
npm start
```
Visualize o IF-Cloud rodando no navegador:
```sh
http://localhost:8000/ifcloud/home
```

**JSON de Configuração** de IF-Cloud para fins de controle do fluxo de dados da interface e da automação dos scripts Python.

```json
{
    "resourceType": "Observation",
    "id": ":id_from_CRUD_API",
    "scriptName": "HelloWorld.py",
    "returnOnlyFieldsComponents": true,
    "components": [
        {
            "index": "0",
            "changeField": "data"
        }
    ]
}
```

- `resourceType` - tipo de Recurso FHIR que IF-Cloud deverá buscar na API de CRUD;
- `id` - identificador do Recurso FHIR que a aplicação deverá buscar na API de CRUD;
- `scriptName` - nome do script disponível no diretório Python SRC a ser executado.
- `returnOnlyFieldsComponents` - se IF-Cloud irá retornar somente os campos alterados ou todo o Recurso FHIR para o solicitante.
- `components` - Configura quais as chaves do Recurso FHIR a serem buscadas e serem alteradas ou retornadas pelo script configurado em `scriptName`. Este pode ter **n** objetos de configuração, irá depender se o recurso **FHIR** contém as chaves e os índices.
    - `index` - índice da chave `changeField` a ser alterado no Recurso FHIR;
	- `changeField` - determina qual a chave do Recurso FHIR deverá ser alterada;
	


![Interface de Usuário do IF-Cloud](./img/IF-Cloud-UI.png)

Para facilitar a utilização, IF-Cloud disponibiliza uma interface de usuário.
- **Item (A)** - Ao selecionar um script em python para fazer upload em IF-Cloud (menu Upload), ele fica salvo em uma lista de scipts disponiveis e pode ser executado a qualquer momento.
- **Item (B)** - Uma das formas de carregar o JSON de configuração de IF-Cloud é clicando no menu Form da UI e preenchendo o formulário.
- **Item (C)** - Ao enviar o formulário, IF-Cloud executa o script selecionado e redireciona uma página informativa mostrando o resultado da execucao do script conforme as configurações do JSON de configuração.



## Rotas

IF-Cloud oferece duas categorias de rotas na chamada dos scripts carregados na nuvem. 

A chamada por **rota direta** é indicada para testes de funcionamento do próprio script pelo usuário/desenvolvedor. Esta abordagem não tem acesso aos recursos da API de CRUD e também não gera recursos FHIR, pois IF-Cloud faz apenas a execução de um script Python disponível no diretório. 

A chamada na **rota principal** é o método de execução dos scripts cuja resposta pode ser retornada em um recurso FHIR. Sempre que IF-Cloud receber uma requisição na rota principal, é necessário buscar os dados salvos na API de CRUD para serem sobrescritos com processamento intermediado pelos scripts salvos em IF-Cloud. 

 
| Rota | Metodo | Descricao| Exemplo|
|----------------------------------|--------|------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------|
| `/run_script/direct/params`      | POST   | Executa um script salvo em IF-Cloud com parâmetros de entrada `{"scriptName": ":script_name", "params": [":params_array"]}` | `{"scriptName: "HelloWorld.py", "params": ["949.0 948.0 950.0 950.0 951.0", "977.0 977.0 975.0 978.0 978.0 979.0 976.0"]}` |
| `/run_script/direct/HelloWorld.py`| GET    | Executa o script `HelloWorld.py` salvo em IF-Cloud para testar se a aplicação instalada corretamente. Não precisa de parâmetros | `---------------------------------------------------------------------------`|
| `/run_script/operation`         | POST   | IF-Cloud executa um script de acordo com o **JSON de configuração** e modifica o conteúdo de uma chave de um recurso FHIR proveniente da API de CRUD `$(FHIR_API_URL)` | Acesse nesta documentação o **JSON de configuração** para realizar testes  |



## Casos de teste

Para mostrar as possibilidades de IF-Cloud, nós coletamos um trecho de um eletrocardiograma (ECG) do [PhysioNet](https://physionet.org/), um repositório de dados médicos disponíveis gratuitamente.

O diretório `testfiles` contém o seguinte material para iniciantes no IF-Cloud: 
```sh
├── calcBPM.py
├── config-ifcloud.json
├── FHIR-Observation-1-lead-ECG-snippet.json
├── HelloWorld.py
└── params-route-direct.json
```

1. O arquivo `FHIR-Observation-1-lead-ECG-snippet.json` contém um trecho de um ECG de uma derivação descrito como um recurso FHIR Observation para ser inserido em `$(FHIR_API_URL)`.
2. O script `HelloWorld.py` serve para você testar a implantação de IF-cloud na nuvem ou no localhost na rota `GET $(URL_IFCLOUD)/run_script/direct/HelloWorld.py`
3. O script `calcBPM.py` realiza o cálculo da frequência cardíaca de um determinado ECG. **Entrada**: Caminho para um arquivo .txt que contém as derivações no seguinte formato dentro do arquivo: `["953.0 951.0 949.0 948.0 950.0 950.0 951.0 948.0 946.0 944.0 947.0 947.0 947.0 943.0 944.0 943.0 943.0 944.0 944.0 947.0 946.0 946.0 945.0 950.0 951.0 953.0 952.0 954.0 957.0"]`. **Saída**: Caminho do arquivo de entrada com os valore gravados dentro dele.
4. Utilize `params-route-direct.json` no corpo da requisição `POST $(URL_IFCLOUD)/run_script/direct/params` que IF-Cloud vai retornar o vetor de BPMs do ECG
5. Utilize `config-ifcloud.json` no corpo da requisição `POST $(URL_IFCLOUD)/run_script/operation` que IF-Cloud vai retornar o vetor de BPMs do ECG descrito como um FHIR Observation. 
	- Não esqueça de substituir `:id_from_CRUD_API` pelo ID que a API FHIR responder após o `POST` de `FHIR-Observation-1-lead-ECG-snippet.json`.


