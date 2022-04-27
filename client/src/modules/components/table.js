import { useMemo, forwardRef, useRef, useEffect, Fragment } from 'react';
import BootstrapTable from 'react-bootstrap/Table';
import {
  Form,
  InputGroup,
  Pagination,
  Row,
  Col,
  Dropdown,
  Button,
} from 'react-bootstrap';
import {
  useTable,
  useFilters,
  usePagination,
  useSortBy,
  useRowSelect,
  useExpanded,
} from 'react-table';
import { ChevronUp, ChevronDown, ChevronExpand } from 'react-bootstrap-icons';
import Papa from 'papaparse';
import './table.scss';

export function TextFilter({
  column: { filterValue, setFilter, placeholder, aria },
}) {
  return (
    <Form.Control
      size="sm"
      value={filterValue || ''}
      onChange={(e) => setFilter(e.target.value || undefined)}
      placeholder={placeholder || `Search`}
      aria-label={aria}
      className="border-0 rounded-pill"
    ></Form.Control>
  );
}

export function RangeFilter({
  column: { filterValue = [], setFilter, minPlaceholder, maxPlaceholder, aria },
}) {
  const getInputValue = (ev) =>
    ev.target.value ? parseInt(ev.target.value, 10) : undefined;

  return (
    <InputGroup className="flex-nowrap">
      <Form.Control
        placeholder={minPlaceholder || 'Min value'}
        type="number"
        value={filterValue[0] || ''}
        onChange={(e) => setFilter((old = []) => [getInputValue(e), old[1]])}
        aria-label={aria + ' Min'}
      />
      <Form.Control
        placeholder={maxPlaceholder || 'Max value'}
        type="number"
        value={filterValue[1] || ''}
        onChange={(e) => setFilter((old = []) => [old[0], getInputValue(e)])}
        aria-label={aria + ' Max'}
      />
    </InputGroup>
  );
}

const IndeterminateRadio = forwardRef(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef();
  const resolvedRef = ref || defaultRef;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate;
  }, [resolvedRef, indeterminate]);

  return <input type="radio" ref={resolvedRef} {...rest} />;
});

function handleSaveCSV(data, filename) {
  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: 'text/csv' });
  // Create an anchor element and dispatch a click event on it
  // to trigger a download
  const a = document.createElement('a');
  a.download = filename;
  a.href = window.URL.createObjectURL(blob);
  const clickEvt = new MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  a.dispatchEvent(clickEvt);
  a.remove();
}

