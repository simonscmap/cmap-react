import ArrayBufferProcessor from './ArrayBufferProcessor';
import CSVStringProcessor from './CSVStringProcessor';
import JSONArrayProcessor from './JSONArrayProcessor';

/**
 * Factory for creating appropriate input processors based on data type
 */
class InputProcessorFactory {
  /**
   * Process input data using the appropriate processor
   * @param {Array|string|ArrayBuffer} data - Input data
   * @returns {Object} Processing result
   * @throws {Error} If data type is not supported
   */
  static process(data) {
    if (data instanceof ArrayBuffer) {
      return ArrayBufferProcessor.process(data);
    }

    if (typeof data === 'string') {
      return CSVStringProcessor.process(data);
    }

    if (Array.isArray(data)) {
      return JSONArrayProcessor.process(data);
    }

    throw new Error(
      'Data must be either a CSV string, JSON array, or ArrayBuffer',
    );
  }

  /**
   * Get processor for specific data type
   * @param {Array|string|ArrayBuffer} data - Input data
   * @returns {Class} Appropriate processor class
   */
  static getProcessor(data) {
    if (data instanceof ArrayBuffer) {
      return ArrayBufferProcessor;
    }

    if (typeof data === 'string') {
      return CSVStringProcessor;
    }

    if (Array.isArray(data)) {
      return JSONArrayProcessor;
    }

    throw new Error(
      'Data must be either a CSV string, JSON array, or ArrayBuffer',
    );
  }
}

export default InputProcessorFactory;