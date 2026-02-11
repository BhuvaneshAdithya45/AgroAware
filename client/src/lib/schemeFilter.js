// client/src/lib/schemeFilter.js
import schemesData from '../data/schemes.json';

/**
 * Filter schemes based on farmer's profile
 * @param {Object} profile - Farmer's profile: { crop, state, landSize }
 * @returns {Array} - Filtered schemes applicable to farmer
 */
export function getApplicableSchemes(profile = {}) {
  const { crop, state, landSize } = profile;
  
  return schemesData.schemes.filter(scheme => {
    // Check crop eligibility
    if (scheme.eligibility.crops.length > 0 && 
        !scheme.eligibility.crops.includes('all') &&
        crop && 
        !scheme.eligibility.crops.includes(crop.toLowerCase())) {
      return false;
    }

    // Check state eligibility
    if (scheme.eligibility.states.length > 0 && 
        !scheme.eligibility.states.includes('all') &&
        state && 
        !scheme.eligibility.states.includes(state)) {
      return false;
    }

    // Check land size eligibility
    if (scheme.eligibility.landSize !== 'all' && landSize) {
      const minSize = parseFloat(scheme.eligibility.landSize.match(/[\d.]+/)?.[0] || 0);
      if (landSize < minSize) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get all schemes
 * @returns {Array} - All available schemes
 */
export function getAllSchemes() {
  return schemesData.schemes;
}

/**
 * Get a single scheme by ID
 * @param {string} schemeId - Scheme ID
 * @returns {Object|null} - Scheme object or null
 */
export function getSchemeById(schemeId) {
  return schemesData.schemes.find(s => s.id === schemeId) || null;
}

/**
 * Search schemes by keyword
 * @param {string} keyword - Search term
 * @returns {Array} - Matching schemes
 */
export function searchSchemes(keyword) {
  const lower = keyword.toLowerCase();
  return schemesData.schemes.filter(scheme =>
    scheme.name.toLowerCase().includes(lower) ||
    scheme.description.toLowerCase().includes(lower)
  );
}

/**
 * Get scheme recommendations for a predicted crop
 * @param {string} crop - Crop name from prediction
 * @returns {Array} - Schemes applicable to this crop
 */
export function getSchemesForCrop(crop) {
  return getApplicableSchemes({ crop });
}