export default function Table({
  columns,
  data,
  options = {},
  customOptions = {},
  renderRowSubComponent = false,
}) {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    visibleColumns,
    page,
    rows,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    allColumns,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: useMemo((_) => columns, [columns]),
      data: useMemo((_) => data, [data]),
      defaultColumn: useMemo(
        (_) => ({
          Filter: TextFilter,
        }),
        []
      ),
      ...options,
    },
    useFilters,
    useSortBy,
    customOptions.expanded ? useExpanded : () => {},
    usePagination,
    customOptions.rowSelectRadio ? useRowSelect : () => {},
    (hooks) => {
      if (customOptions.rowSelectRadio) {
        hooks.visibleColumns.push((columns) => [
          {
            id: 'selection',
            disableSortBy: true,
            Cell: ({ row }) => (
              <div className="d-flex justify-content-center">
                <IndeterminateRadio
                  {...row.getToggleRowSelectedProps()}
                  title={Object.values(row.values)[0]}
                />
              </div>
            ),
          },
          ...columns,
        ]);
      }
    }
  );
  return (
    <>
      <Row className="justify-content-end">
        {customOptions.download && (
          <Col sm="auto">
            <Button
              variant="link"
              onClick={() => handleSaveCSV(data, customOptions.download)}
            >
              Save CSV
            </Button>
          </Col>
        )}
        <Col sm="auto">
          {customOptions.hideColumns && (
            <Dropdown>
              <Dropdown.Toggle
                variant="secondary"
                size="sm"
                id={`toggle-umap-columns`}
              >
                Columns
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Form>
                  {allColumns.map((column) => (
                    <Form.Group
                      key={`${column.Header}-visible`}
                      controlId={`${column.Header}-visible`}
                      className="my-1 px-2"
                    >
                      <Form.Check
                        type="checkbox"
                        label={column.Header}
                        {...column.getToggleHiddenProps()}
                      />
                    </Form.Group>
                  ))}
                </Form>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Col>
      </Row>
      <div className="table-responsive">
        <BootstrapTable
          {...getTableProps()}
          hover
          size="sm"
          responsive
          className="mt-3"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="h5 sample-title"
              >
                {headerGroup.headers.map((column) => (
                  <td
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    aria-label={column.Header + '-sort'}
                  >
                    {column.render('Header')}
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <ChevronDown />
                      ) : (
                        <ChevronUp />
                      )
                    ) : (
                      !column.disableSortBy && (
                        <ChevronExpand className="ms-1" />
                      )
                    )}
                  </td>
                ))}
              </tr>
            ))}

            {!options.disableFilters &&
              headerGroups.map((headerGroup) => (
                <tr
                  {...headerGroup.getHeaderGroupProps()}
                  className="search-bg"
                >
                  {headerGroup.headers.map((column) => (
                    <td {...column.getHeaderProps()}>
                      <div className="py-2">
                        {column.canFilter ? column.render('Filter') : null}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
          </thead>

          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <Fragment key={row.getRowProps().key}>
                  <tr
                    onClick={() => {
                      if (customOptions.rowSelectRadio) {
                        const { toggleRowSelected } = row;
                        toggleRowSelected(true);
                      }
                      if (customOptions.expanded) {
                        const { toggleRowExpanded, isExpanded } = row;
                        toggleRowExpanded(!isExpanded);
                      }
                    }}
                  >
                    {row.cells.map((cell) => (
                      <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                    ))}
                  </tr>
                  {row.isExpanded ? (
                    <tr>
                      <td colSpan={visibleColumns.length}>
                        {renderRowSubComponent({ row })}
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </BootstrapTable>
      </div>

      <div className="d-flex flex-wrap align-items-center justify-content-end p-3">
        {/* <div>
          Showing rows {(1 + pageIndex * pageSize).toLocaleString()}-
          {Math.min(rows.length, (pageIndex + 1) * pageSize).toLocaleString()}{' '}
          of {rows.length.toLocaleString()}
        </div> */}

        <div className="d-flex flex-row justify-content-end my-auto">
          <div className="d-flex align-items-center">
            <Form.Control
              as="select"
              className="rounded-0 btn-border-sample-blue px-4"
              name="select-page-size"
              aria-label="Select page size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 25, 50, 100].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Form.Control>
          </div>

          <div className="d-flex pe-2 p-2 align-items-center">
            {(1 + pageIndex * pageSize).toLocaleString()}
          </div>
          <div className="d-flex">
            <Pagination aria-label="Previous" className="border border-0">
              {/*<Pagination.First
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
              >
                First
              </Pagination.First> */}
              <Pagination.Prev
                onClick={() => previousPage()}
                disabled={!canPreviousPage}
                className="border border-0"
              >
                &#60; Previous
              </Pagination.Prev>
              <Pagination.Next
                onClick={() => nextPage()}
                disabled={!canNextPage}
              >
                Next &#62;
              </Pagination.Next>
              {/* <Pagination.Last
                onClick={() => gotoPage(pageCount - 1)}
                disabled={!canNextPage}
              >
                Last
              </Pagination.Last> */}
            </Pagination>
          </div>
          <div className="d-flex ps-2 p-1 align-items-center">
            {rows.length.toLocaleString()}
          </div>
        </div>
      </div>
    </>
  );
}
