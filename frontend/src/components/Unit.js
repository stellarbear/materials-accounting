import React from 'react';
import { List, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class Unit extends React.Component {
  renderChildren = (children) => {
    if (children.length) {
      children.sort((a, b) => {
        return a.name < b.name ? -1 : 1;
      });
      return (
        <List.List>
          {children.map(child => {
            return (
              <List.Item key={child.id}>
                <Icon name='angle right' />
                <List.Content>
                  <Link to={`/units/${child.id}`}>{child.name}</Link>
                  {this.renderChildren(child.children)}
                </List.Content>
              </List.Item>

            );
          })}
        </List.List>
      );
    }
  }
  render = () => {
    const unit = this.props.unit;
    return (
      <List.Item>
        <Link to={`/units/${unit.id}`}><b>{unit.name}</b></Link>
        {this.renderChildren(unit.children)}
      </List.Item>
    );
  }
}

export default Unit;