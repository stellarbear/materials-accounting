import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import authError from '../../helpers/auth_error';
import { Redirect, Link } from 'react-router-dom';
import { Header, Grid, Button, Icon, Breadcrumb, Modal, Segment, Message } from 'semantic-ui-react';
import { UNITS_QUERY } from './unit_index';
import Loader from '../../components/Loader';
import { withTranslation } from '../../components/TranslationWrapper';

export const UNIT_QUERY = gql`
    query getUnit($id: String!) {
        getUnit(id: $id) {
            id
            name
            parent {
              id
              name
            }
            fullPath
        }
    }
`;

export const DELETE_UNIT_MUTATION = gql`
  mutation deleteUnit($id: String!){
    deleteUnit(id: $id) {
      id
    }
  }
`;

class UnitShow extends React.Component {
  state = {
    modal: false,
    error: ''
  };

  show = () => this.setState({ modal: true });
  close = () => this.setState({ modal: false, error: '' });

  render = () => {
    const { modal } = this.state;
    const { id } = this.props.match.params;
    document.title = this.props.translation.get("Подразделение");
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/units'>{this.props.translation.get("Подразделение")}</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>Просмотр</Breadcrumb.Section>
        </Breadcrumb>

        <Grid className='unit__single'>
          <Grid.Row >
            <Grid.Column width={3}></Grid.Column>
            <Grid.Column width={10}>
              <Segment color='blue'>
                <Query query={UNIT_QUERY} variables={{ id }}>
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
                    const unit = data.getUnit;
                    if (!unit) return <Redirect to='/404' />
                    return (
                      <React.Fragment>
                        <Header color='blue'>
                          {unit.fullPath.map((name, index, arr) => {
                            if (index < arr.length - 1) {
                              return (
                                <span key={index}>{name}<Icon className='mr0' name='right angle' /></span>
                              );
                            }
                            return (<span key={index}>{name}</span>);
                          })}
                        </Header>
                        <Grid.Row>
                          <Grid.Column>
                            <Link to={`/units/update/${id}`}>
                              <Button color='blue'>
                                <Icon name='edit outline' />
                                Изменить
                            </Button>
                            </Link>
                            <Button color='red' onClick={this.show}>
                              <Icon name='trash alternate outline' />Удалить
                          </Button>
                          </Grid.Column>
                        </Grid.Row>
                        <Modal size='tiny' open={modal} onClose={this.close}>
                          <Modal.Header>Удалить запись</Modal.Header>
                          <Modal.Content>
                            <p>Вы уверены, что хотите удалить запись?</p>
                            <p>{unit.fullPath.slice(0, -1).join(' → ')} → <b>{unit.name}</b></p>
                            {
                              this.state.error &&
                              <Message
                                visible
                                error
                                header='Ошибка при удалении'
                                content={this.state.error}
                              />
                            }
                          </Modal.Content>
                          <Modal.Actions>
                            <Button onClick={this.close}>Отмена</Button>

                            <Mutation
                              mutation={DELETE_UNIT_MUTATION}
                              variables={{ id: unit.id }}
                              onCompleted={() => this.props.history.push('/units')}
                              refetchQueries={
                                [{
                                  query: UNITS_QUERY
                                }]
                              }>
                              {(deleteMutation, { client }) => (
                                <Button color='red' onClick={async () => {
                                  try {
                                    await deleteMutation();
                                    //await client.resetStore();
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
                                }}>
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
              </Segment>
            </Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withTranslation(UnitShow);