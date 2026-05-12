const { getAccessor } = require("./fhirValueAcessor");

const metadataExtractors = {
  valueSampledData: (component) => ({
    period: component.valueSampledData.period,
  })
};

/**
 * Maps any FHIR component to a normalized payload { signal, metadata, valueType }.
 *
 * @param {Object} component - FHIR component
 * @returns {{ signal: string, metadata: Object, valueType: string }}
 */
function mapComponentToPayload(component) {
  const { get, dataField, valueType } = getAccessor(component);

  const signal = get(component, dataField);
  const metadata = metadataExtractors[valueType]?.(component) ?? {};

  return {
    signal: signal != null ? String(signal) : null,
    metadata,
    valueType,
  };
}

module.exports = { mapComponentToPayload };