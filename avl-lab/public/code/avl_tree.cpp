// AVL Tree in standard C++ (C++11 or newer)
// ------------------------------------------
// Convention used everywhere in this file:
//   height of an empty subtree = 0
//   height of a leaf node      = 1
//   balance factor BF(node)    = height(left subtree) - height(right subtree)
//
// Duplicate keys are rejected.
//
// Build : g++ -std=c++11 -Wall -Wextra avl_tree.cpp -o avl_tree
// Run   : ./avl_tree        (Windows: avl_tree.exe)
#include <algorithm>
#include <iostream>
#include <limits>
#include <queue>
#include <string>

struct Node {
    int key;
    Node *left;
    Node *right;
    int height;

    explicit Node(int k) : key(k), left(nullptr), right(nullptr), height(1) {}
};

class AVLTree {
public:
    AVLTree() : root_(nullptr) {}
    ~AVLTree() { destroy(root_); }

    // The tree owns raw pointers, so copying is disabled to avoid double deletes.
    AVLTree(const AVLTree &) = delete;
    AVLTree &operator=(const AVLTree &) = delete;

    // Returns false for duplicates.
    bool insert(int key) {
        bool inserted = false;
        root_ = insert(root_, key, inserted);
        return inserted;
    }

    // Returns false when the key is missing.
    bool remove(int key) {
        bool removed = false;
        root_ = remove(root_, key, removed);
        return removed;
    }

    bool search(int key) const {
        const Node *cur = root_;
        while (cur != nullptr) {
            if (key == cur->key) return true;
            cur = key < cur->key ? cur->left : cur->right;
        }
        return false;
    }

    bool empty() const { return root_ == nullptr; }
    int treeHeight() const { return height(root_); }

    void inorder() const { inorder(root_); std::cout << '\n'; }
    void preorder() const { preorder(root_); std::cout << '\n'; }
    void postorder() const { postorder(root_); std::cout << '\n'; }

    void levelOrder() const {
        if (root_ == nullptr) { std::cout << '\n'; return; }
        std::queue<const Node *> q;
        q.push(root_);
        while (!q.empty()) {
            const Node *current = q.front();
            q.pop();
            std::cout << current->key << ' ';
            if (current->left) q.push(current->left);
            if (current->right) q.push(current->right);
        }
        std::cout << '\n';
    }

    void display() const { display(root_, 0); }

private:
    Node *root_;

    // ----- helpers -----
    static int height(const Node *node) { return node ? node->height : 0; }
    static int getBalance(const Node *node) {
        return node ? height(node->left) - height(node->right) : 0;
    }
    static void updateHeight(Node *node) {
        node->height = 1 + std::max(height(node->left), height(node->right));
    }

    // ----- rotations: return the new root of the rotated subtree -----
    static Node *rightRotate(Node *z) {
        Node *y = z->left;
        Node *T2 = y->right;
        y->right = z;
        z->left = T2;
        updateHeight(z);  // z is lower now: fix it first
        updateHeight(y);
        return y;
    }

    static Node *leftRotate(Node *z) {
        Node *y = z->right;
        Node *T2 = y->left;
        y->left = z;
        z->right = T2;
        updateHeight(z);
        updateHeight(y);
        return y;
    }

    static Node *rebalance(Node *node) {
        updateHeight(node);
        int balance = getBalance(node);
        if (balance > 1) {                        // left heavy
            if (getBalance(node->left) < 0)       // Left-Right case
                node->left = leftRotate(node->left);
            return rightRotate(node);             // Left-Left case
        }
        if (balance < -1) {                       // right heavy
            if (getBalance(node->right) > 0)      // Right-Left case
                node->right = rightRotate(node->right);
            return leftRotate(node);              // Right-Right case
        }
        return node;
    }

    static Node *minValueNode(Node *node) {
        while (node->left != nullptr) node = node->left;
        return node;
    }

