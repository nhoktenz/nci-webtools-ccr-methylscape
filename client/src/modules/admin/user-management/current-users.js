import React, { useState, useEffect } from 'react';
import { Container, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useRecoilValue, useRecoilRefresher_UNSTABLE } from 'recoil';
import { groupBy } from 'lodash';
import axios from 'axios';
import Table from '../../components/table';
import {
  rolesSelector,
  usersSelector,
  organizationsSelector,
} from './user-management.state';

export default function CurrentUsers() {
  const [alerts, setAlerts] = useState([]);
  const roles = useRecoilValue(rolesSelector);
  const users = useRecoilValue(usersSelector);
  const refreshUsers = useRecoilRefresher_UNSTABLE(usersSelector);
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [userStatus, setUserStatus] = useState(true);
  const [form, setForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);

  const userGroups = groupBy(users, 'status');
  const activeUsers = userGroups['active'] || [];
  const inactiveUsers = userGroups['inactive'] || [];
  const visibleUsers = [
    ...activeUsers,
    ...(showInactiveUsers ? inactiveUsers : []),
  ];
  const organizations = useRecoilValue(organizationsSelector);
  const mergeForm = (state) => setForm({ ...form, ...state });

  async function openEditModal({ row }) {
    setShowEditModal(true);
    setForm(row.original);
    // row.original.status === 'active'
    //   ? setUserStatus(true)
    //   : setUserStatus(false);
    // console.log(userStatus);
  }

  async function handleFormChange(e) {
    let { name, value, checked, type } = e.target;
    console.log(e.target);
    if (name === 'status') {
      value = checked ? 'active' : 'inactive';
    }
    setForm((form) => ({ ...form, [name]: value }));

    console.log(form);
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setShowEditModal(false);
    await axios.put(`api/users/${form.id}`, form);
    refreshUsers();
  }

  const cols = [
    {
      Header: 'Name',
      accessor: 'firstName',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value}, {e.row.original.lastName}
        </div>
      ),
    },
    {
      Header: 'Account',
      accessor: 'accountType',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value || 'NA'}
        </div>
      ),
    },
    {
      Header: 'Email',
      accessor: 'email',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value}
        </div>
      ),
    },
    {
      Header: 'Organization',
      accessor: (e) => ({
        name: e.organizationName,
        other: e.organizationOther,
      }),
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value.name} {e.value.other && `(${e.value.other})`}
        </div>
      ),
    },
    {
      Header: 'Role',
      accessor: 'roleName',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value || 'NA'}
        </div>
      ),
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {e.value}
        </div>
      ),
    },
    {
      Header: 'Submitted Date',
      accessor: 'createdAt',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {new Date(e.value).toLocaleDateString()}
        </div>
      ),
    },
    {
      Header: 'Approved Date',
      accessor: 'updatedAt',
      Cell: (e) => (
        <div
          style={{
            textAlign: 'left',
          }}
        >
          {new Date(e.value).toLocaleDateString()}
        </div>
      ),
    },
    {
      Header: 'Actions',
      id: 'actions',
      Cell: ({ row }) => (
        <div>
          <Button className="me-2" onClick={() => openEditModal({ row })}>
            Edit
          </Button>
        </div>
      ),
    },
  ];
  return (
    <Container>
      {/* <h1 className="h4 mb-3 text-primary">Registered Users</h1> */}
      {alerts.map(({ type, message }, i) => (
        <Alert key={i} variant={type} onClose={() => setAlerts([])} dismissible>
          {message}
        </Alert>
      ))}

      {visibleUsers && visibleUsers.length > 0 ? (
        <>
          <Form className="text-primary d-flex justify-content-center">
            <Form.Check type="checkbox" id="show-inactive-user">
              <Form.Check.Input
                type="checkbox"
                checked={showInactiveUsers}
                onChange={(ev) => setShowInactiveUsers(ev.target.checked)}
              />
              <Form.Check.Label>Include Inactive Users</Form.Check.Label>
            </Form.Check>
          </Form>
          <Table
            responsive
            data={visibleUsers}
            columns={cols}
            options={{ disableFilters: true }}
          />
        </>
      ) : (
        <div className="text-center py-5 text-primary">
          <h3>No current users available</h3>
        </div>
      )}

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit User</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3" controlId="approveModalId">
              <Form.Label>Update User Role</Form.Label>
              <Form.Select
                name="roleId"
                value={form.roleId}
                onChange={handleFormChange}
                required
              >
                <option value="" hidden>
                  Select Role
                </option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.description} ({r.name})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3" controlId="organization">
              <Form.Label>Update Organization/Institution</Form.Label>
              <Form.Select
                name="organizationId"
                value={form.organizationId}
                onChange={handleFormChange}
                required
              >
                <option value="" hidden>
                  Select Organization/Instituiton
                </option>
                {organizations.map((o) => (
                  <option key={`organization-${o.name}`} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Form.Select>
              {+form.organizationId === 1 && (
                <Form.Control
                  type="text"
                  name="organizationOther"
                  placeholder="Enter Organization/Instituiton"
                  value={form.organizationOther}
                  onChange={handleFormChange}
                  required
                  className="mt-2"
                />
              )}
            </Form.Group>
            <Form.Group>
              <Form.Check
                inline
                type="checkbox"
                id={form.id}
                label="active"
                name="status"
                checked={form.status === 'active'}
                onChange={handleFormChange}
              />
            </Form.Group>
            {/* <Form.Group className="mb-3" controlId="editUserStatus">
              <Form.Label>Enable/ Disable Account</Form.Label>
              <Form.Select
                name="status"
                value={form.status}
                onChange={handleFormChange}
              >
                <option value="" hidden>
                  Select Status
                </option>
                <option value="active">Enable Account</option>
                <option value="inactive">Disable account</option>
              </Form.Select>
            </Form.Group> */}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" type="submit" className="btn-lg">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
}
