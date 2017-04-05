import * as React from 'react';

interface Props {
  name: string;
  label: string;
  onBlur?(event): void;
  onChange(event): void;
  placeholder?: string;
  value: string;
  type?: string;
  error: string;
}

export const Input: React.StatelessComponent<Props> = (props) => {
  let className = 'form-group';
  if (props.error) {
    className = `${className} has-error`;
  }
  return (
    // <div className="form-group">
    <div className={className}>
      <label htmlFor={props.name}>{props.label}</label>
      <input
        id={props.name}
        type={props.type}
        name={props.name}
        className="form-control"
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        onBlur={props.onBlur}
      />
      <div className="help-block">{props.error}</div>
    </div>
  );
};

Input.defaultProps = {
  type: 'text',
};
