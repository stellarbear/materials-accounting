import React from 'react';
import TableForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import authError from '../../helpers/auth_error';
import Loader from '../../components/Loader';
import { withTranslation } from '../../components/TranslationWrapper';

export const UPDATE_TABLE_MUTATION = gql`
  mutation updateTable($id: String!, $name: String!, $items: [TableItemInput!]){
    updateTable(id: $id, name: $name, items: $items) {
      id
      name
      items {
        id
        name
      }
    }
  }
`;

export const TABLE_QUERY = gql`
  query getTable($id: String!) {
    getTable(id: $id) {
      id
      name
      items {
        id
        name
      }
    }
  }
`;

class TableUpdate extends React.Component {
  render = () => {
    const { id } = this.props.match.params;
    return (
      <Query query={TABLE_QUERY} variables={{ id }}>
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
          const table = data.getTable;
          if (!table) return <Redirect to='/404' />
          document.title = table.name;
          return (
            <React.Fragment >
              <Breadcrumb>
                <Breadcrumb.Section><Link to='/tables'>{this.props.translation.get("Табель")}</Link></Breadcrumb.Section>
                <Breadcrumb.Divider icon='right angle' />
                <Breadcrumb.Section active>{table.name}</Breadcrumb.Section>
              </Breadcrumb>
              <Grid>
                <Grid.Row>
                  <Grid.Column width={3}></Grid.Column>
                  <Grid.Column width={10}>
                    <TableForm
                      isNewRecord={false}
                      mutation={UPDATE_TABLE_MUTATION}
                      table={table}
                    />
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

export default withTranslation(TableUpdate)