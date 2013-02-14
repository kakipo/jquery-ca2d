;
(function($) {

  $.fn.ca2d = function(options) {

    var defaults = {
      cellSize: 10,
      aliveColor: "#aaaaaa",
      deadColor: "#ffffff",
      fieldColor: "#ffffff",
      rule: function(selfStatus, neighborStatuses) {

        var otherTotal = 0;
        jQuery.each(neighborStatuses, function(idx, value) {
          otherTotal += value;
        });

        var nextState = selfStatus;
        if(selfStatus == 1) {
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

      var cvs = new Canvas(cW, cH, settings.cellSize);
      upd_status(cvs, settings.rule);

      var ctx = this.getContext('2d');
      print(ctx, cvs);

      // determine mobile / pc
      var agent = navigator.userAgent;
      if(agent.search(/iPhone/) != -1 || agent.search(/iPad/) != -1) {
        this.ontouchstart = function(e) {
          e.preventDefault();
          upd_status(cvs, settings.rule);
          print(ctx, cvs);
        }
        this.ontouchmove = function(e) {
          e.preventDefault();
          upd_status(cvs, settings.rule);
          print(ctx, cvs);
        }
        this.ontouchend = function(e) {
          e.preventDefault();
          upd_status(cvs, settings.rule);
          print(ctx, cvs);
        }
      } else {
        this.onmousemove = function(e) {
          upd_status(cvs, settings.rule);
          print(ctx, cvs);
        }
      }
    });


    function upd_status(cvs, rule) {
      // A B C
      // D E F
      // H I J
      for(var i = 0; i < cvs.rows; i++) {

        var row = cvs.cells[i];

        for(var j = 0; j < cvs.cols; j++) {

          var cell = row[j]; // cell_E
          var cell_A = cvs.cells[i - 1 < 0 ? cvs.rows - 1 : i - 1][j - 1 < 0 ? cvs.cols - 1 : j - 1];
          var cell_B = cvs.cells[i - 1 < 0 ? cvs.rows - 1 : i - 1][j];
          var cell_C = cvs.cells[i - 1 < 0 ? cvs.rows - 1 : i - 1][j + 1 >= cvs.cols ? 0 : j + 1];

          var cell_D = cvs.cells[i][j - 1 < 0 ? cvs.cols - 1 : j - 1];
          var cell_F = cvs.cells[i][j + 1 >= cvs.cols ? 0 : j + 1];

          var cell_H = cvs.cells[i + 1 >= cvs.rows ? 0 : i + 1][j - 1 < 0 ? cvs.cols - 1 : j - 1];
          var cell_I = cvs.cells[i + 1 >= cvs.rows ? 0 : i + 1][j];
          var cell_J = cvs.cells[i + 1 >= cvs.rows ? 0 : i + 1][j + 1 >= cvs.cols ? 0 : j + 1];

          cell.nextStatus = rule(cell.status, [cell_A.status, cell_B.status, cell_C.status, cell_D.status, cell_F.status, cell_H.status, cell_I.status, cell_J.status]);

        } // end of for col
      } // end of for row
    } // end of upd_status

    function print(ctx, cvs) {

      for(var i = 0; i < cvs.rows; i++) {

        var row = cvs.cells[i];
        var y = i * cvs.cellSize;
        for(var j = 0; j < cvs.cols; j++) {

          var x = j * cvs.cellSize;

          var cell = row[j];

          if(cell.nextStatus == 1) {
            ctx.fillStyle = cell.color;
            ctx.fillRect(x, y, cvs.cellSize, cvs.cellSize);
          } else {
            ctx.clearRect(x, y, cvs.cellSize, cvs.cellSize);
          }

          cell.status = cell.nextStatus;
        }
      }
    } // end of print

    function Canvas(x, y, cellSize) {

      this.x = x;
      this.y = y;
      this.cellSize = cellSize;
      this.rows = Math.floor(y / cellSize);;
      this.cols = Math.floor(x / cellSize);;

      var cells = new Array(this.rows);

      for(var i = 0; i < this.rows; i++) {

        var row = new Array(this.cols);

        for(var j = 0; j < this.cols; j++) {

          var status = Math.round(Math.random()); // 0 or 1
          var color = settings.aliveColor;

          row[j] = new Cell(i, j, color, status);
        }

        cells[i] = row;
      }

      this.cells = cells;

      function Cell(x, y, color, status) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.status = status;
        this.nextStatus = status;
        this.extPeriod = 0;
      } // end of Cell

    } // end of Canvas
    
  }; // end of $.fn.ca2d
})(jQuery);