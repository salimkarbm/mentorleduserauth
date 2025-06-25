import { Response } from 'express';

export const HttpResponse = ({
  response,
  data,
  status = 200,
  message = 'Request successful',
}: {
  status?: number;
  message?: string;
  data: any;
  response: Response;
}) => {
  return response.status(status).json({ data, message });
};
