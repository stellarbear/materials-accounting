import React from 'react';
import { Redirect, Link } from 'react-router-dom';
import { Grid, Table, Button, Label, Modal, Icon, Input, Message } from 'semantic-ui-react';
import TablePlaceholder from '../../components/TablePlaceholder';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import authError from '../../helpers/auth_error';
import { withTranslation } from '../../components/TranslationWrapper';

export const USERS_QUERY = gql`
  {
    allUsers {
      id
      username
      role
      unit { id name  parent { id name } fullPath }
    }
  }
`;

const roles = {
  admin: { name: 'Администратор', color: 'red' },
  moderator: { name: 'Модератор', color: 'blue' },
  user: { name: 'Пользователь', color: 'grey' }
};

export const DELETE_USER_MUTATION = gql`
  mutation deleteUser($id: String!){
    deleteUser(id: $id) {
      id
      status
    }
  }
`;

class UserList extends React.Component {
  state = {
    modal: false,
    deleteID: null,
    deleteUsername: '',
    deleteRole: 'user',
    confirmUsername: '',
    error: ''
  }

  close = () => this.setState({ modal: false, error: '', confirmUsername: '' });

  renderModalContent = () => {
    const { deleteRole, confirmUsername, deleteUsername, error } = this.state;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (deleteRole === 'admin') {
      return (
        <p><b>Вы не можете удалить пользователя с правами администратора!</b></p>
      );
    }
    if (currentUser.username === deleteUsername) {
      return (
        <p><b>Вы не можете удалить своего пользователя!</b></p>
      )
    }
    return (
      <React.Fragment>
        <p>
          Для подтверждения введите логин удаляемого пользователя
        </p>
        <Input
          placeholder='Имя пользователя'
          value={confirmUsername}
          onChange={(e, { value }) => this.setState({ confirmUsername: value })}
        />
        {
          error && (
            <Message negative>
              <Message.Header>Ошибка при удалении!</Message.Header>
              <p>{error}</p>
            </Message>
          )
        }
      </React.Fragment>
    );
  }

  render = () => {
    document.title = 'Список пользователей';
    const { deleteRole, deleteUsername, confirmUsername } = this.state;
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return (
      <Query query={USERS_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return <TablePlaceholder name='Пользователи' />;
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const usersToRender = data.allUsers;
          return (
            <React.Fragment>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={3}>
                  </Grid.Column>
                  <Grid.Column width={10}>
                    <Table striped color='teal'>
                      <Table.Header>
                        <Table.Row>
                          <Table.HeaderCell textAlign='center'>#</Table.HeaderCell>
                          <Table.HeaderCell>Имя пользователя</Table.HeaderCell>
                          <Table.HeaderCell>Роль</Table.HeaderCell>
                          <Table.HeaderCell>{this.props.translation.get("Подразделение")}</Table.HeaderCell>
                          <Table.HeaderCell>
                            <Button
                              color='teal'
                              floated='right'
                              icon='plus'
                              content='Добавить'
                              size='tiny'
                              as={Link}
                              to='/users/create'
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {
                          usersToRender.map((user, index) => {
                            return (
                              <Table.Row key={user.id}>
                                <Table.Cell textAlign='center' collapsing>{index + 1}</Table.Cell>
                                <Table.Cell collapsing>
                                  {user.username}
                                </Table.Cell>
                                <Table.Cell collapsing>
                                  <Label
                                    basic
                                    color={roles[user.role].color}
                                  >
                                    {roles[user.role].name}
                                  </Label>
                                </Table.Cell>
                                <Table.Cell collapsing>
                                  {(user.unit && user.unit.fullPath.join(' ')) || 'Все'}
                                </Table.Cell>
                                <Table.Cell collapsing textAlign='right'>
                                  <Button.Group>
                                    <Button
                                      icon='edit'
                                      as={Link}
                                      to={`/users/update/${user.id}`}
                                    />
                                    <Button
                                      icon='trash alternate'
                                      onClick={e => {
                                        this.setState({
                                          modal: true,
                                          deleteUsername: user.username,
                                          deleteID: user.id,
                                          deleteRole: user.role,
                                        })
                                      }}
                                    />
                                  </Button.Group>
                                </Table.Cell>
                              </Table.Row>
                            );
                          })
                        }
                      </Table.Body>
                    </Table>
                  </Grid.Column>
                </Grid.Row>
              </Grid>

              <Modal size='tiny' open={this.state.modal} onClose={this.close}>
                <Modal.Header>Удалить пользователя</Modal.Header>
                <Modal.Content>
                  {this.renderModalContent()}
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={this.close}>
                    {deleteRole === 'admin' ? 'ОК' : 'Отмена'}
                  </Button>
                  {
                    !(deleteRole === 'admin' || currentUser.username === deleteUsername) && (
                      <Mutation
                        mutation={DELETE_USER_MUTATION}
                        variables={{ id: this.state.deleteID }}
                      >
                        {
                          (deleteMutation, { client }) => (
                            <Button color='red' onClick={async () => {
                              try {
                                if (confirmUsername !== deleteUsername) {
                                  this.setState({ error: 'Введенное имя пользователя не совпадает с удаляемым!' })
                                } else {
                                  await deleteMutation();
                                  await client.resetStore();
                                  await this.setState({
                                    modal: false,
                                    deleteID: null,
                                    deleteUsername: '',
                                    deleteRole: 'user',
                                    confirmUsername: '',
                                    error: ''
                                  });
                                }
                              } catch (e) {
                                this.setState({ error: 'Что-то пошло не так, перезагрузите страницу!' })
                              }
                            }}>
                              <Icon name='trash alternate outline' />Удалить
                            </Button>
                          )
                        }
                      </Mutation>
                    )
                  }
                </Modal.Actions>
              </Modal>

            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default withTranslation(UserList);