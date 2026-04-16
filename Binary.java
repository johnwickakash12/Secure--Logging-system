public class Binary{
    static class Node{
        int data;
        Node left;
        Node right;
        Node(int data){
            this.data=data;
            this.left=null;
            this.right=null;
        }
    }
    
    
    public static Node buildSampleTree() {
        Node root = new Node(1);
        root.left = new Node(2);
        root.right = new Node(3);
        root.left.left = new Node(4);
        root.left.right = new Node(5);
        root.right.left = new Node(8);
        return root;
    }
    static void printNodes(Node node, int k) {

        if (node == null) {
            return;
        }

    
        if (k == 0) {
            System.out.print(node.data + " ");
            return;  
        }

        
        printNodes(node.left,  k - 1); 
        printNodes(node.right, k - 1); 
    }
    

public static void main(String args[]) {
       Node root = buildSampleTree();
       int[] testK = {0, 1, 2, 3, 4};

        for (int k : testK) {
            System.out.print("Nodes at distance " + k + " from root: ");
            printNodes(root, k);
            System.out.println();   // newline after each test
        }
    

   }
}