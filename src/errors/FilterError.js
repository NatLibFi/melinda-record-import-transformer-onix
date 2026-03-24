import TransformPipelineError from './TransformPipelineError.js';

export default class extends TransformPipelineError {
  constructor(payload, message) {
    super(payload, message);
    this.type = 'FilterError';
  }
}
