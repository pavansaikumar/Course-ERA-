var util;
(function (util) {
    var PriQ = (function () {
        function PriQ() {
            this.root = null;
        }
        PriQ.prototype.priq_adjust = function (balance_pt, deleting) {
            var left = new PriQ.PriQElt();
            var right = new PriQ.PriQElt();
            for (; balance_pt != null; balance_pt = balance_pt.parent) {
                var new_dist = void 0;
                left = balance_pt.left;
                right = balance_pt.right;
                if (right == null)
                    new_dist = 1;
                else if (left == null) {
                    balance_pt.left = right;
                    balance_pt.right = null;
                    new_dist = 1;
                }
                else if (left.dist < right.dist) {
                    balance_pt.left = right;
                    balance_pt.right = left;
                    new_dist = left.dist + 1;
                }
                else {
                    new_dist = right.dist + 1;
                }
                if (new_dist !== balance_pt.dist)
                    balance_pt.dist = new_dist;
                else if (deleting !== 0)
                    break;
            }
            ;
        };
        PriQ.prototype.priq_merge = function (otherq) {
            var parent = new PriQ.PriQElt();
            var temp = new PriQ.PriQElt();
            var x = new PriQ.PriQElt();
            var y = new PriQ.PriQElt();
            if (otherq.root == null) {
                if (this.root != null)
                    this.root.parent = null;
                return;
            }
            else if (this.root == null) {
                this.root = otherq.root;
                if (this.root != null)
                    this.root.parent = null;
                return;
            }
            else {
                y = otherq.root;
                if (y.costs_less(this.root)) {
                    temp = this.root;
                    this.root = y;
                    y = temp;
                }
                this.root.parent = null;
                parent = this.root;
                x = this.root.right;
                while ((x != null)) {
                    if (y.costs_less(x)) {
                        temp = x;
                        x = y;
                        y = temp;
                    }
                    x.parent = parent;
                    parent.right = x;
                    parent = x;
                    x = x.right;
                }
                ;
                parent.right = y;
                y.parent = parent;
                this.priq_adjust(parent, 0);
            }
        };
        PriQ.prototype.priq_gethead = function () {
            return this.root;
        };
        PriQ.prototype.priq_rmhead = function () {
            var top;
            var temp1 = new PriQ();
            var temp2 = new PriQ();
            if ((top = this.root) == null)
                return null;
            temp1.root = top.left;
            temp2.root = top.right;
            temp1.priq_merge(temp2);
            this.root = temp1.root;
            return top;
        };
        PriQ.prototype.priq_add = function (item) {
            var temp = new PriQ();
            item.left = null;
            item.right = null;
            item.parent = null;
            item.dist = 1;
            temp.root = item;
            this.priq_merge(temp);
        };
        PriQ.prototype.priq_delete = function (item) {
            var parent = new PriQ.PriQElt();
            var q1 = new PriQ();
            var q2 = new PriQ();
            parent = item.parent;
            q1.root = item.right;
            q2.root = item.left;
            q1.priq_merge(q2);
            if (parent == null)
                this.root = q1.root;
            else if (parent.right === item)
                parent.right = q1.root;
            else
                parent.left = q1.root;
            if (q1.root != null)
                q1.root.parent = parent;
            this.priq_adjust(parent, 1);
        };
        return PriQ;
    }());
    util.PriQ = PriQ;
    PriQ["__class"] = "util.PriQ";
    (function (PriQ) {
        var PriQElt = (function () {
            function PriQElt() {
                this.left = null;
                this.right = null;
                this.parent = null;
                this.dist = 0;
                this.cost0 = 0;
                this.cost1 = 0;
                this.tie1 = 0;
                this.tie2 = 0;
            }
            PriQElt.prototype.costs_less = function (oqe) {
                if (this.cost0 < oqe.cost0)
                    return (true);
                else if (this.cost0 > oqe.cost0)
                    return (false);
                else if (this.cost1 < oqe.cost1)
                    return (true);
                else if (this.cost1 > oqe.cost1)
                    return (false);
                else if (this.tie1 > oqe.tie1)
                    return (true);
                else if (this.tie1 < oqe.tie1)
                    return (false);
                else if (this.tie2 > oqe.tie2)
                    return (true);
                else
                    return (false);
            };
            return PriQElt;
        }());
        PriQ.PriQElt = PriQElt;
        PriQElt["__class"] = "util.PriQ.PriQElt";
    })(PriQ = util.PriQ || (util.PriQ = {}));
})(util || (util = {}));

