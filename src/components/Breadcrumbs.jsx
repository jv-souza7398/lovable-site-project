import React from 'react';
import { Link } from 'react-router-dom';
import classes from './Breadcrumbs.module.css';

const Breadcrumbs = ({ paths }) => {
  return (
    <nav className={classes.breadcrumbs}>
      {paths.map((path, index) => (
        <span key={index}>
          {index > 0 && ' > '}
          {index < paths.length - 1 ? (
            <Link to={path.url}>{path.label}</Link>
          ) : (
            <span>{path.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
