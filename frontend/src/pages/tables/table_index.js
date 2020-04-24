import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { Redirect, Link } from 'react-router-dom';
import { Grid, Header, Table, Button, Accordion, List, Modal, Icon, Message } from 'semantic-ui-react';
import TablePlaceholder from '../../components/TablePlaceholder';
import authError from '../../helpers/auth_error';
import sortParagraph from '../../helpers/sort_paragraph';
import { withTranslation } from '../../components/TranslationWrapper';


export const TABLES_QUERY = gql`
  {
    allTables {
      id
      name
	    items {
        id
        name
      }
    }
  }
`;

export const DELETE_TABLE_MUTATION = gql`
  mutation deleteTable($id: String!){
    deleteTable(id: $id) {
      id
      status
    }
  }
`;

class TableList extends React.Component {
  state = {
    modal: false,
    error: '',
    deleteName: '',
    deleteId: null
  };

  show = () => this.setState({ modal: true });
  close = () => this.setState({ modal: false, error: '' });

  renderItems = (table) => {
    if (table.items && table.items.length) {
      table.items.sort((a, b) => sortParagraph(a.name, b.name));
      const panels = [];
      panels.push({
        key: 'items',
        title: table.name,
        content: {
          content: (
            <List as='ul'>
              {table.items.map((table, index) => <List.Item key={index} >{table.name}</List.Item>)}
            </List>
          ),
        },
      });
      return (
        <Accordion panels={panels} className='kit' />
      );
    }
  }

  render = () => {
    document.title = this.props.translation.get("Табель");
    const { modal, deleteName, deleteId } = this.state;
    return (
      <Query query={TABLES_QUERY}>
        {({ loading, error, data }) => {
          if (loading) {
            return <TablePlaceholder name={this.props.translation.get("Табель")} />;
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return `Ошибка!: ${error.message}`;
          }
          const tablesToRender = data.allTables;
          tablesToRender.sort((a, b) => {
            return a.name < b.name ? -1 : 1;
          });
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
                          <Table.HeaderCell colSpan='2'>
                            <Header as='h3' floated='left'>{this.props.translation.get("Табель")}</Header>
                            <Button
                              color='teal'
                              floated='right'
                              icon='plus'
                              content='Добавить'
                              size='tiny'
                              as={Link}
                              to='/tables/create'
                            />
                          </Table.HeaderCell>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {
                          tablesToRender.map((table) => {
                            return (
                              <Table.Row key={table.id}>
                                <Table.Cell>
                                  {this.renderItems(table)}
                                </Table.Cell>
                                <Table.Cell collapsing textAlign='right'>
                                  <Button.Group>
                                    <Button
                                      icon='edit'
                                      as={Link}
                                      to={`/tables/update/${table.id}`}
                                    />
                                    <Button
                                      icon='trash alternate'
                                      onClick={e => {
                                        this.setState({
                                          action: 'DELETE',
                                          modal: true,
                                          deleteName: table.name,
                                          deleteId: table.id
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
                <Modal.Header>Вы уверены, что хотите удалить?</Modal.Header>
                <Modal.Content>
                  <p><b>{deleteName}</b></p>
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
                    mutation={DELETE_TABLE_MUTATION}
                    variables={{ id: deleteId }}
                    onCompleted={() => this.props.history.push('/tables')}
                    refetchQueries={
                      [{
                        query: TABLES_QUERY
                      }]
                    }
                  >
                    {mutation => (
                      <Button color='red' onClick={async () => {
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
                        <Icon name='trash alternate outline' />Удалить
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

export default withTranslation(TableList);