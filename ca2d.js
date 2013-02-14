;
(function($) {

  $.fn.ca2d = function(options) {

    var defaults = {
      cellSize: 10,
      aliveColor: "#aaaaaa",
      deadColor: "#ffffff",
      fieldColor: "#ffffff",
      rule: function(selfstate, neighborStates) {

        var otherTotal = 0;
        jQuery.each(neighborStates, function(idx, value) {
          otherTotal += value;
        });

        var nextState = selfstate;
        if(selfstate == 1) {
          if(otherTotal <= 1 || otherTotal >= 4) {
            nextState = 0;
          }
        } else {
          if(otherTotal == 3) {
            nextState = 1;
          }
        }
        return nextState;

      },
      mutation: true
    }

    // merge settings
    var settings = $.extend({}, defaults, options);

    return this.filter('canvas').each(function() {
      $this = $(this);
      if(!$this[0].getContext) {
        return true; // continue
      }

      var cW = $this.width();
      var cH = $this.height();
      var grid = new Grid(cW, cH, settings.cellSize);
      var ctx = this.getContext('2d');

      step(ctx, grid);

      // determine mobile / pc
      var agent = navigator.userAgent;
      if(agent.search(/iPhone/) != -1 || agent.search(/iPad/) != -1) {
        $this.on("touchstart touchmove touchend", function(e){
          e.preventDefault();
          step(ctx, grid);
        });
      } else {    
        $this.on("mousemove", function(e){
          step(ctx, grid);
        });
      }
    });

    function step(ctx, grid) {
      updState(grid);
      print(ctx, grid);
    }

    function updState(grid) {
      // A B C
      // D E F
      // H I J
      for(var i = 0; i < grid.rows; i++) {

        var row = grid.cells[i];

        for(var j = 0; j < grid.cols; j++) {

          var cell = row[j]; // cell_E
          var cell_A = grid.cells[i - 1 < 0 ? grid.rows - 1 : i - 1][j - 1 < 0 ? grid.cols - 1 : j - 1];
          var cell_B = grid.cells[i - 1 < 0 ? grid.rows - 1 : i - 1][j];
          var cell_C = grid.cells[i - 1 < 0 ? grid.rows - 1 : i - 1][j + 1 >= grid.cols ? 0 : j + 1];

          var cell_D = grid.cells[i][j - 1 < 0 ? grid.cols - 1 : j - 1];
          var cell_F = grid.cells[i][j + 1 >= grid.cols ? 0 : j + 1];

          var cell_H = grid.cells[i + 1 >= grid.rows ? 0 : i + 1][j - 1 < 0 ? grid.cols - 1 : j - 1];
          var cell_I = grid.cells[i + 1 >= grid.rows ? 0 : i + 1][j];
          var cell_J = grid.cells[i + 1 >= grid.rows ? 0 : i + 1][j + 1 >= grid.cols ? 0 : j + 1];

          cell.nextstate = settings.rule(cell.state, [cell_A.state, cell_B.state, cell_C.state, cell_D.state, cell_F.state, cell_H.state, cell_I.state, cell_J.state]);

        } // end of for col
      } // end of for row
    } // end of updState

    function print(ctx, grid) {

      for(var i = 0; i < grid.rows; i++) {

        var row = grid.cells[i];
        var y = i * grid.cellSize;
        for(var j = 0; j < grid.cols; j++) {

          var x = j * grid.cellSize;

          var cell = row[j];

          if(cell.nextstate == 1) {
            ctx.fillStyle = cell.color;
            ctx.fillRect(x, y, grid.cellSize, grid.cellSize);
          } else {
            ctx.clearRect(x, y, grid.cellSize, grid.cellSize);
          }

          cell.state = cell.nextstate;
        }
      }
    } // end of print

    function Grid(x, y, cellSize) {

      this.x = x;
      this.y = y;
      this.cellSize = cellSize;
      this.rows = Math.floor(y / cellSize);;
      this.cols = Math.floor(x / cellSize);;

      var cells = new Array(this.rows);

      for(var i = 0; i < this.rows; i++) {

        var row = new Array(this.cols);

        for(var j = 0; j < this.cols; j++) {

          var state = Math.round(Math.random()); // 0 or 1
          var color = settings.aliveColor;

          row[j] = new Cell(i, j, color, state);
        }

        cells[i] = row;
      }

      this.cells = cells;

      function Cell(x, y, color, state) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.state = state;
        this.nextstate = state;
        this.extPeriod = 0;
      } // end of Cell

    } // end of grid
    
  }; // end of $.fn.ca2d
})(jQuery);