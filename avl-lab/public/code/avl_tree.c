/*
 * AVL Tree in standard C (C99)
 * ----------------------------
 * Convention used everywhere in this file:
 *   height of an empty subtree = 0
 *   height of a leaf node      = 1
 *   balance factor BF(node)    = height(left subtree) - height(right subtree)
 *
 * Duplicate keys are rejected.
 *
 * Build : gcc -std=c99 -Wall -Wextra avl_tree.c -o avl_tree
 * Run   : ./avl_tree        (Windows: avl_tree.exe)
 */
#include <stdio.h>
#include <stdlib.h>

/* ---------- Node structure ---------- */
typedef struct Node {
    int key;
    struct Node *left;
    struct Node *right;
    int height;
} Node;

/* ---------- Helpers: height, max, balance factor ---------- */
int height(const Node *node) {
    return node == NULL ? 0 : node->height;
}

int max(int a, int b) {
    return a > b ? a : b;
}

int getBalance(const Node *node) {
    return node == NULL ? 0 : height(node->left) - height(node->right);
}

void updateHeight(Node *node) {
    node->height = 1 + max(height(node->left), height(node->right));
}

/* ---------- Node creation ---------- */
Node *createNode(int key) {
    Node *node = (Node *)malloc(sizeof(Node));
    if (node == NULL) {
        fprintf(stderr, "Out of memory\n");
        exit(EXIT_FAILURE);
    }
    node->key = key;
    node->left = NULL;
    node->right = NULL;
    node->height = 1; /* a new node is a leaf */
    return node;
}

/* ---------- Rotations ----------
 * Both functions return the NEW root of the rotated subtree.
 * The caller must store that return value in the parent's pointer.
 */

/*       z                y
 *      / \              / \
 *     y   T3    ->    T1   z
 *    / \                  / \
 *  T1   T2              T2   T3
 */
Node *rightRotate(Node *z) {
    Node *y = z->left;   /* y moves up */
    Node *T2 = y->right; /* middle subtree changes parent */

    y->right = z;        /* z moves down to become y's right child */
    z->left = T2;        /* T2 becomes z's left child */

    updateHeight(z);     /* z is now lower, so fix it FIRST */
    updateHeight(y);
    return y;
}

/*     z                    y
 *    / \                  / \
 *  T1   y      ->        z   T3
 *      / \              / \
 *    T2   T3          T1   T2
 */
Node *leftRotate(Node *z) {
    Node *y = z->right;  /* y moves up */
    Node *T2 = y->left;

    y->left = z;
    z->right = T2;

    updateHeight(z);
    updateHeight(y);
    return y;
}

/* ---------- Rebalance ----------
 * Updates the height of `node`, checks its balance factor and rotates if needed.
 * Used by both insertion and deletion. Returns the new root of this subtree.
 */
Node *rebalance(Node *node) {
    updateHeight(node);
    int balance = getBalance(node);

    if (balance > 1) {                       /* left heavy */
        if (getBalance(node->left) < 0) {    /* Left-Right case */
            node->left = leftRotate(node->left);
        }
        return rightRotate(node);            /* Left-Left case (or second half of LR) */
    }
    if (balance < -1) {                      /* right heavy */
        if (getBalance(node->right) > 0) {   /* Right-Left case */
            node->right = rightRotate(node->right);
        }
        return leftRotate(node);             /* Right-Right case (or second half of RL) */
    }
    return node;                             /* already balanced */
}

/* ---------- Insertion ----------
 * `inserted` is set to 1 when a new node is created, 0 for a duplicate.
 */
Node *insert(Node *node, int key, int *inserted) {
    if (node == NULL) {
        *inserted = 1;
        return createNode(key);
    }
    if (key < node->key) {
        node->left = insert(node->left, key, inserted);
    } else if (key > node->key) {
        node->right = insert(node->right, key, inserted);
    } else {
        *inserted = 0; /* duplicate: nothing changes */
        return node;
    }
    return rebalance(node);
}

/* ---------- Minimum-value node (in-order successor helper) ---------- */
Node *minValueNode(Node *node) {
    Node *current = node;
    while (current->left != NULL) {
        current = current->left;
    }
    return current;
}

/* ---------- Deletion ----------
 * `deleted` is set to 1 when the key was found and removed, 0 otherwise.
 */
Node *deleteNode(Node *node, int key, int *deleted) {
    if (node == NULL) {
        *deleted = 0; /* key not in the tree */
        return NULL;
    }
    if (key < node->key) {
        node->left = deleteNode(node->left, key, deleted);
    } else if (key > node->key) {
        node->right = deleteNode(node->right, key, deleted);
    } else {
        *deleted = 1;
        if (node->left == NULL || node->right == NULL) {
            /* Case 1 and 2: zero or one child */
            Node *child = node->left != NULL ? node->left : node->right;
            free(node);
            return child; /* may be NULL (leaf) */
        }
        /* Case 3: two children - copy the in-order successor, then delete it */
        Node *successor = minValueNode(node->right);
        node->key = successor->key;
        int ignored = 0;
        node->right = deleteNode(node->right, successor->key, &ignored);
    }
    return rebalance(node);
}

/* ---------- Search ---------- */
Node *search(Node *node, int key) {
    while (node != NULL) {
        if (key == node->key) return node;
        node = key < node->key ? node->left : node->right;
    }
    return NULL;
}

