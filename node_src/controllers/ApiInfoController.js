class ApiInfoController {
    showRoutes(req, res) {
        const routes = [
            {
                method: "POST",
                path: "/run_script/operation",
                description: "Run a python script using CRUD FHIR API",
                body: {
                    resourceType: "string",
                    id: "string",
                    scriptName: "string",
                    returnOnlyFieldsComponents: "boolean",
                    components: [
                        {
                            "index": "int",
                            "changeField": "string"
                        }
                    ]
                },
                example: {
                    resourceType: "Observation",
                    id: "6928ab5ed03cf842988936fc",
                    scriptName: "calcBPM.py",
                    returnOnlyFieldsComponents: false,
                    components: [
                        {
                            index: 0,
                            changeField: "data"
                        }
                    ]
                }
            },
            {
                method: "POST",
                path: "/run_script/direct/params",
                description: "Run a python script using params in body in the route",
                body: {
                    scriptName: "string",
                    params: "array"
                },
                example: {
                    scriptName: "calcBPM.py",
                    params: ["951.0 949.0 948.0 950.0 950.0 951.0", "947.0 947.0 947.0 943.0 944.0 943.0 943.0 944.0 944.0 947.0 946.0 946.0 945.0 950.0 951.0 953.0 952.0 "]
                }
            }
        ]

        return res.status(200).json(routes)
    }

    showScripts(req, res) {
        const scripts = [
            {
                name: "calcBPM.py",
                description: "Calculate BPMS from ECG derivation"
            },
            {
                name: "calcRPEAKS.py",
                description: "Calculate RPEAKS from ECG derivation"
            },
            {
                name: "CallBiosppy.py",
                description: "Analyzes each ECG signal and extracts basic information"
            },
            {
                name: "cnn.py",
                description: "Classifies ECG beats using a CNN and returns the beat types"
            },
            {
                name: "HelloWorld.py",
                description: "Show HelloWorld message"
            },
            {
                name: "huff.py",
                description: "Huff algorithm"
            },
            {
                name: "rna_pso.py",
                description: "Analyzes the heartbeat and detects possible points of arrhythmia"
            }
        ]

        return res.json(scripts)
    }
}

module.exports = new ApiInfoController()