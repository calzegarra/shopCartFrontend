
export interface ResponseData<T> {
  data: T;
  status: boolean;
  message: string;
  code: number;
}