/* ---------- Depth-first traversals ---------- */
void inorder(const Node *node) {
    if (node == NULL) return;
    inorder(node->left);
    printf("%d ", node->key);
    inorder(node->right);
}

void preorder(const Node *node) {
    if (node == NULL) return;
    printf("%d ", node->key);
    preorder(node->left);
    preorder(node->right);
}

void postorder(const Node *node) {
    if (node == NULL) return;
    postorder(node->left);
    postorder(node->right);
    printf("%d ", node->key);
}

/* ---------- Queue (array based) for level-order traversal ---------- */
typedef struct {
    Node **items;
    int front;
    int rear;
    int capacity;
} Queue;

Queue *createQueue(int capacity) {
    Queue *q = (Queue *)malloc(sizeof(Queue));
    if (q == NULL) { fprintf(stderr, "Out of memory\n"); exit(EXIT_FAILURE); }
    q->items = (Node **)malloc((size_t)capacity * sizeof(Node *));
    if (q->items == NULL) { fprintf(stderr, "Out of memory\n"); exit(EXIT_FAILURE); }
    q->front = 0;
    q->rear = 0;
    q->capacity = capacity;
    return q;
}

int isQueueEmpty(const Queue *q) { return q->front == q->rear; }
void enqueue(Queue *q, Node *node) { q->items[q->rear++] = node; }
Node *dequeue(Queue *q) { return q->items[q->front++]; }

void freeQueue(Queue *q) {
    free(q->items);
    free(q);
}

int countNodes(const Node *node) {
    return node == NULL ? 0 : 1 + countNodes(node->left) + countNodes(node->right);
}

void levelOrder(Node *root) {
    if (root == NULL) return;
    /* Every node is enqueued exactly once, so capacity = number of nodes. */
    Queue *q = createQueue(countNodes(root));
    enqueue(q, root);
    while (!isQueueEmpty(q)) {
        Node *current = dequeue(q);
        printf("%d ", current->key);
        if (current->left != NULL) enqueue(q, current->left);
        if (current->right != NULL) enqueue(q, current->right);
    }
    freeQueue(q);
}

/* ---------- Cleanup: free every node (post-order) ---------- */
Node *freeTree(Node *node) {
    if (node == NULL) return NULL;
    freeTree(node->left);
    freeTree(node->right);
    free(node);
    return NULL;
}

/* ---------- Pretty printer (sideways tree) ---------- */
void printTree(const Node *node, int depth) {
    if (node == NULL) return;
    printTree(node->right, depth + 1);
    for (int i = 0; i < depth; i++) printf("      ");
    printf("%d(h=%d,bf=%d)\n", node->key, node->height, getBalance(node));
    printTree(node->left, depth + 1);
}

/* ---------- Menu-driven main ---------- */
static int readInt(const char *prompt, int *out) {
    printf("%s", prompt);
    if (scanf("%d", out) != 1) {
        int c;
        while ((c = getchar()) != '\n' && c != EOF) { /* discard bad input */ }
        return 0;
    }
    return 1;
}

int main(void) {
    Node *root = NULL;
    int choice = 0;
    int value = 0;

    for (;;) {
        printf("\n===== AVL TREE MENU =====\n");
        printf("1. Insert\n2. Delete\n3. Search\n4. In-order\n5. Pre-order\n");
        printf("6. Post-order\n7. Level-order\n8. Display tree\n9. Height\n0. Exit\n");
        if (!readInt("Enter your choice: ", &choice)) {
            if (feof(stdin)) break;
            printf("Please enter a number from the menu.\n");
            continue;
        }

        switch (choice) {
        case 1: {
            if (!readInt("Value to insert: ", &value)) { printf("Invalid number.\n"); break; }
            int inserted = 0;
            root = insert(root, value, &inserted);
            printf(inserted ? "Inserted %d.\n" : "%d already exists - duplicates are not allowed.\n", value);
            break;
        }
        case 2: {
            if (root == NULL) { printf("Tree is empty.\n"); break; }
            if (!readInt("Value to delete: ", &value)) { printf("Invalid number.\n"); break; }
            int deleted = 0;
            root = deleteNode(root, value, &deleted);
            printf(deleted ? "Deleted %d.\n" : "%d was not found.\n", value);
            break;
        }
        case 3:
            if (!readInt("Value to search: ", &value)) { printf("Invalid number.\n"); break; }
            printf(search(root, value) != NULL ? "%d found.\n" : "%d not found.\n", value);
            break;
        case 4: printf("In-order: ");    inorder(root);    printf("\n"); break;
        case 5: printf("Pre-order: ");   preorder(root);   printf("\n"); break;
        case 6: printf("Post-order: ");  postorder(root);  printf("\n"); break;
        case 7: printf("Level-order: "); levelOrder(root); printf("\n"); break;
        case 8:
            if (root == NULL) printf("Tree is empty.\n");
            else printTree(root, 0);
            break;
        case 9: printf("Tree height: %d\n", height(root)); break;
        case 0:
            root = freeTree(root);
            printf("Memory released. Goodbye!\n");
            return 0;
        default:
            printf("Invalid choice.\n");
        }
    }
    root = freeTree(root); /* reached when input ends (EOF) */
    return 0;
}
