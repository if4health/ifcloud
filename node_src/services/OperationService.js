const FhirResourceError = require("../operations/erros/FhirResourceError");
const { default: FhirApi } = require("../providers/FhirApi");
const PythonRunner = require("../providers/PythonRunner");

class OperationService {
  async startOperation(body) {
    const {
      resourceType,
      id,
      scriptName,
      returnOnlyFieldsComponents,
      components,
    } = body;

    const resource = await FhirApi.get(resourceType + "/" + id);
    const fhirComponents = resource.component;
    if (!fhirComponents) {
      throw new FhirResourceError("Resource does not contain components");
    }

    const { arrResourceComponentsToChange, arrDataFromResourceComponents } = this._mapComponentsToData(fhirComponents, components);

    /**
     * Processed data from python script
     * scriptName: script that will be executed
     * arrDataFromResourceComponents: data that will be used in python script
     */
    const processedData = await PythonRunner.run(
      scriptName,
      arrDataFromResourceComponents
    );

    const updatedComponents = this._applyProcessedValues(
      arrResourceComponentsToChange,
      components,
      processedData
    );

    // If true, will be returned just the components with processed data
    if (returnOnlyFieldsComponents) {
      return updatedComponents;
    }

    // Return FHIR components
    return {
      ...resource,
      component: updatedComponents,
    };
  }

  // Returns the component in the informed index
  _getComponentToChangeByIndex(resourceComponents, index) {
    if (resourceComponents[index]) {
      return resourceComponents[index]["valueSampledData"];
    }
    throw new FhirResourceError(
      `Component index ${index} does not exist in FHIR resource`
    );
  }

  // Returns the data in the field that will be changed
  _getDataFromResourceComponentByChangeField(
    resourceComponent,
    requestComponent
  ) {
    if (resourceComponent[requestComponent.changeField]) {
      return resourceComponent[requestComponent.changeField];
    }
    throw new FhirResourceError(
      `Field '${requestComponent.changeField}' does not exist in component`
    );
  }

  /**
 * Prepare components to execute data in python
 * arrResourceComponentsToChange: components that will be needed to change by data come for python
 * arrDataFromResourceComponents: data in the ECG resource. They will be processed in the python script
 */
  _mapComponentsToData(resourceComponents, requestComponents) {
    const arrResourceComponentsToChange = [];
    const arrDataFromResourceComponents = [];

    for (const requestComponent of requestComponents) {
      const resourceComponentToChange = this._getComponentToChangeByIndex(
        resourceComponents,
        requestComponent.index
      );
      arrResourceComponentsToChange.push(resourceComponentToChange);
      arrDataFromResourceComponents.push(
        this._getDataFromResourceComponentByChangeField(
          resourceComponentToChange,
          requestComponent
        )
      );
    }

    return { arrResourceComponentsToChange, arrDataFromResourceComponents };
  }

    /**
   * Change components with processed data
   * arrResourceComponentsToChange: components that will be changed
   * components: form components to change resourceComponents
   * processedData: Data that was processed in the python script
   */
  _applyProcessedValues(componentsToChange, requestComponents, processedData) {
    const resultComponents = [];

    for (let i = 0; i < processedData.length; i++) {
      const componentOriginal = componentsToChange[0]; // Use 0 with reference
      const requestComponent = requestComponents[0]; // Use 0 with reference

      const clonedComponent = JSON.parse(JSON.stringify(componentOriginal));
      const field = requestComponent.changeField;
      const rawValue = processedData[i];

      const normalizedValue = Array.isArray(rawValue)
        ? rawValue.join(" ")
        : rawValue;

      clonedComponent[field] = normalizedValue
        ?.toString()
        .replace(/(\r\n|\n|\r)/gm, "");

      resultComponents.push(clonedComponent);
    }

    return resultComponents;
  }
}

module.exports = new OperationService();
