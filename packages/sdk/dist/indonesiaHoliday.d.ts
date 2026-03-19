export interface Holiday {
    holiday_date: string;
    holiday_name: string;
    is_national_holiday: boolean;
}
export declare class IndonesiaHoliday {
    static getHolidays(year?: number, month?: string): Promise<Holiday[]>;
    static today(): Promise<Holiday | null>;
    static next(): Promise<Holiday | null>;
}
