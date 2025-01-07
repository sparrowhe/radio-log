import { QSO } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BadgeCheck } from 'lucide-react';

interface QSOTableProps {
  qsos: QSO[];
}

export function QSOTable({ qsos }: QSOTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Call</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Band</TableHead>
          <TableHead>Freq</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>QSL?</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {qsos.map((qso, index) => (
          <TableRow key={index}>
            <TableCell>{qso.call}</TableCell>
            <TableCell>{qso.qso_date}</TableCell>
            <TableCell>{qso.band}</TableCell>
            <TableCell>{qso.freq?.slice(0, -2)}</TableCell>
            <TableCell>{qso.mode}</TableCell>
            <TableCell>{
              qso.qsl_rcvd === 'Y' ? <BadgeCheck /> : null
          }</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

