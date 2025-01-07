import { LoTWQuery } from "./types";

export default async function queryLoTW(queryParam: LoTWQuery) {
    const username = process.env.LOTW_USERNAME;
    const password = process.env.LOTW_PASSWORD;

    if (!username || !password) {
        throw new Error('LoTW credentials not configured');
    }

    const queryString = new URLSearchParams({
        login: username,
        password: password,
        qso_query: '1',
        ...Object.fromEntries(Object.entries(queryParam).map(([key, value]) => [key, String(value)]))
    }).toString();

    return fetch(
        `https://lotw.arrl.org/lotwuser/lotwreport.adi?${queryString}`,
        {
            method: 'GET',
        }
    );

}