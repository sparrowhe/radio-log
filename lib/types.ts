export interface LoTWQuery {
    qso_qsl?: 'yes' | 'no';
    qso_qslsince?: string; // YYYY-MM-DD format
    qso_qsorxsince?: string;
    qso_owncall?: string;
    qso_callsign?: string; 
    qso_mode?: string;
    qso_band?: string;
    qso_dxcc?: number;
    qso_startdate?: string;
    qso_starttime?: string;
    qso_enddate?: string;
    qso_endtime?: string;
    qso_mydetail?: 'yes';
    qso_qsldetail?: 'yes';
    qso_withown?: 'yes';
};
  
export interface QSO {
    call: string;
    band: string;
    freq?: string;
    mode: string;
    qso_date: string;
    qso_datetime: Date;
    time_on: string;
    qsl_rcvd?: 'Y' | 'N';
    qslrdate?: string;
    credit_granted?: string;
    station_callsign?: string;
    prop_mode?: string;
    sat_name?: string;
    dxcc?: string;
    country?: string;
    state?: string;
    gridsquare?: string;
    my_gridsquare?: string;
};