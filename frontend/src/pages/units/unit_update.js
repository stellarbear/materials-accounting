import React from 'react';
import UnitForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link, Redirect } from 'react-router-dom';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import authError from '../../helpers/auth_error';
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

export const UPDATE_UNIT_MUTATION = gql`
  mutation updateUnit($id: String!, $name: String!, $parent: String){
    updateUnit(id: $id, name: $name, parent: $parent) {
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

class UnitUpdate extends React.Component {
  render = () => {
    const { id } = this.props.match.params;
    return (
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
          document.title = unit.fullPath.join(' ');
          return (
            <React.Fragment >
              <Breadcrumb>
                <Breadcrumb.Section><Link to='/units'>{this.props.translation.get("Подразделение")}</Link></Breadcrumb.Section>
                <Breadcrumb.Divider icon='right angle' />
                <Breadcrumb.Section active>{unit.fullPath.join(' ')}</Breadcrumb.Section>
              </Breadcrumb>
              <Grid>
                <Grid.Row >
                  <Grid.Column width={3}></Grid.Column>
                  <Grid.Column width={10}>
                    <UnitForm
                      mutation={UPDATE_UNIT_MUTATION}
                      isNewRecord={false}
                      name={unit.name}
                      parent={unit.parent}
                      ommit={unit.id}
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

export default withTranslation(UnitUpdate)