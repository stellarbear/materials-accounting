import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Redirect } from 'react-router-dom';
import { Grid, Table, Button, Header, Modal, Icon, Input, Message, Label, Checkbox, Divider } from 'semantic-ui-react';
import TablePlaceholder from '../../components/TablePlaceholder';
import authError from '../../helpers/auth_error';

const MODAL_CONTENT = {
  'CREATE': {
    header: 'Добавить запись',
    buttonText: 'Добавить',
    icon: 'plus',
    color: 'teal',
  },
  'UPDATE': {
    header: 'Изменить',
    buttonText: 'Сохранить',
    icon: 'save',
    color: 'teal'
  },
  'DELETE': {
    header: 'Вы уверены, что хотите удалить?',
    buttonText: 'Удалить',
    icon: 'trash alternate outline',
    color: 'red'
  }
}

export const TSTYPE_QUERY = gql`
  {
    allTsTypes {
      id
      name
      withComplectation
    }
  }
`;

export const CREATE_TSTYPE_MUTATION = gql`
  mutation createTsType($name: String!, $withComplectation: Boolean!){
    createTsType(name: $name, withComplectation: $withComplectation) {
      id
      name
      withComplectation
    }
  }
`;

export const UPDATE_TSTYPE_MUTATION = gql`
  mutation updateTsType($id: String!, $name: String!, $withComplectation: Boolean!){
    updateTsType(id: $id, name: $name, withComplectation: $withComplectation) {
      id
      name
      withComplectation
    }
  }
`;

export const DELETE_TSTYPE_MUTATION = gql`
  mutation deleteTsType($id: String!){
    deleteTsType(id: $id) {
      id
      status
    }
  }
`;

const getMutation = (action) => {
  const mutations = {
    'CREATE': CREATE_TSTYPE_MUTATION,
    'UPDATE': UPDATE_TSTYPE_MUTATION,
    'DELETE': DELETE_TSTYPE_MUTATION
  }
  return mutations[action];
}

class TsTypeList extends React.Component {

  state = {
    modal: false,
    name: '',
    id: null,
    withComplectation: false,
    action: 'CREATE',
    error: ''
  };

  show = () => this.setState({ modal: true });
  close = () => this.setState({ modal: false, error: '' });

  renderComplectationLabel = (withComplectation) => {
    if (withComplectation) {
      return (
        <Label basic color='blue'>
          Комплектация
        </Label>
      );
    }
  }

  render = () => {
    document.title = 'Типы ТС';
    const { id, name, action, modal, withComplectation } = this.state;
    const currentMutation = getMutation(action);
    const content = MODAL_CONTENT[action];
    return (
      <Query query={TSTYPE_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <TablePlaceholder name='Типы ТС' />
            );
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const typesToRender = data.allTsTypes;

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
                          <Table.HeaderCell colSpan='4'>
                            <Header as='h3' floated='left'>Типы ТС</Header>
                            <Button
                              color='teal'
                              floated='right'
                              icon='plus'
                              content='Добавить'
                              size='tiny'
                              onClick={e => {
                                this.setState({
                                  action: 'CREATE',
                                  modal: true,
                                  name: '',
                                  id: null,
                                  withComplectation: false
                                })
                              }}
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {
                          typesToRender.map((type, index) => {
                            return (
                              <Table.Row key={type.id}>
                                <Table.Cell textAlign='center' collapsing>{index + 1}</Table.Cell>
                                <Table.Cell collapsing>
                                  {type.name}
                                </Table.Cell>
                                <Table.Cell textAlign='center' collapsing>{this.renderComplectationLabel(type.withComplectation)}</Table.Cell>
                                <Table.Cell collapsing textAlign='right'>
                                  <Button.Group>
                                    <Button
                                      icon='edit'
                                      onClick={e => {
                                        this.setState({
                                          action: 'UPDATE',
                                          modal: true,
                                          name: type.name,
                                          withComplectation: type.withComplectation,
                                          id: type.id
                                        })
                                      }}
                                    />
                                    <Button
                                      icon='trash alternate'
                                      onClick={e => {
                                        this.setState({
                                          action: 'DELETE',
                                          modal: true,
                                          name: type.name,
                                          id: type.id
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

              <Modal size='small' open={modal} onClose={this.close}>
                <Modal.Header>{content.header}</Modal.Header>
                <Modal.Content>
                  {
                    ['CREATE', 'UPDATE'].includes(action) &&
                    <React.Fragment>
                      <Input
                        error={Boolean(this.state.error)}
                        focus
                        fluid
                        value={name}
                        placeholder='Тип ТС'
                        onChange={e => this.setState({ name: e.target.value, error: '' })}
                      />
                      <Divider hidden />
                      <Checkbox
                        toggle
                        label={withComplectation ? 'С комплектацией' : 'Без комплектации'}
                        checked={withComplectation}
                        onChange={() => this.setState({ withComplectation: !withComplectation })}
                      />
                    </React.Fragment>
                  }
                  {
                    action === 'DELETE' &&
                    <p><b>{name}</b></p>
                  }
                  {
                    this.state.error &&
                    <Message negative>
                      {this.state.error}
                    </Message>
                  }
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={this.close}>Отмена</Button>

                  <Mutation
                    mutation={currentMutation}
                    variables={{ id, name, withComplectation }}
                    onCompleted={() => this.props.history.push('/types')}
                    refetchQueries={
                      [{
                        query: TSTYPE_QUERY
                      }]
                    }
                  >
                    {mutation => (
                      <Button color={content.color} onClick={async () => {
                        if (!name) {
                          this.setState({ error: 'Поле не может быть пустым!' });
                          return;
                        }
                        try {
                          await mutation();
                          this.close();
                        } catch (e) {
                          if (e.graphQLErrors && e.graphQLErrors[0] && e.graphQLErrors[0].extensions && e.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
                            const error = e.graphQLErrors[0];
                            this.setState({
                              error: error.message
                            });
                          } else {
                            this.setState({
                              error: 'Что-то пошло не так. Пожалуйста, перезагрузите страницу!'
                            });
                          }
                        }
                      }
                      }>
                        <Icon name={content.icon} />{content.buttonText}
                      </Button>
                    )
                    }
                  </Mutation>
                </Modal.Actions>
              </Modal>
            </React.Fragment>
          );
        }}
      </Query>
    );
  }
}

export default TsTypeList;