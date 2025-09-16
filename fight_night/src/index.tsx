import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
//Note here that typescript isn't a huge fan of including the file extensions. 
//Pretty sure I disabled the check but good practice to remember that it will check different extensions in a specific order.
import BattleSetup from './battleSetup';
import './index.css';

//Typescript doesn't like it if you just grab the root. Gotta have some error handling here to be safe.
const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

const root = createRoot(container);
root.render(
  <StrictMode>
    <BattleSetup/>
  </StrictMode>
);
