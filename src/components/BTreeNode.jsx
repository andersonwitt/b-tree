/* eslint-disable react/prop-types */
import { useState } from "react";
import "../index.css";

const BTreeNodeComponent = ({ node }) => {
  return (
    <>
      {!!node?.keys?.length && (
        <div className="btree-node">
          <div className="keys">
            {node?.keys?.map((key, index) => (
              <span key={index} className="key">
                {key}
              </span>
            ))}
          </div>
          <div className="children">
            {node?.children?.map((child, index) => (
              <BTreeNodeComponent key={index} node={child} />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

const BTreeComponent = ({ btree }) => {
  const [tree, setTree] = useState(btree);
  const [inputValue, setInputValue] = useState("");

  const handleInsert = () => {
    if (inputValue !== "") {
      tree.insert(parseInt(inputValue));
      setTree(Object.assign(Object.create(Object.getPrototypeOf(tree)), tree));
      setInputValue("");
    }
  };

  const handleRemove = () => {
    if (inputValue !== "") {
      tree.remove(parseInt(inputValue));
      setTree(Object.assign(Object.create(Object.getPrototypeOf(tree)), tree));
      setInputValue("");
    }
  };

  return (
    <div className="btree-container">
      <div className="btree-fields">
        <input
          placeholder="Valor"
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleInsert}>Inserir</button>
        <button onClick={handleRemove}>Remover</button>
      </div>
      <div className="btree">
        <BTreeNodeComponent node={tree.root} />
      </div>
    </div>
  );
};

export default BTreeComponent;
