import React from 'react';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import UserForm from './_form';
import gql from 'graphql-tag';
import Loader from '../../components/Loader';
import { Query } from 'react-apollo';
import authError from '../../helpers/auth_error';

export const UPDATE_USER_MUTATION = gql`
  mutation updateUser(
    $id: String!,
    $username: String!,
    $password: String!,
    $unit: String,
    $role: String!,
  ) {
    updateUser(
      id: $id,
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

export const USER_QUERY = gql`
  query getUser($id: String!) {
    getUser(id: $id) {
      id
      username
      unit { id name  parent { id name } fullPath }
      role
    }
  }
`;

class UserUpdate extends React.Component {
  render = () => {
    const { id } = this.props.match.params;
    return (
      <Query query={USER_QUERY} variables={{ id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Loader />
            );
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const user = data.getUser;
          if (!user) return <Redirect to='/404' />
          document.title = `Пользователь - ${user.username}`;
          return (
            <React.Fragment>
              <Breadcrumb>
                <Breadcrumb.Section><Link to='/users'>Пользователи</Link></Breadcrumb.Section>
                <Breadcrumb.Divider icon='right angle' />
                <Breadcrumb.Section active>{`${user.username}`}</Breadcrumb.Section>
              </Breadcrumb>
              <Grid>
                <Grid.Row >
                  <Grid.Column width={3}></Grid.Column>
                  <Grid.Column width={10}>
                    <UserForm isNewRecord={false} mutation={UPDATE_USER_MUTATION} user={user} />
                  </Grid.Column>
                  <Grid.Column></Grid.Column>
                </Grid.Row>
              </Grid>
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default UserUpdate;