export interface ApiResponse<T = any> {
    succeeded: boolean;
    messages?: T;
    data?: T;
  }
  