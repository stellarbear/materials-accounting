import React from 'react';
import UnitForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';

const CREATE_UNIT_MUTATION = gql`
  mutation createUnit($name: String!, $parent: String){
    createUnit(name: $name, parent: $parent) {
      id
      name
      parent{
        id
        name
      }
      fullPath
    }
  }
`;

export default class UnitCreate extends React.Component {
  render = () => {
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/units'>Подразделения</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>Добавить</Breadcrumb.Section>
        </Breadcrumb>
        <Grid>
          <Grid.Row>
            <Grid.Column width={3}></Grid.Column>
            <Grid.Column width={10}>
              <UnitForm
                isNewRecord={true}
                mutation={CREATE_UNIT_MUTATION}
              />
            </Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}