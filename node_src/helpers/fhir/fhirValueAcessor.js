/**
 * Defines read/write strategies per FHIR value type.
 * To support a new resource type, just add a new entry.
 */
const valueAccessors = {
  valueSampledData: {
    dataField: "data",
    get: (component, field) => component.valueSampledData?.[field],
    set: (component, field, value) => {
      component.valueSampledData[field] = value;
    },
  }
};

/**
 * Detects the FHIR value type present in a component.
 * @param {Object} component
 * @returns {string} The detected value type key
 * @throws {Error} If no known value type is found
 */
function detectValueType(component) {
  const valueType = Object.keys(valueAccessors).find((key) => key in component);

  if (!valueType) {
    throw new Error(
      `Unsupported FHIR value type. Keys found: ${Object.keys(component).join(", ")}`
    );
  }

  return valueType;
}

/**
 * Returns the accessor (get/set) for a given component.
 * @param {Object} component
 * @returns {{ get: Function, set: Function, valueType: string }}
 */
function getAccessor(component) {
  const valueType = detectValueType(component);
  return { ...valueAccessors[valueType], valueType };
}

module.exports = { getAccessor, detectValueType };