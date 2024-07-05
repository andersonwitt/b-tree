class BTreeNode {
  constructor(isLeaf = true) {
    this.keys = [];
    this.children = [];
    this.isLeaf = isLeaf;
  }
}

class BTree {
  constructor(t, maxKeys) {
    this.t = t; // Minimum degree
    this.maxKeys = maxKeys; // Maximum number of keys per node
    this.root = new BTreeNode(true);
  }

  insert(key) {
    if (this.root.keys.length === this.maxKeys) {
      let newRoot = new BTreeNode(false);
      newRoot.children.push(this.root);
      this.splitChild(newRoot, 0, this.root);
      this.root = newRoot;
    }
    this._insertNonFull(this.root, key);
  }

  _insertNonFull(node, key) {
    let i = node.keys.length - 1;
    if (node.isLeaf) {
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i];
        i--;
      }
      if (i >= 0 && node.keys[i] === key) {
        // Duplicate key found, do not insert
        return;
      }
      node.keys[i + 1] = key;
    } else {
      while (i >= 0 && key < node.keys[i]) {
        i--;
      }
      if (i >= 0 && node.keys[i] === key) {
        // Duplicate key found, do not insert
        return;
      }
      i++;
      if (node.children[i].keys.length === this.maxKeys) {
        this.splitChild(node, i, node.children[i]);
        if (key > node.keys[i]) {
          i++;
        }
      }
      this._insertNonFull(node.children[i], key);
    }
  }

  splitChild(parent, index, child) {
    let newChild = new BTreeNode(child.isLeaf);
    let mid = Math.floor(child.keys.length / 2);
    let median = child.keys[mid];
    parent.keys.splice(index, 0, median);
    parent.children.splice(index + 1, 0, newChild);

    newChild.keys = child.keys.splice(mid + 1);
    if (!child.isLeaf) {
      newChild.children = child.children.splice(mid + 1);
    }
    child.keys.length = mid;
  }

  remove(key) {
    if (!this.root) return;

    this._remove(this.root, key);

    if (this.root.keys.length === 0) {
      if (!this.root.isLeaf) {
        this.root = this.root.children[0];
      } else {
        this.root = null;
      }
    }
  }

  _remove(node, key) {
    let idx = node.keys.findIndex((k) => k === key);

    if (idx !== -1) {
      if (node.isLeaf) {
        node.keys.splice(idx, 1);
      } else {
        this._removeFromNonLeaf(node, idx);
      }
    } else {
      if (node.isLeaf) return;

      let i = node.keys.findIndex((k) => key < k);
      if (i === -1) i = node.keys.length;

      if (node.children[i].keys.length < this.t) {
        this._fill(node, i);
      }

      if (i > node.keys.length) {
        this._remove(node.children[i - 1], key);
      } else {
        this._remove(node.children[i], key);
      }
    }
  }

  _removeFromNonLeaf(node, idx) {
    let key = node.keys[idx];

    if (node.children[idx].keys.length >= this.t) {
      let pred = this._getPredecessor(node, idx);
      node.keys[idx] = pred;
      this._remove(node.children[idx], pred);
    } else if (node.children[idx + 1].keys.length >= this.t) {
      let succ = this._getSuccessor(node, idx);
      node.keys[idx] = succ;
      this._remove(node.children[idx + 1], succ);
    } else {
      this._merge(node, idx);
      this._remove(node.children[idx], key);
    }
  }

  _getPredecessor(node, idx) {
    let cur = node.children[idx];
    while (!cur.isLeaf) {
      cur = cur.children[cur.keys.length];
    }
    return cur.keys[cur.keys.length - 1];
  }

  _getSuccessor(node, idx) {
    let cur = node.children[idx + 1];
    while (!cur.isLeaf) {
      cur = cur.children[0];
    }
    return cur.keys[0];
  }

  _fill(node, idx) {
    if (idx !== 0 && node.children[idx - 1].keys.length >= this.t) {
      this._borrowFromPrev(node, idx);
    } else if (
      idx !== node.keys.length &&
      node.children[idx + 1].keys.length >= this.t
    ) {
      this._borrowFromNext(node, idx);
    } else {
      if (idx !== node.keys.length) {
        this._merge(node, idx);
      } else {
        this._merge(node, idx - 1);
      }
    }
  }

  _borrowFromPrev(node, idx) {
    let child = node.children[idx];
    let sibling = node.children[idx - 1];

    for (let i = child.keys.length - 1; i >= 0; i--) {
      child.keys[i + 1] = child.keys[i];
    }

    if (!child.isLeaf) {
      for (let i = child.children.length - 1; i >= 0; i--) {
        child.children[i + 1] = child.children[i];
      }
    }

    child.keys[0] = node.keys[idx - 1];

    if (!node.isLeaf) {
      child.children[0] = sibling.children[sibling.children.length - 1];
    }

    node.keys[idx - 1] = sibling.keys[sibling.keys.length - 1];
    sibling.keys.pop();
    sibling.children.pop();
  }

  _borrowFromNext(node, idx) {
    let child = node.children[idx];
    let sibling = node.children[idx + 1];

    child.keys[child.keys.length] = node.keys[idx];

    if (!child.isLeaf) {
      child.children[child.children.length] = sibling.children[0];
    }

    node.keys[idx] = sibling.keys[0];

    for (let i = 1; i < sibling.keys.length; i++) {
      sibling.keys[i - 1] = sibling.keys[i];
    }

    if (!sibling.isLeaf) {
      for (let i = 1; i < sibling.children.length; i++) {
        sibling.children[i - 1] = sibling.children[i];
      }
    }

    sibling.keys.pop();
    sibling.children.pop();
  }

  _merge(node, idx) {
    let child = node.children[idx];
    let sibling = node.children[idx + 1];

    child.keys[this.t - 1] = node.keys[idx];

    for (let i = 0; i < sibling.keys.length; i++) {
      child.keys[i + this.t] = sibling.keys[i];
    }

    if (!child.isLeaf) {
      for (let i = 0; i < sibling.children.length; i++) {
        child.children[i + this.t] = sibling.children[i];
      }
    }

    for (let i = idx + 1; i < node.keys.length; i++) {
      node.keys[i - 1] = node.keys[i];
    }

    for (let i = idx + 2; i < node.children.length; i++) {
      node.children[i - 1] = node.children[i];
    }

    child.keys.length += sibling.keys.length;
    child.children.length += sibling.children.length;

    node.keys.pop();
    node.children.pop();
  }
}

export { BTree, BTreeNode };
