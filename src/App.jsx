import BTreeComponent from './components/BTreeNode';
import { BTree } from './utils/BTree';

const btree = new BTree(2, 4);

const App = () => {
  return (
    <div className="App">
      <h1>BTree Visualization</h1>
      <BTreeComponent btree={btree} />
    </div>
  );
};

export default App;
