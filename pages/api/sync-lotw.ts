// sync-lotw.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { kv } from '@vercel/kv';
import { LoTWQuery } from '../../lib/types';
import queryLoTW from '@/lib/lotw';
import { parseADI } from '@/lib/utils';

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

    const lotwResponse = await queryLoTW(query);

    if (!lotwResponse.ok) {
      throw new Error(`LoTW API error: ${lotwResponse.status}`);
    }

    const adiData = await lotwResponse.text();
    
    if (!adiData.includes('<APP_LoTW_EOF>')) {
      console.log(adiData)
      throw new Error('Invalid ADI response from LoTW');
    }

    const qsos = parseADI(adiData);
    kv.set(CACHE_KEY, adiData, { ex: CACHE_TTL }).then();
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