    // ----- recursive insert / remove -----
    static Node *insert(Node *node, int key, bool &inserted) {
        if (node == nullptr) {
            inserted = true;
            return new Node(key);
        }
        if (key < node->key)
            node->left = insert(node->left, key, inserted);
        else if (key > node->key)
            node->right = insert(node->right, key, inserted);
        else
            return node;  // duplicate: inserted stays false
        return rebalance(node);
    }

    static Node *remove(Node *node, int key, bool &removed) {
        if (node == nullptr) return nullptr;  // not found
        if (key < node->key) {
            node->left = remove(node->left, key, removed);
        } else if (key > node->key) {
            node->right = remove(node->right, key, removed);
        } else {
            removed = true;
            if (node->left == nullptr || node->right == nullptr) {
                Node *child = node->left ? node->left : node->right;
                delete node;
                return child;  // may be nullptr
            }
            Node *successor = minValueNode(node->right);
            node->key = successor->key;
            bool ignored = false;
            node->right = remove(node->right, successor->key, ignored);
        }
        return rebalance(node);
    }

    // ----- traversals -----
    static void inorder(const Node *node) {
        if (!node) return;
        inorder(node->left);
        std::cout << node->key << ' ';
        inorder(node->right);
    }
    static void preorder(const Node *node) {
        if (!node) return;
        std::cout << node->key << ' ';
        preorder(node->left);
        preorder(node->right);
    }
    static void postorder(const Node *node) {
        if (!node) return;
        postorder(node->left);
        postorder(node->right);
        std::cout << node->key << ' ';
    }

    // ----- memory management: delete every node (post-order) -----
    static void destroy(Node *node) {
        if (!node) return;
        destroy(node->left);
        destroy(node->right);
        delete node;
    }

    static void display(const Node *node, int depth) {
        if (!node) return;
        display(node->right, depth + 1);
        std::cout << std::string(static_cast<std::string::size_type>(depth) * 6, ' ')
                  << node->key << "(h=" << node->height << ",bf=" << getBalance(node) << ")\n";
        display(node->left, depth + 1);
    }
};

static bool readInt(const char *prompt, int &out) {
    std::cout << prompt;
    if (std::cin >> out) return true;
    if (std::cin.eof()) return false;
    std::cin.clear();
    std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
    std::cout << "Invalid number.\n";
    return false;
}

int main() {
    AVLTree tree;
    for (;;) {
        std::cout << "\n===== AVL TREE MENU =====\n"
                  << "1. Insert\n2. Delete\n3. Search\n4. In-order\n5. Pre-order\n"
                  << "6. Post-order\n7. Level-order\n8. Display tree\n9. Height\n0. Exit\n";
        int choice = 0;
        if (!readInt("Enter your choice: ", choice)) {
            if (std::cin.eof()) break;
            continue;
        }
        int value = 0;
        switch (choice) {
        case 1:
            if (!readInt("Value to insert: ", value)) break;
            if (tree.insert(value)) std::cout << "Inserted " << value << ".\n";
            else std::cout << value << " already exists - duplicates are not allowed.\n";
            break;
        case 2:
            if (tree.empty()) { std::cout << "Tree is empty.\n"; break; }
            if (!readInt("Value to delete: ", value)) break;
            if (tree.remove(value)) std::cout << "Deleted " << value << ".\n";
            else std::cout << value << " was not found.\n";
            break;
        case 3:
            if (!readInt("Value to search: ", value)) break;
            std::cout << value << (tree.search(value) ? " found.\n" : " not found.\n");
            break;
        case 4: std::cout << "In-order: ";    tree.inorder();    break;
        case 5: std::cout << "Pre-order: ";   tree.preorder();   break;
        case 6: std::cout << "Post-order: ";  tree.postorder();  break;
        case 7: std::cout << "Level-order: "; tree.levelOrder(); break;
        case 8:
            if (tree.empty()) std::cout << "Tree is empty.\n";
            else tree.display();
            break;
        case 9: std::cout << "Tree height: " << tree.treeHeight() << '\n'; break;
        case 0: std::cout << "Memory released. Goodbye!\n"; return 0;  // ~AVLTree frees the nodes
        default: std::cout << "Invalid choice.\n";
        }
    }
    return 0;
}
