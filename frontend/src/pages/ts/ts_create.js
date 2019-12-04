import React from 'react';
import TsForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';

export const CREATE_TS_MUTATION = gql`
  mutation createTS(
    $number: String!,
    $unit: String!,
    $tsType: String!,
    $tsPurpose: String!,
    $infoType: String!,
    $receiptYear: String!,
    $commissioningYear: String,
    $decommissionYear: String,
    $table: String!,
    $tableItem: String!,
    $isBroken: Boolean!,
    $complectation: [String!]!
  ) {
    createTS(
      number: $number,
      unit: $unit,
      tsType: $tsType,
      tsPurpose: $tsPurpose,
      infoType: $infoType,
      receiptYear: $receiptYear,
      commissioningYear: $commissioningYear,
      decommissionYear: $decommissionYear,
      table: $table,
      tableItem: $tableItem,
      isBroken: $isBroken,
      complectation: $complectation) {
        id
        unit { id name parent { id name } fullPath }
        number
        tsType { id name withComplectation }
        infoType { id name }
        receiptYear
        isBroken
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

class TsCreate extends React.Component {
  render = () => {
    document.title = 'Добавить ТС';
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/'>Технические средства</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>Добавить</Breadcrumb.Section>
        </Breadcrumb>
        <Grid>
          <Grid.Row >
            <Grid.Column width={3}></Grid.Column>
            <Grid.Column width={10}>
              <TsForm isNewRecord={true} mutation={CREATE_TS_MUTATION} />
            </Grid.Column>
            <Grid.Column></Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default TsCreate;