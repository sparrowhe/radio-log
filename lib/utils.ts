import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { QSO } from "./types";
import { AdifParser } from "adif-parser-ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseADI(adiContent: string): QSO[] {
  const qsos: QSO[] = [];
  AdifParser.parseAdi(adiContent)?.records?.forEach(record => {
    console.log(record);
    const qso: Partial<QSO> = {
      call: record['call'],
      band: record['band'],
      freq: record['freq'],
      mode: record['mode'],
      qso_date: `${record['qso_date'].slice(0, 4)}-${record['qso_date'].slice(4, 6)}-${record['qso_date'].slice(6, 8)}`,
      time_on: record['time_on'],
      qsl_rcvd: record['qsl_rcvd'] as 'Y' | 'N',
      qslrdate: record['qslrdate'],
      station_callsign: record['STATION_CALLSIGN'],
      prop_mode: record['PROP_MODE'],
      sat_name: record['SAT_NAME'],
      my_gridsquare: record['my_gridsquare'],
      dxcc: record['dxcc'],
      gridsquare: record['gridsquare'],

      qso_datetime: new Date
    };
    qsos.push(qso as QSO);
  });

  qsos.sort((a, b) => {
    const dateA = new Date(Date.UTC(
      parseInt(a.qso_date.slice(0, 4)),
      parseInt(a.qso_date.slice(5, 7)) - 1,
      parseInt(a.qso_date.slice(8, 10)),
      parseInt(a.time_on.slice(0, 2)),
      parseInt(a.time_on.slice(3, 5)),
      parseInt(a.time_on.slice(6, 8))
    ));
    const dateB = new Date(Date.UTC(
      parseInt(b.qso_date.slice(0, 4)),
      parseInt(b.qso_date.slice(5, 7)) - 1,
      parseInt(b.qso_date.slice(8, 10)),
      parseInt(b.time_on.slice(0, 2)),
      parseInt(b.time_on.slice(3, 5)),
      parseInt(b.time_on.slice(6, 8))
    ));
    return dateA > dateB ? -1 : dateA < dateB ? 1 : 0;
  });

  qsos.forEach(qso => qso.time_on = "REDACTED");
  return qsos;
}