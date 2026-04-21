
// Returns the fhir api url
const requestStrategies = {
    // fhirapi.domain/Observation/3984308adawd
    byId: ({ resourceType, id }) =>
    `${resourceType}/${id}`,

    // fhirapi.domain/Observation/3984308adawd/data/0
    byIdAndMinute: ({ resourceType, id, minute }) =>
    `${resourceType}/${id}/data/${minute}`,

    // fhirapi.domain/Observation/3984308adawd/data/0/1
    byIdAndMinuteInterval: ({ resourceType, id, initialMinute, finalMinute }) =>
    `${resourceType}/${id}/data/${initialMinute}/${finalMinute}`,
};

/**
 * Builds a FHIR URL based on the request type.
 *
 * @param {string} typeRequest - Strategy type:
 *  - 'byId'
 *  - 'byIdAndMinute'
 *  - 'byIdAndMinuteInterval'
 *
 * @param {Object} params - URL parameters
 * @param {string} params.resourceType - Resource type (Patient, Observation)
 * @param {string} params.id - Resource ID
 * @param {string} [params.minute] - Specific minute
 * @param {string} [params.initialMinute] - Initial minute
 * @param {string} [params.finalMinute] - Final minute
 *
 * @returns {string} Formatted URL
 *
 * @example
 * buildFhirUrl('byId', { resourceType: 'Observation', id: '123' })
 * // "Patient/123"
 *
 * @example
 * buildFhirUrl('byIdAndMinute', {
 *   resourceType: 'Observation',
 *   id: '123',
 *   minute: '10'
 * })
 * // "Observation/123/data/10"
 *
 * @example
 * buildFhirUrl('byIdAndMinuteInterval', {
 *   resourceType: 'Observation',
 *   id: '123',
 *   initialMinute: '10',
 *   finalMinute: '20'
 * })
 * // "Observation/123/data/10/20"
 *
 */
export function buildFhirUrl(typeRequest, params) {
  const strategy = requestStrategies[typeRequest] ?? requestStrategies.byId;
  return strategy(params);
}