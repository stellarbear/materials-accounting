import React from 'react';
import TableForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { withTranslation } from '../../components/TranslationWrapper';

export const CREATE_TABLE_MUTATION = gql`
  mutation createTable($name: String!, $items: [TableItemInput!]){
    createTable(name: $name, items: $items) {
      id
      name
      items { name }
    }
  }
`;

class TableCreate extends React.Component {
  render = () => {
    document.title = 'Добавить';
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/tables'>{this.props.translation.get("Табель")}</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>Добавить</Breadcrumb.Section>
        </Breadcrumb>
        <Grid>
          <Grid.Row>
            <Grid.Column width={3}></Grid.Column>
            <Grid.Column width={10}>
              <TableForm
                isNewRecord={true}
                mutation={CREATE_TABLE_MUTATION}
              />
            </Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withTranslation(TableCreate)