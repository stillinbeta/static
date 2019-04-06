function Rect(x1, y1, x2, y2, border, fg, bg) {
    var self = this;
    self.x1 = x1;
    self.y1 = y1;
    self.x2 = x2;
    self.y2 = y2;
    self.border = border;
    self.fg = fg;
    self.bg = bg;

    self.draw = function(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = self.fg;
        ctx.lineWidth = self.border;
        ctx.fillStyle = self.bg;
        ctx.moveTo(self.x1, self.y1);
        ctx.lineTo(self.x2, self.y1);
        ctx.lineTo(self.x2, self.y2);
        ctx.lineTo(self.x1, self.y2);
        ctx.lineTo(self.x1, self.y1);
        ctx.stroke();
        ctx.fill();

        /*ctx.fillStyle = self.fg;
        ctx.fillRect(self.x1, self.y1, self.x2 - self.x1, y2 - y1);
        ctx.fillStyle = self.bg;
        ctx.fillRect(self.x1 + self.border,
                      self.y1 + self.border,
                      (self.x2 - self.x1) - (self.border * 2),
                      (self.y2 - self.y1) - (self.border * 2)); */
    }

    self.inside = function(x, y) {


        return (Math.min(self.x1, self.x2) <= x &&
                x <= Math.max(self.x1, self.x2) &&
                Math.min(self.y1, self.y2) <= y &&
                y <= Math.max(self.y1, self.y2));
    }
}

function Line (x1, y1, x2, y2, border, fg, bg) {
    var self = this;

    self.x1 = x1;
    self.y1 = y1;
    self.x2 = x2;
    self.y2 = y2;
    self.border = border;
    self.fg = fg;
    self.bg = bg;

    self.draw = function(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = self.fg;
        ctx.lineWidth = self.border;
        ctx.moveTo(self.x1, self.y1);
        ctx.lineTo(self.x2, self.y2);
        ctx.stroke();
    }

    self.inside = function(x, y) {
        // "Fudge factor" of 5 pixels"
        var fudge = 10;
        return (
            y <= self.y1 - ((self.y2-self.y1) / (self.x2 - self.x1)) * (self.x1 - x) + fudge &&
            y >= self.y1 - ((self.y2-self.y1) / (self.x2 - self.x1)) * (self.x1 - x) - fudge);
    }
}

function Triangle(x1, y1, x2, y2, border, fg, bg) {
    var self = this;

    self.x1 = x1;
    self.y1 = y1;
    self.x2 = x2;
    self.y2 = y2;
    self.border = border;
    self.fg = fg;
    self.bg = bg;

    self.draw = function(ctx) {
        ctx.strokeStyle = self.fg;
        ctx.fillStyle = self.bg;
        ctx.lineWidth = border;
        ctx.beginPath();
        ctx.moveTo(self.x1, self.y1);
        ctx.lineTo(self.x2, self.y2);
        ctx.lineTo(self.x1, self.y2);
        ctx.lineTo(self.x1, self.y1);
        ctx.stroke();
        ctx.fill()
    }

    self.inside = function(x, y) {
        // Left x, Right x
        var lx = Math.min(self.x1, self.x2);
        var rx = Math.max(self.x1, self.x2);
        // Bottom y, Top y
        var by = Math.min(self.y1, self.y2);
        var ty = Math.max(self.y1, self.y2);

        var mxpb = by - ((ty-by) / (rx - lx)) * (lx - x);
        //var mxpb = self.y1 - ((self.y2-self.y1) / (self.x2 - self.x1)) * (self.x1 - x);
        return (lx <= x && x <= rx &&
                by <= y && y <= ty &&
                ((self.x1 > self.x2 && y <= mxpb) ||
                 (self.x1 < self.x2 && y >= mxpb)));
    }

}

function drawHandles(shape) {
    var bg = '#5AA3FF';

    shape.draw(actx);
    actx.fillStyle = bg;
    actx.fillRect(shape.x1 - 3, shape.y1 - 3, 6, 6);
    actx.fillRect(shape.x2 - 3, shape.y2 - 3, 6, 6);
}
