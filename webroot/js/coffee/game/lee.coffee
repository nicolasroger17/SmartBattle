class Position
    constructor: (@row, @col)->

    getLeft: ->
        return new Position(@row, @col - 1)

    getRight: ->
        return new Position(@row, @col + 1)

    getBottom: ->
        return new Position(@row + 1, @col)

    getUp: ->
        return new Position(@row - 1, @col)

class BreadthFirstGrid

    constructor: (arr, h, w) ->
        @solution = this.getPath(arr, h, w);

    getNeighbours: (p, row, col)->
        neighbours = new Array()

        posLeft = p.getLeft();
        if (posLeft.row >= 0 && posLeft.row < row && posLeft.col >= 0 && posLeft.col < col)
            neighbours.push(posLeft);
        
        posRight = p.getRight();
        if (posRight.row >= 0 && posRight.row < row && posRight.col >= 0 && posRight.col < col)
            neighbours.push(posRight);
        
        posUp = p.getUp();
        if (posUp.row >= 0 && posUp.row < row && posUp.col >= 0 && posUp.col < col)
            neighbours.push(posUp);
        
        posDown = p.getBottom();
        if (posDown.row >= 0 && posDown.row < row && posDown.col >= 0 && posDown.col < col)
            neighbours.push(posDown);

        return neighbours;

    getPath: (arr, row, col) ->
        grid = Array();
        i = 0;
        while i < row
            j = 0;
            p = new Array();
            while j < col
                p.push(0)
                j++
            grid.push(p)
            i++

        queue = new PriorityQueue((a, b) -> 
                if (grid[a.row][a.col] < grid[b.row][b.col])
                    return -1;
                else if (grid[a.row][a.col] > grid[b.row][b.col])
                    return 1;
                else
                    return 0;
        );

        i = 0
        while i < arr.length
            j = 0
            while j < arr[i].length
                if (arr[i][j] == 'start')
                    queue.enq(new Position(i, j));
                    grid[i][j] = 0;
                j++
            i++

        console.log(queue.peek());

        while (!queue.isEmpty())
            
            current = queue.deq();
            neighbours = this.getNeighbours(current, row, col);

            for neighbour in neighbours
                if (arr[neighbour.row][neighbour.col] == 'void' && grid[neighbour.row][neighbour.col] == 0)  
                    grid[neighbour.row][neighbour.col] = grid[current.row][current.col] + 1;
                    queue.enq(neighbour);

                if (arr[neighbour.row][neighbour.col] == 'end')
                    return grid;

        return grid;