const FhirResourceError = require("../operations/erros/FhirResourceError");
const { default: FhirApi } = require("../providers/FhirApi");
const PythonRunner = require("../providers/PythonRunner");
const { buildFhirUrl } = require("../helpers/fhir/requestStrategies");
const { mapComponentToPayload } = require("../helpers/fhir/fhirComponentMapper");
const { getAccessor } = require("../helpers/fhir/fhirValueAcessor");
const { debug } = require("../operations/loggers/debug");

class OperationService {
  async startOperation(body) {
    const {
      resourceType,
      id,
      typeRequest,
      minute = 0,
      initialMinute = 0,
      finalMinute = 1,
      scriptName,
      returnOnlyFieldsComponents,
      components,
    } = body;

    debug("ID", id)
    debug("resourceType", resourceType)

    const fhirPath = buildFhirUrl(typeRequest, { id, resourceType, minute, initialMinute, finalMinute });
    const resource = await FhirApi.get(fhirPath).catch((error) => {
      throw new FhirResourceError(`Failed to fetch FHIR resource: ${error.message}`);
    });
    const fhirComponents = resource.component;

    if (!fhirComponents) {
      throw new FhirResourceError("Resource does not contain components");
    }

    const { arrResourceComponentsToChange, arrDataFromResourceComponents } = this._mapComponentsToData(fhirComponents, components);
    
    // Run the Python script with the extracted component data
    const processedData = await PythonRunner.run(
      scriptName,
      arrDataFromResourceComponents
    );

    const updatedComponents = this._applyProcessedValues(
      arrResourceComponentsToChange,
      components,
      processedData
    );

    // If true, return only the updated components instead of the full resource
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
   * Finds a FHIR resource component by index.
   *
   * @param {Array} resourceComponents - Full list of components from the FHIR resource.
   * @param {number|string} index - Index of the component.
   * @returns {Object} The component at the given index.
   * @throws {FhirResourceError} If no component exists at the given index.
   */
  _getComponentToChangeByIndex(resourceComponents, index) {
    if (resourceComponents[index]) {
      return resourceComponents[index];
    }
    throw new FhirResourceError(
      `Component index ${index} does not exist in FHIR resource`
    );
  }

  /**
   * Gets the value of a specific field from a FHIR component.
   *
   * @param {Object} resourceComponent - A single FHIR resource component.
   * @param {string} changeField - The field name to read from the component.
   * @returns {*} The value found at the given field.
   * @throws {FhirResourceError} If the field does not exist in the component.
   */
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
   * Maps each requested component to FHIR resource data,
   * building the arrays needed to run and update the Python script.
   *
   * @param {Array} resourceComponents - Full list of components from the FHIR resource.
   * @param {Array<{index: number|string, changeField: string}>} requestComponents - Components requested
   * @returns {{ arrResourceComponentsToChange: Array, arrDataFromResourceComponents: Array }}
   *   - arrResourceComponentsToChange: original FHIR components that will be updated after processing.
   *   - arrDataFromResourceComponents: serialized payloads to be sent to the Python script.
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
   * Applies the Python script's output back into the original FHIR components,
   * returning a new array of updated components without mutating the originals.
   *
   * @param {Array} componentsToChange - Original FHIR components to be updated.
   * @param {Array<{index: number|string, changeField: string}>} requestComponents - Caller-defined components indicating which field to update.
   * @param {Array} processedData - Output values returned by the Python script
   * @returns {Array} New array of FHIR components with the processed values applied.
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
