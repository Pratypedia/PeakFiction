import React from 'react';
import { href } from '../lib/router';

export default function Link({ to, children, ...rest }) {
  return <a href={href(to)} {...rest}>{children}</a>;
}
