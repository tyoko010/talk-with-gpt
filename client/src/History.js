import React from 'react';

const History = ({ items }) => {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.key}>
          {
            item.role === 'user' ? `🙂: ${item.content}` : `🤖: ${item.content}`
          }
        </li>
      ))}
    </ul>
  );
};

export default History;