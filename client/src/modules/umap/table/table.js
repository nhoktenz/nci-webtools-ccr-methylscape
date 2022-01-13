import { Container, Row, Col } from 'react-bootstrap';
import { useRecoilState } from 'recoil';
import { tableState } from './table.state';
import ReactTable from '../../components/table';
import React from 'react';

export default function Table() {
  const [umapTableState, setTableState] = useRecoilState(tableState);
  const { points } = umapTableState;

  const cols = points.length
    ? Object.keys(points[0].customdata).map((e) => ({
        id: e,
        accessor: e,
        Header: e,
      }))
    : [];

  const data = points.map((e) => e.customdata);

  return (
    <Container fluid>
      <ReactTable data={data} columns={cols} />
    </Container>
  );
}
