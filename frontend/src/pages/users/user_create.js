import React from 'react';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import UserForm from './_form';
import gql from 'graphql-tag';

export const CREATE_USER_MUTATION = gql`
  mutation createUser(
    $username: String!,
    $password: String!,
    $unit: String,
    $role: String!,
  ) {
    createUser(
      username: $username,
      password: $password,
      unit: $unit,
      role: $role,
    ) {
        id
        username
        unit { id name  parent { id name } fullPath }
        role
    }
  }
`;

class UserCreate extends React.Component {
  render = () => {
    document.title = 'Добавить пользователя';
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/users'>Пользователи</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>Добавить</Breadcrumb.Section>
        </Breadcrumb>
        <Grid>
          <Grid.Row >
            <Grid.Column width={3}></Grid.Column>
            <Grid.Column width={10}>
              <UserForm isNewRecord={true} mutation={CREATE_USER_MUTATION} />
            </Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default UserCreate;