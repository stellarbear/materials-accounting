import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Redirect } from 'react-router-dom';
import { Grid, Table, Button, Header, Modal, Icon, Input, Message } from 'semantic-ui-react';
import TablePlaceholder from '../../components/TablePlaceholder';
import authError from '../../helpers/auth_error';
import { withTranslation } from '../../components/TranslationWrapper';

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

export const TSPURPOSE_QUERY = gql`
  {
    allTsPurposes {
      id
      name
    }
  }
`;

export const CREATE_TSPURPOSE_MUTATION = gql`
  mutation createTsPurpose($name: String!){
    createTsPurpose(name: $name) {
      id
      name
    }
  }
`;

export const UPDATE_TSPURPOSE_MUTATION = gql`
  mutation updateTsPurpose($id: String!, $name: String!){
    updateTsPurpose(id: $id, name: $name) {
      id
      name
    }
  }
`;

export const DELETE_TSPURPOSE_MUTATION = gql`
  mutation deleteTsPurpose($id: String!){
    deleteTsPurpose(id: $id) {
      id
      status
    }
  }
`;

const getMutation = (action) => {
  const mutations = {
    'CREATE': CREATE_TSPURPOSE_MUTATION,
    'UPDATE': UPDATE_TSPURPOSE_MUTATION,
    'DELETE': DELETE_TSPURPOSE_MUTATION
  }
  return mutations[action];
}

class TsPurposeList extends React.Component {

  state = {
    modal: false,
    name: '',
    id: null,
    action: 'CREATE',
    error: ''
  };

  show = () => this.setState({ modal: true });
  close = () => this.setState({ modal: false, error: '' });

  render = () => {
    document.title = this.props.translation.get("Назначение ТС");
    const { id, name, action, modal } = this.state;
    const currentMutation = getMutation(action);
    const content = MODAL_CONTENT[action];
    return (
      <Query query={TSPURPOSE_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return <TablePlaceholder name={this.props.translation.get("Назначение ТС")} />;
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const purposesToRender = data.allTsPurposes;
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
                          <Table.HeaderCell colSpan='3'>
                            <Header as='h3' floated='left'>{this.props.translation.get("Назначение ТС")}</Header>
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
                                  id: null
                                })
                              }}
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {
                          purposesToRender.map((purpose, index) => {
                            return (
                              <Table.Row key={purpose.id}>
                                <Table.Cell textAlign='center' collapsing>{index + 1}</Table.Cell>
                                <Table.Cell collapsing>
                                  {purpose.name}
                                </Table.Cell>
                                <Table.Cell collapsing textAlign='right'>
                                  <Button.Group>
                                    <Button
                                      icon='edit'
                                      onClick={e => {
                                        this.setState({
                                          action: 'UPDATE',
                                          modal: true,
                                          name: purpose.name,
                                          id: purpose.id
                                        })
                                      }}
                                    />
                                    <Button
                                      icon='trash alternate'
                                      onClick={e => {
                                        this.setState({
                                          action: 'DELETE',
                                          modal: true,
                                          name: purpose.name,
                                          id: purpose.id
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
                    <Input
                      error={Boolean(this.state.error)}
                      focus
                      fluid
                      value={name}
                      placeholder={this.props.translation.get("Назначение ТС")}
                      onChange={e => this.setState({ name: e.target.value, error: '' })}
                    />
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
                    variables={{ id, name }}
                    onCompleted={() => this.props.history.push('/purposes')}
                    refetchQueries={
                      [{
                        query: TSPURPOSE_QUERY
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

export default withTranslation(TsPurposeList);