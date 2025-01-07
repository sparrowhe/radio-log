// sync-lotw.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { AdifParser } from 'adif-parser-ts';
import fetch from 'node-fetch';
import { kv } from '@vercel/kv';
import { LoTWQuery, QSO } from '../../lib/types';

const CACHE_TTL = 60 * 60; // 1小时缓存
const CACHE_KEY = 'lotw-sync-data';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const username = process.env.LOTW_USERNAME;
  const password = process.env.LOTW_PASSWORD;

  if (!username || !password) {
    return res.status(500).json({ error: 'LoTW credentials not configured' });
  }

  try {

    const cachedData = await kv.get(CACHE_KEY) as string;
    if (cachedData) {
      const qsos = parseADI(cachedData);
      return res.status(200).json({
        qsos,
        count: qsos.length
      });
    }

    // 构建查询参数
    const query: LoTWQuery = {
      qso_qsldetail: 'yes',
      qso_mydetail: 'yes',
      qso_withown: 'yes',
      qso_startdate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
      qso_qsl: 'no',
    };

    const queryString = new URLSearchParams({
      login: username,
      password: password,
      qso_query: '1',
      ...Object.fromEntries(Object.entries(query).map(([key, value]) => [key, String(value)]))
    }).toString();

    const lotwResponse = await fetch(
      `https://lotw.arrl.org/lotwuser/lotwreport.adi?${queryString}`,
      {
        method: 'GET',
      }
    );

    if (!lotwResponse.ok) {
      throw new Error(`LoTW API error: ${lotwResponse.status}`);
    }

    const adiData = await lotwResponse.text();
    
    if (!adiData.includes('<APP_LoTW_EOF>')) {
      console.log(adiData)
      throw new Error('Invalid ADI response from LoTW');
    }

    const qsos = parseADI(adiData);
    await kv.set(CACHE_KEY, adiData, { ex: CACHE_TTL });
    res.status(200).json({
      qsos,
      count: qsos.length
    });

  } catch (error) {
    console.error('LoTW sync error:', error);
    res.status(500).json({
      error: 'Failed to sync with LoTW',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function parseADI(adiContent: string): QSO[] {
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
