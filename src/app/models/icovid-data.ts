export interface ICovidData {
    name: string;
    cases: number;
    newCases: number;
    deaths: number;
    newDeaths: number;
    transmissionType: string;
    daysSinceLastCast: number;
    region: string;
    territory: boolean;
    reportDate: Date;
    reportNumber: number;
}
