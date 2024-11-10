export class NoContentResponse {
  success: boolean;
  message: string;

  constructor(success = true, message = 'No Content') {
    this.success = success;
    this.message = message;
  }
}
