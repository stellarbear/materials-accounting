import React from 'react';
import { Input } from 'semantic-ui-react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
const RcRange = Slider.createSliderWithTooltip(Slider.Range);

class Range extends React.Component {
  state = {
    min: 1932,
    max: new Date().getFullYear(),
    marks: {
      min: 1932,
      max: new Date().getFullYear()
    }
  }

  handleChange = (e) => {
    if (this.props.onChange) {
      this.props.onChange(e);
    }
    const [min, max] = e;
    this.setState({
      min,
      max,
    });
  }

  componentDidMount = () => {
    const { min, max } = this.props;
    this.setState({
      min,
      max,
      marks: {
        min,
        max
      }
    });
  }

  render = () => {
    const { marks, min, max } = this.state;
    return (
      <RcRange
        min={parseInt(marks.min)}
        max={parseInt(marks.max)}
        dots={Math.abs(parseInt(marks.max) - parseInt(marks.min)) < 11}
        marks={{
          [marks.min]: <Input
            type='number'
            min={marks.min}
            max={marks.max}
            value={min}
            size='mini'
            onChange={(e, { value }) => {
              this.handleChange([parseInt(value), max].sort());
            }}
          />,
          [marks.max]: <Input
            type='number'
            min={marks.min}
            max={marks.max}
            value={max}
            size='mini'
            onChange={(e, { value }) => {
              this.handleChange([min, parseInt(value)].sort());
            }}
          />
        }}
        value={[parseInt(min), parseInt(max)]}
        onChange={this.handleChange}
      />
    );
  }
}

export default Range;