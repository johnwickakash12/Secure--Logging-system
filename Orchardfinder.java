public class Orchardfinder {

    static final int[][] dirs = {
        {-1, -1}, {-1, 0}, {-1, 1},
        { 0, -1},          { 0, 1},
        { 1, -1}, { 1, 0}, { 1, 1}
    };

    public static void main(String[] args) {

        char[][] field = {
            {'O', 'T', 'O', 'O'},
            {'O', 'T', 'O', 'T'},
            {'T', 'T', 'O', 'T'},
            {'O', 'T', 'O', 'T'}
        };

        int[] orchards = getOrchardSizes(field);

        System.out.println("Found " + orchards.length + " orchard(s):");
        for (int i = 0; i < orchards.length; i++) {
            System.out.println("  Orchard #" + (i + 1) + " -> " + orchards[i] + " trees");
        }
    }

    static int[] getOrchardSizes(char[][] field) {

        if (field == null || field.length == 0)
            return new int[0];

        int rows = field.length;
        int cols = field[0].length;
        boolean[][] seen = new boolean[rows][cols];

        // first pass — just figure out how many orchards there are
        // so we know what size array to create
        int count = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (field[r][c] == 'T' && !seen[r][c]) {
                    countTrees(field, seen, r, c, rows, cols);
                    count++;
                }
            }
        }

        // reset seen so we can do the second pass properly
        seen = new boolean[rows][cols];

        // second pass — same thing, but this time store the sizes
        int[] sizes = new int[count];
        int idx = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (field[r][c] == 'T' && !seen[r][c]) {
                    sizes[idx++] = countTrees(field, seen, r, c, rows, cols);
                }
            }
        }

        return sizes;
    }

    static int countTrees(char[][] field, boolean[][] seen, int r, int c, int rows, int cols) {

        seen[r][c] = true;
        int total = 1;

        for (int[] d : dirs) {
            int nextRow = r + d[0];
            int nextCol = c + d[1];

            if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols)
                continue;

            if (field[nextRow][nextCol] != 'T' || seen[nextRow][nextCol])
                continue;

            total += countTrees(field, seen, nextRow, nextCol, rows, cols);
        }

        return total;
    }
}