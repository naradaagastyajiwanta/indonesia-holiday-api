import { Holiday } from './indonesiaHoliday';
export declare function useHolidays(year?: number, month?: string): {
    data: Holiday[];
    isLoading: boolean;
    error: Error | null;
};
export declare function useTodayHoliday(): {
    data: Holiday | null;
    isLoading: boolean;
    error: Error | null;
};
export declare function useNextHoliday(): {
    data: Holiday | null;
    isLoading: boolean;
    error: Error | null;
};
