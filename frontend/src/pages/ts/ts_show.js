import React from 'react';
import gql from 'graphql-tag';
import { Query, Mutation } from 'react-apollo';
import Loader from '../../components/Loader';
import authError from '../../helpers/auth_error';
import { Breadcrumb, Modal, Icon, Button, Grid } from 'semantic-ui-react';
import { Redirect, Link } from 'react-router-dom';
import Ts from '../../components/Ts';
import { DELETE_TS_MUTATION } from './ts_index';

export const TS_QUERY = gql`
  query getTS($id: String!) {
    getTS(id: $id) {
      id
      unit { id name parent { id name } fullPath }
      number
      tsType { id name withComplectation }
      infoType { id name }
      receiptYear
      isBroken
      responsible
      comment
      commissioningYear
      decommissionYear
      tsPurpose { id name }
      table { id name }
      tableItem { id name }
      complectation {
        id
        name
      }
    }
  }
`;

class TsShow extends React.Component {

  state = {
    modal: false,
    id: null,
    name: ''
  }

  close = () => this.setState({ modal: false });

  render = () => {
    const { id } = this.props.match.params;
    return (
      <Query query={TS_QUERY} variables={{ id }}>
        {({ loading, error, data }) => {
          if (loading) {
            return (
              <Loader />
            );
          };
          if (error) {
            if (authError(error)) return <Redirect to='/login' />
            return <Redirect to='/404' />;
          }
          const ts = data.getTS;
          if (!ts) return <Redirect to='/404' />
          document.title = `${ts.tsType.name} №${ts.number}`;
          return (
            <React.Fragment>
              <Breadcrumb>
                <Breadcrumb.Section><Link to='/'>Технические средства</Link></Breadcrumb.Section>
                <Breadcrumb.Divider icon='right angle' />
                <Breadcrumb.Section active>{`${ts.tsType.name} №${ts.number}`}</Breadcrumb.Section>
              </Breadcrumb>
              <Grid>
                <Grid.Row >
                  <Grid.Column width={3}></Grid.Column>
                  <Grid.Column width={10}>
                    <Ts ts={ts} complectation={true} handleDelete={() => {
                      this.setState({
                        modal: true,
                        id: ts.id,
                        name: `${ts.tsType.name} №${ts.number}`
                      });
                    }} />
                  </Grid.Column>
                </Grid.Row>
              </Grid>

              <Modal size='tiny' open={this.state.modal} onClose={this.close}>
                <Modal.Header>Удалить ТС</Modal.Header>
                <Modal.Content>
                  <p>Вы уверены, что хотите удалить ТС?</p>
                  <p><b>{this.state.name}</b></p>
                </Modal.Content>
                <Modal.Actions>
                  <Button onClick={this.close}>Отмена</Button>
                  <Mutation
                    mutation={DELETE_TS_MUTATION}
                    variables={{ id: this.state.id }}
                  >
                    {(deleteMutation, { client }) => (
                      <Button color='red' onClick={async () => {
                        deleteMutation();
                        this.setState({
                          modal: false,
                          id: null,
                          name: ''
                        });
                        await client.resetStore();
                        this.props.history.push('/');
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
    );
  }
}

export default TsShow;