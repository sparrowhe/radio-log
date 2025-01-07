import type { NextApiRequest, NextApiResponse } from 'next';
import { LoTWQuery, SearchResults } from '../../lib/types';
import queryLoTW from '@/lib/lotw';
import { parseADI } from '@/lib/utils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const callsign = req.query.callsign as string;

    if (!callsign) {
        return res.status(400).json({ error: 'Missing callsign' });
    }

    const username = process.env.LOTW_USERNAME;
    const password = process.env.LOTW_PASSWORD;

    if (!username || !password) {
        return res.status(500).json({ error: 'LoTW credentials not configured' });
    }

    const query: LoTWQuery = {
        qso_qsldetail: 'yes',
        qso_mydetail: 'yes',
        qso_withown: 'yes',
        qso_startdate: '1900-01-01',
        qso_qsl: 'no',
        qso_callsign: callsign,
    }

    const lotwResponse = await queryLoTW(query);
    
    if (!lotwResponse.ok) {
        throw new Error(`LoTW API error: ${lotwResponse.status}`);
    }

    const adiData = await lotwResponse.text();
    const parsedData = parseADI(adiData);
    if (parsedData.length === 0) {
        return res.status(404).json({ error: 'No QSOs found' });
    }

    const bandStats = parsedData.reduce((acc: SearchResults, qso) => {
        const band = qso.band.toLocaleLowerCase();
        const qsl = qso.qsl_rcvd === 'Y' ? 'confirmed' : 'unconfirmed';

        if (!acc[band]) {
            acc[band] = { confirmed: 0, unconfirmed: 0 };
        }

        acc[band][qsl]++;
        return acc;
    }, {});

    res.status(200).json(bandStats);
}