;
(function($) {

  var methods = {

    init: function(options) {

      var settings = $.extend({}, $.fn.ca2d.defaults, options);

      return this.filter('canvas').each(function() {

        $this = $(this);
        if(!$this[0].getContext) {
          return true; // continue
        }

        $this.data('ca2d');
        // If the plugin hasn't been initialized yet
        if(!$this.data('ca2d')) {
          var cW = $this.width();
          var cH = $this.height();
          var grid = new Grid(cW, cH, settings.cellSize);
          var ctx = this.getContext('2d');

          $(this).data('ca2d', {
            grid: grid,
            context: ctx,
            settings: settings
          });
        }
        var data = $this.data('ca2d');

      });

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
            row[j] = new Cell(i, j, state);
          }

          cells[i] = row;
        }

        this.cells = cells;

        function Cell(x, y, state) {
          this.x = x;
          this.y = y;
          this.state = state;
          this.nextstate = state;
        } // end of Cell
      } // end of Grid
    },
    // end of init

    step: function() {

      return this.filter('canvas').each(function() {

        $this = $(this);
        if(!$this.data('ca2d')) {
          console.log("need to initialize ca2d");
          return;
        }
        var data = $this.data('ca2d');

        _updState(data.grid, data.settings);
        _print(data.context, data.grid, data.settings);
      });

      function _updState(grid, settings) {
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
      } // end of _updState

      function _print(ctx, grid, settings) {

        for(var i = 0; i < grid.rows; i++) {

          var row = grid.cells[i];
          var y = i * grid.cellSize;
          for(var j = 0; j < grid.cols; j++) {

            var x = j * grid.cellSize;

            var cell = row[j];

            ctx.fillStyle = settings.color(cell.nextstate);
            ctx.fillRect(x, y, grid.cellSize, grid.cellSize);

            // step futher
            cell.state = cell.nextstate;
          }
        }
      } // end of _print
    }, // end of step

    update: function(content) {
      console.log("update");
    }
    
  };

  $.fn.ca2d = function(method) {
    // Method calling logic
    if(methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if(typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.ca2d');
    }
  }; // end of $.fn.ca2d

  $.fn.ca2d.defaults = {
    cellSize: 10,
    color: function(state) {
      return state == 1 ? "#aaaaaa" : "#ffffff";
    },
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
  } // end of $.fn.ca2d.defaults
})(jQuery);