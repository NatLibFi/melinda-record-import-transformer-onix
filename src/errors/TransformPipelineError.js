export default class extends Error {
  constructor(payload, message) {
    super(message);

    this.payload = {
      title: payload.title || '',
      standardIdentifiers: payload.standardIdentifiers || []
    };
  }
}
