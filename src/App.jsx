import { useState } from "react";
import BTreeComponent from "./components/BTreeNode";
import { BTree } from "./utils/BTree";

const App = () => {
  const [btree, setBTree] = useState(null);
  const [maxKeys, setMaxKeys] = useState(4);
  const [initialized, setInitialized] = useState(false);

  const handleInitialize = () => {
    setBTree(new BTree(2, maxKeys));
    setInitialized(true);
  };

  return (
    <div className="App">
      <h1>BTree Visualization</h1>
      {!initialized ? (
        <div className="btree-fields">
          <label>
            chave máxima
            <input
              type="number"
              value={maxKeys}
              onChange={(e) => setMaxKeys(parseInt(e.target.value))}
              min="2"
            />
          </label>
          <button onClick={handleInitialize}>Inicializar Arvore B</button>
        </div>
      ) : (
        <BTreeComponent btree={btree} />
      )}
    </div>
  );
};

export default App;
