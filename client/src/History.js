import React from 'react';

const History = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.key}>
          <span className="role">{ item.role === 'user' ? '🙂' : '🤖' }</span>
          { item.content }
        </li>
      ))}
    </ul>
  );
};

export default History;