"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndonesiaHoliday = void 0;
const axios_1 = __importDefault(require("axios"));
const BASE_URL = 'https://indonesia-holiday-api.vercel.app/api';
class IndonesiaHoliday {
    static async getHolidays(year, month) {
        let url = BASE_URL;
        if (year) {
            url += '/' + year;
            if (month)
                url += '/' + month;
        }
        const { data } = await axios_1.default.get(url);
        return data;
    }
    static async today() {
        const { data } = await axios_1.default.get(BASE_URL + '/today');
        return Object.keys(data).length > 0 ? data : null;
    }
    static async next() {
        const { data } = await axios_1.default.get(BASE_URL + '/next');
        return Object.keys(data).length > 0 ? data : null;
    }
}
exports.IndonesiaHoliday = IndonesiaHoliday;
