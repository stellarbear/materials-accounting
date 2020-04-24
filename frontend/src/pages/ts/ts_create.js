import React from 'react';
import TsForm from './_form';
import { Breadcrumb, Grid } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import { withTranslation } from '../../components/TranslationWrapper';

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
    $isPrivate: Boolean!,
    $isBroken: Boolean!,
    $responsible: String!,
    $comment: String!,
    $complectation: [String!]!
  ) {
    createTS(
      number: $number,
      unit: $unit,
      tsType: $tsType,
      tsPurpose: $tsPurpose,
      infoType: $infoType,
      receiptYear: $receiptYear,
      responsible: $responsible,
      comment: $comment,
      commissioningYear: $commissioningYear,
      decommissionYear: $decommissionYear,
      table: $table,
      tableItem: $tableItem,
      isBroken: $isBroken,
      isPrivate: $isPrivate,
      complectation: $complectation) {
        id
        unit { id name parent { id name } fullPath }
        number
        tsType { id name withComplectation }
        infoType { id name }
        receiptYear
        isBroken
        isPrivate
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
    document.title = 'Добавить';
    return (
      <React.Fragment>
        <Breadcrumb>
          <Breadcrumb.Section><Link to='/'>{this.props.translation.get("Технические средства")}</Link></Breadcrumb.Section>
          <Breadcrumb.Divider icon='right angle' />
          <Breadcrumb.Section active>Добавить</Breadcrumb.Section>
        </Breadcrumb>
        <Grid centered>
          <Grid.Row centered columns={1}>
            <Grid.Column style={{ maxWidth: 800 }}>
              <TsForm isNewRecord={true} mutation={CREATE_TS_MUTATION} />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withTranslation(TsCreate);