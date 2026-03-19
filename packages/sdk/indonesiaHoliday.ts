import axios from 'axios';

const BASE_URL = 'https://indonesia-holiday-api.vercel.app/api';

export interface Holiday {
  holiday_date: string;
  holiday_name: string;
  is_national_holiday: boolean;
}

export class IndonesiaHoliday {
  static async getHolidays(year?: number, month?: string): Promise<Holiday[]> {
    let url = BASE_URL;
    if (year) {
      url += '/' + year;
      if (month) url += '/' + month;
    }
    const { data } = await axios.get(url);
    return data;
  }

  static async today(): Promise<Holiday | null> {
    const { data } = await axios.get(BASE_URL + '/today');
    return Object.keys(data).length > 0 ? data : null;
  }

  static async next(): Promise<Holiday | null> {
    const { data } = await axios.get(BASE_URL + '/next');
    return Object.keys(data).length > 0 ? data : null;
  }
}
