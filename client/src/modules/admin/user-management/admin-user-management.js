import CurrentUsers from './current-users';
import RegisterUsers from './registered-users';
import { Container, Tab, Tabs } from 'react-bootstrap';

export default function AdminUserManagement() {
  return (
    <>
      <Container fluid="xxl" className="my-3 text-white rounded h-100">
        <h1 className="mb-1 h2">Admin User Management</h1>
        <div className="bg-white">
          <Tabs
            defaultActiveKey="currentusers"
            id="admin-user-managemenr"
            transition={false}
            className=""
          >
            <Tab eventKey="currentusers" title="Current Users">
              <CurrentUsers />
            </Tab>
            <Tab eventKey="registeredusers" title="Registered Users">
              <RegisterUsers />
            </Tab>
          </Tabs>
        </div>
      </Container>
    </>
  );
}
