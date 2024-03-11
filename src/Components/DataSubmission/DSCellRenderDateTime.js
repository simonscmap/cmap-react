import React, {Component} from "react";
import * as dayjs from 'dayjs';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(LocalizedFormat)

const timeRe = new RegExp (/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/);

export default class DSCellRenderDateTime extends Component {
  constructor(props) {
    super(props);
    this.props = props;
  }

  render() {
    const value = this.props.value;
    let valueToRender = value;
    if (value || value === 0) {
      if (dayjs (value).isValid ()) {
        const isExpectedFormat = timeRe.test (value);
        if (isExpectedFormat) {
          valueToRender = dayjs.utc (value).format ();
        } else {
          valueToRender = `Invalid Date: ${value}`;
        }
      } else {
        valueToRender = `Invalid Date: ${value}`;
      }
    }
    return `${valueToRender}`;
  }
}
