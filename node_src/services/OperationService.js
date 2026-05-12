const FhirResourceError = require("../operations/erros/FhirResourceError");
const { default: FhirApi } = require("../providers/FhirApi");
const PythonRunner = require("../providers/PythonRunner");
const { buildFhirUrl } = require("../helpers/fhir/requestStrategies");
const { mapComponentToPayload } = require("../helpers/fhir/fhirComponentMapper");
const { getAccessor } = require("../helpers/fhir/fhirValueAcessor");

class OperationService {
  async startOperation(body) {
    const {
      resourceType,
      id,
      scriptName,
      returnOnlyFieldsComponents,
      components,
    } = body;

    const fhirPath = buildFhirUrl("byId", { id, resourceType });
    const resource = await FhirApi.get(fhirPath);
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

  /**
   * @deprecated
   */
 async startFormOperation(body) {
  const {
    resourceType,
    id,
    scriptName,
    onlyComponent,
    components,
  } = body;

  const resource = await FhirApi.get(resourceType + "/" + id);
  const fhirComponents = resource.component;
  if (!fhirComponents) {
    throw new FhirResourceError("Resource does not contain components");
  }

  const {
    arrResourceComponentsToChange,
    arrDataFromResourceComponents
  } = this._mapComponentsToData(fhirComponents, components);

  const processedData = await PythonRunner.run(
    scriptName,
    arrDataFromResourceComponents
  );

    // Caso contrário, segue o fluxo normal
  const updatedComponents = this._applyProcessedValues(
    arrResourceComponentsToChange,
    components,
    processedData
  );

  if (onlyComponent === "true") {
    const mappedComponents = components.map((comp, i) => ({
      index: comp.index,
      changeField: comp.changeField,
      original: arrResourceComponentsToChange[i],
      processed: updatedComponents[i]
    }));

    return {
      resourceType,
      id,
      scriptName,
      components: mappedComponents
    };
  }

  return {
    ...resource,
    component: updatedComponents,
  };
}
  // Returns the component in the informed index
  _getComponentToChangeByIndex(resourceComponents, index) {
    if (resourceComponents[index]) {
      return resourceComponents[index];
    }
    throw new FhirResourceError(
      `Component index ${index} does not exist in FHIR resource`
    );
  }

  // Returns the data in the field that will be changed
  _getDataFromResourceComponentByChangeField(
    resourceComponent,
    changeField
  ) {
    const { get } = getAccessor(resourceComponent);
    const data = get(resourceComponent, changeField);

    if (data == null) {
      throw new FhirResourceError(
        `Field '${changeField}' does not exist in component`
      );
    }

    return data;
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

      this._getDataFromResourceComponentByChangeField(
        resourceComponentToChange,
        requestComponent.changeField
      )

      arrResourceComponentsToChange.push(resourceComponentToChange);
      arrDataFromResourceComponents.push(
        mapComponentToPayload(resourceComponentToChange)
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
    return processedData.map((rawValue, i) => {
    const clonedComponent = JSON.parse(JSON.stringify(componentsToChange[i]));
    const field = requestComponents[i].changeField;

    const normalizedValue = Array.isArray(rawValue)
      ? rawValue.join(" ")
      : rawValue?.toString().replace(/(\r\n|\n|\r)/gm, "");

    const { set } = getAccessor(clonedComponent);
    set(clonedComponent, field, normalizedValue);

    return clonedComponent;
    });
  }
}

module.exports = new OperationService();
