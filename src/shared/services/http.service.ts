import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class ApiService {
  private readonly baseURL = process.env.SCRAPPER_SERVER_URL;
  async get<T>(url: string, params?: any): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axios.get(`${this.baseURL}${url}`, { params });
      return response.data;
    } catch (error) {
      console.log(`Failed to fetch data: ${error.message}`);
    }
  }
}
