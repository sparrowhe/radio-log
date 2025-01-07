import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface SearchResultTableProps {
    data: {
        [band: string]: {
            confirmed: number;
            unconfirmed: number;
        };
    };
}

const SearchResultTable: React.FC<SearchResultTableProps> = ({ data }) => {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Band</TableHead>
                    <TableHead>Confirmed</TableHead>
                    <TableHead>Unconfirmed</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Object.entries(data).map(([band, counts]) => (
                    <TableRow key={band}>
                        <TableCell>{band}</TableCell>
                        <TableCell>{counts.confirmed}</TableCell>
                        <TableCell>{counts.unconfirmed}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default SearchResultTable;