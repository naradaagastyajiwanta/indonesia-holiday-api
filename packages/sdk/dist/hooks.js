"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHolidays = useHolidays;
exports.useTodayHoliday = useTodayHoliday;
exports.useNextHoliday = useNextHoliday;
const react_1 = require("react");
const indonesiaHoliday_1 = require("./indonesiaHoliday");
function useHolidays(year, month) {
    const [data, setData] = (0, react_1.useState)([]);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        setIsLoading(true);
        indonesiaHoliday_1.IndonesiaHoliday.getHolidays(year, month)
            .then((res) => {
            if (isMounted) {
                setData(res);
                setIsLoading(false);
                setError(null);
            }
        })
            .catch((err) => {
            if (isMounted) {
                setError(err);
                setIsLoading(false);
            }
        });
        return () => {
            isMounted = false;
        };
    }, [year, month]);
    return { data, isLoading, error };
}
function useTodayHoliday() {
    const [data, setData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        setIsLoading(true);
        indonesiaHoliday_1.IndonesiaHoliday.today()
            .then((res) => {
            if (isMounted) {
                setData(res);
                setIsLoading(false);
            }
        })
            .catch((err) => {
            if (isMounted) {
                setError(err);
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);
    return { data, isLoading, error };
}
function useNextHoliday() {
    const [data, setData] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        let isMounted = true;
        setIsLoading(true);
        indonesiaHoliday_1.IndonesiaHoliday.next()
            .then((res) => {
            if (isMounted) {
                setData(res);
                setIsLoading(false);
            }
        })
            .catch((err) => {
            if (isMounted) {
                setError(err);
                setIsLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, []);
    return { data, isLoading, error };
}
