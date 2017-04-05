import * as React from 'react';

interface Props {
  name: string;
  label: string;
  onChange(event): void;
  placeholder?: string;
  value: string;
  type?: string;
}

export const Input: React.StatelessComponent<Props> = (props) => {
  return (
    <div className="form-group">
      <label htmlFor={props.name}>{props.label}</label>
      <input
        id={props.name}
        type={props.type}
        name={props.name}
        className="form-control"
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    </div>
  );
};

Input.defaultProps = {
  type: 'text',
};
