import { message } from "antd";

/**
 * Centeralized service for handling and displaying error messages to the user.
 * Implements deduplication to prevent multiple identical toasts from appearing at once.
 */
class ErrorService {
  private static lastMessage: string = "";
  private static lastTimestamp: number = 0;
  private static COOLDOWN = 3000; // ms - prevents duplicate toasts from interceptor + hook onError

  /**
   * Checks if a message should be displayed based on deduplication rules.
   */
  private static shouldShow(content: string): boolean {
    const now = Date.now();
    if (content === this.lastMessage && now - this.lastTimestamp < this.COOLDOWN) {
      return false;
    }
    this.lastMessage = content;
    this.lastTimestamp = now;
    return true;
  }

  /**
   * Display a success message toast.
   * @param content Message to display
   */
  static success(content: string) {
    if (this.shouldShow(content)) {
      message.success(content);
    }
  }

  /**
   * Display an error message toast.
   * @param content Message to display
   */
  static error(content: string) {
    if (this.shouldShow(content)) {
      message.error(content);
    }
  }

  /**
   * Display a warning message toast.
   * @param content Message to display
   */
  static warning(content: string) {
    if (this.shouldShow(content)) {
      message.warning(content);
    }
  }

  /**
   * Parse an error object (from Axios or elsewhere) and return a human-readable message.
   * @param error The error object to parse
   * @returns A string representing the error message
   */
  static parseErrorMessage(error: any): string {
    if (typeof error === 'string') return error;

    // Axios error handling
    if (error?.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') return data;
      
      // Handle array of errors
      if (data.errors && Array.isArray(data.errors)) {
        return data.errors.join(' | ');
      }
      
      // Handle object with error field (often more descriptive)
      if (data.error && typeof data.error === 'string') return data.error;
      
      // Handle object with message field
      if (data.message && data.message !== 'error') return data.message;
      
      // Fallback to error field if message was 'error'
      if (data.error) return String(data.error);
    }

    if (error?.message) return error.message;

    return "An unknown error occurred. Please try again.";
  }

  /**
   * Handle and display an error automatically.
   * @param error The error object to handle
   */
  static handleError(error: any) {
    const msg = this.parseErrorMessage(error);
    this.error(msg);
  }
}

export default ErrorService;
