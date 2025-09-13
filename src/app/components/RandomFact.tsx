'use client';
import React from 'react';
import randomFacts from '../lib/didyouknowfacts.json';

// @todo fix facts reloading every time
const i = Math.floor(Math.random() * randomFacts.length);
const fact = randomFacts[i].text;

const Fact = React.memo(
  function SidebarIcon() {
    return <h2 className="text-shadow text-asparagus text-xl font-semibold">{fact}</h2>;
  },

  () => true,
);

export default Fact;
